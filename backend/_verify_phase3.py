# Phase 3 verification — customer allocation write path.
# Run: ./venv/Scripts/python.exe manage.py shell < _verify_phase3.py
import json
import random
import time
import urllib.error
import urllib.request

from django.contrib.auth import get_user_model
from django.apps import apps
from django.db import OperationalError, connections
from rest_framework_simplejwt.tokens import RefreshToken

BASE = 'http://localhost:8000/api/v1'
U = get_user_model()
Unit = apps.get_model('projects', 'Unit')
BuilderCompany = apps.get_model('builders', 'BuilderCompany')
Defect = apps.get_model('inspections', 'Defect')

RESULTS = []
CREATED_EMAILS = []
CREATED_COMPANY_IDS = []


def check(name, cond, evidence=''):
    RESULTS.append((name, bool(cond), evidence))
    print(('PASS' if cond else 'FAIL') + ' | ' + name + ' | ' + str(evidence)[:300])


def orm_retry(fn, tries=4):
    """Supabase pooler occasionally drops idle connections — force a reconnect
    and retry the ORM read/write instead of dying mid-matrix."""
    last = None
    for attempt in range(tries):
        try:
            return fn()
        except OperationalError as e:
            last = e
            print('WARN | transient pooler drop, reconnecting (attempt %s)' % (attempt + 1))
            time.sleep(2 * (attempt + 1))
            connections['default'].close()
    raise last


def http(method, path, token=None, body=None, retries=3, retry_5xx=True):
    """HTTP JSON helper; retries connection drops while the pooler warms up and
    transient 5xx (only for idempotent calls — pass retry_5xx=False for
    non-idempotent creates)."""
    last_exc = None
    for attempt in range(retries):
        req = urllib.request.Request(BASE + path, method=method)
        req.add_header('Content-Type', 'application/json')
        if token:
            req.add_header('Authorization', 'Bearer ' + token)
        data = json.dumps(body).encode() if body is not None else None
        try:
            with urllib.request.urlopen(req, data=data, timeout=90) as r:
                return r.status, json.loads(r.read().decode() or '{}')
        except urllib.error.HTTPError as e:
            try:
                payload = json.loads(e.read().decode() or '{}')
            except Exception:
                payload = {}
            if e.code >= 500 and retry_5xx and attempt < retries - 1:
                last_exc = 'HTTP %s' % e.code
                time.sleep(3 * (attempt + 1))
                continue
            return e.code, payload
        except Exception as e:  # connection reset while pooler spins up
            last_exc = e
            time.sleep(2 * (attempt + 1))
    raise last_exc


def orm_u2():
    return orm_retry(lambda: Unit.objects.filter(pk=2)
                     .values_list('customer_id', flat=True).first())


def orm_u3():
    return orm_retry(lambda: Unit.objects.filter(pk=3)
                     .values_list('customer_id', flat=True).first())


def orm_zztest_count():
    return orm_retry(lambda: U.objects.filter(email__istartswith='zztest.').count())


def user_count():
    return orm_retry(lambda: U.objects.count())


def team_rows(token):
    st, data = http('GET', '/accounts/team/', token=token)
    rows = data.get('results', data) if isinstance(data, dict) else data
    return st, rows


def cleanup():
    """Delete every fixture this script created (idempotent, drop-resilient)."""
    deleted_users = orm_retry(
        lambda: U.objects.filter(email__istartswith='zztest.').delete()[0])
    deleted_cos = orm_retry(
        lambda: BuilderCompany.objects.filter(
            company_name__startswith='ZZTEST Holding Co').delete()[0])
    print('CLEANUP | users_deleted=%s companies_deleted=%s' % (deleted_users, deleted_cos))


try:
    rand = ''.join(random.choice('abcdefghijkmnpqrstuvwxy23456789') for _ in range(6))
    EMAIL_A = 'zztest.alloc.%s@example.com' % rand
    EMAIL_B = 'zztest.allocb.%s@example.com' % rand
    EMAIL_O = 'zztest.allocowner.%s@example.com' % rand

    # ---------------------------------------------------------------- 0. BASELINE
    user_count0 = user_count()
    zz0 = orm_zztest_count()
    u2_0, u3_0 = orm_u2(), orm_u3()
    print('BASELINE | users=%s zztest=%s unit2.customer=%s unit3.customer=%s'
          % (user_count0, zz0, u2_0, u3_0))
    check('baseline: no zztest users', zz0 == 0, 'count=%s' % zz0)
    check('baseline: units 2+3 unassigned', u2_0 is None and u3_0 is None,
          'u2=%s u3=%s' % (u2_0, u3_0))

    st, login = http('POST', '/accounts/login/',
                     body={'email': 'admin@handoverly.com', 'password': 'Admin@1234'})
    ADMIN = login.get('access')
    check('admin login', st == 200 and bool(ADMIN), 'status=%s' % st)

    st, rows0 = team_rows(ADMIN)
    team_baseline = len(rows0) if st == 200 else -1
    check('baseline: team rows = 9', team_baseline == 9, 'rows=%s status=%s' % (team_baseline, st))

    # ------------------------------------------------- 1. ASSIGN-CREATE (unit 2)
    st, resp = http('POST', '/projects/units/2/assign-customer/', token=ADMIN, body={
        'name': 'ZZTEST Alloc Customer', 'email': EMAIL_A,
        'phone': '+91 90000 00001', 'password': 'ZzTest@12345',
    })
    created_a = U.objects.filter(email__iexact=EMAIL_A).first()
    check('ASSIGN-CREATE http 200', st == 200, 'status=%s body=%s' % (st, json.dumps(resp)[:200]))
    check('ASSIGN-CREATE account_created flag',
          resp.get('account_created') is True, str(resp.get('account_created')))
    check('ASSIGN-CREATE customer block {id,name,email,phone}',
          isinstance(resp.get('customer'), dict) and
          set(resp['customer']) >= {'id', 'name', 'email', 'phone'} and
          resp['customer']['email'] == EMAIL_A,
          str(resp.get('customer')))
    check('ASSIGN-CREATE unit.customer_id == new user id (ORM)',
          created_a is not None
          and resp.get('unit', {}).get('customer') == created_a.id
          and resp.get('unit', {}).get('customerId') == created_a.id
          and orm_u2() == created_a.id,
          'unit2.customer=%s created=%s' % (orm_u2(), created_a.id if created_a else None))
    check('ASSIGN-CREATE user count +1, no orphans',
          user_count() == user_count0 + 1, 'count=%s' % user_count())

    # workspace reflects assignment immediately
    st, ws = http('GET', '/projects/units/2/workspace/', token=ADMIN)
    ws_cust = (ws.get('unit') or {}).get('customer') if isinstance(ws, dict) else None
    check('WORKSPACE shows customer after assign', st == 200 and
          ws_cust and str(ws_cust.get('id')) == str(created_a.id)
          and ws_cust.get('email') == EMAIL_A,
          'status=%s customer=%s' % (st, ws_cust))

    # refresh persistence: re-GET workspace + team allocated_units
    st, ws2 = http('GET', '/projects/units/2/workspace/', token=ADMIN)
    ws_cust2 = (ws2.get('unit') or {}).get('customer') if isinstance(ws2, dict) else None
    check('WORKSPACE re-GET persists customer', ws_cust2 and str(ws_cust2.get('id')) == str(created_a.id),
          'customer=%s' % ws_cust2)
    st, rows = team_rows(ADMIN)
    row_a = next((r for r in rows if r.get('email') == EMAIL_A), None)
    au = (row_a or {}).get('allocated_units')
    check('TEAM allocated_units shows unit 101 + project',
          st == 200 and au and au[0]['id'] == 2 and au[0]['unit_number'] == '101'
          and au[0].get('project_name'),
          'allocated_units=%s' % au)

    # ------------------------------------------------------ 2. CUSTOMER PORTAL
    st, cust_login = http('POST', '/accounts/login/',
                          body={'email': EMAIL_A, 'password': 'ZzTest@12345'})
    CUST = cust_login.get('access')
    login_user_unit = (cust_login.get('user') or {}).get('unit')
    check('CUSTOMER login returns unit summary on user payload',
          st == 200 and login_user_unit and login_user_unit.get('unit_id') == 2,
          'status=%s unit=%s' % (st, login_user_unit))
    st, me = http('GET', '/accounts/me/', token=CUST)
    me_unit = me.get('unit')
    check('CUSTOMER /accounts/me/ unit summary {unit_id,unit_number,project_id,project_name}',
          st == 200 and me_unit and me_unit.get('unit_id') == 2
          and me_unit.get('unit_number') == '101'
          and 'project_id' in me_unit and 'project_name' in me_unit,
          'status=%s unit=%s' % (st, me_unit))
    print('MAPPING | AuthContext.mapBackendToUser: '
          'user.unitId <- me.unit.unit_id (%s), user.projectId <- me.unit.project_id (%s), '
          'user.unitNumber <- me.unit.unit_number (%s), user.projectName <- me.unit.project_name (%s) '
          '=> CustomerHome.tsx:29-36 resolves (units.find(u => u.id === user.unitId), '
          'projects.find(p => p.id === user.projectId))'
          % (me_unit and me_unit.get('unit_id'), me_unit and me_unit.get('project_id'),
             me_unit and me_unit.get('unit_number'), me_unit and me_unit.get('project_name')))

    # -------------------------------------------------------- 3. REPLACE (A -> B)
    st, resp = http('POST', '/projects/units/2/assign-customer/', token=ADMIN, body={
        'name': 'ZZTEST Alloc B', 'email': EMAIL_B,
        'phone': '+91 90000 00002', 'password': 'ZzTest@12345',
    })
    created_b = U.objects.filter(email__iexact=EMAIL_B).first()
    check('REPLACE assign B http 200', st == 200 and created_b is not None,
          'status=%s created=%s' % (st, created_b.id if created_b else None))
    check('REPLACE unit2.customer flips to B (ORM)', orm_u2() == created_b.id,
          'unit2.customer=%s B=%s' % (orm_u2(), created_b.id if created_b else None))
    check('REPLACE both accounts still exist (ORM)',
          U.objects.filter(email__in=[EMAIL_A, EMAIL_B]).count() == 2
          and user_count() == user_count0 + 2,
          'count=%s' % user_count())

    # ------------------------------------------------------------ 4. UNASSIGN u2
    st, resp = http('POST', '/projects/units/2/unassign-customer/', token=ADMIN)
    check('UNASSIGN u2 http 200 + released id', st == 200
          and resp.get('released_customer_id') == created_b.id,
          'status=%s released=%s' % (st, resp.get('released_customer_id')))
    check('UNASSIGN u2 customer NULL (ORM), both accounts kept (ORM)',
          orm_u2() is None
          and U.objects.filter(email__in=[EMAIL_A, EMAIL_B]).count() == 2,
          'unit2.customer=%s' % orm_u2())

    # ------------------------------------------------- 5. LINK-EXISTING (unit 3)
    count_before_link = user_count()
    st, resp = http('POST', '/projects/units/3/assign-customer/', token=ADMIN, body={
        'email': EMAIL_B, 'phone': '+91 90000 00002',
    })
    check('LINK-EXISTING http 200, no new account', st == 200
          and resp.get('account_created') is False
          and user_count() == count_before_link,
          'status=%s account_created=%s users=%s' % (st, resp.get('account_created'), user_count()))
    check('LINK-EXISTING unit3.customer == B (ORM)', orm_u3() == created_b.id,
          'unit3.customer=%s B=%s' % (orm_u3(), created_b.id if created_b else None))
    st, resp = http('POST', '/projects/units/3/unassign-customer/', token=ADMIN)
    check('LINK-EXISTING u3 unassigned (ORM), account kept', st == 200
          and orm_u3() is None and U.objects.filter(email__iexact=EMAIL_B).exists(),
          'unit3.customer=%s' % orm_u3())

    # -------------------------------------------------------------- 6. NEGATIVES
    # 6a. cross-company duplicate email (fixture: second company + its customer)
    fixture_co = orm_retry(lambda: BuilderCompany.objects.create(
        company_name='ZZTEST Holding Co (phase3 fixture)',
        contact_name='ZZTEST Contact', contact_number='+91 90000 00009',
        email='zztest.co.%s@example.com' % rand,
    ))
    CREATED_COMPANY_IDS.append(fixture_co.id)
    cross_cust = orm_retry(lambda: U.objects.create_user(
        username='zztest.crossco.%s' % rand, email='zztest.crossco.%s@example.com' % rand,
        password='ZzTest@12345', first_name='ZZTEST', last_name='CrossCo',
        role='CUSTOMER', builder_company=fixture_co,
    ))
    CREATED_EMAILS.append(cross_cust.email)
    count_before = user_count()
    st, resp = http('POST', '/projects/units/2/assign-customer/', token=ADMIN, body={
        'name': 'ZZTEST Should Not Exist', 'email': cross_cust.email,
        'phone': '+91 90000 00003', 'password': 'ZzTest@12345',
    })
    check('NEG cross-company email -> 400 + meaningful', st == 400
          and 'different builder company' in json.dumps(resp),
          'status=%s body=%s' % (st, json.dumps(resp)[:200]))
    check('NEG cross-company: no orphan user, unit untouched (atomicity)',
          user_count() == count_before and orm_u2() is None,
          'users=%s unit2.customer=%s' % (user_count(), orm_u2()))

    # 6b. existing non-CUSTOMER role email (BUILDER_OWNER id 8)
    owner = orm_retry(lambda: U.objects.get(pk=8))
    count_before = user_count()
    st, resp = http('POST', '/projects/units/2/assign-customer/', token=ADMIN, body={
        'name': 'ZZTEST Role', 'email': owner.email,
        'phone': '+91 90000 00004', 'password': 'ZzTest@12345',
    })
    check('NEG non-CUSTOMER role email -> 400 + meaningful', st == 400
          and 'owner' in json.dumps(resp).lower(),
          'status=%s body=%s' % (st, json.dumps(resp)[:200]))
    check('NEG non-CUSTOMER: no orphan user, unit untouched',
          user_count() == count_before and orm_u2() is None,
          'users=%s unit2.customer=%s' % (user_count(), orm_u2()))

    # 6c. missing password on create path
    count_before = user_count()
    st, resp = http('POST', '/projects/units/2/assign-customer/', token=ADMIN, body={
        'name': 'ZZTEST NoPw', 'email': 'zztest.nopw.%s@example.com' % rand,
        'phone': '+91 90000 00005',
    })
    check('NEG missing password on create -> 400 meaningful', st == 400
          and 'password' in json.dumps(resp).lower(),
          'status=%s body=%s' % (st, json.dumps(resp)[:200]))
    check('NEG missing password: no orphan user, unit untouched',
          user_count() == count_before and orm_u2() is None,
          'users=%s unit2.customer=%s' % (user_count(), orm_u2()))

    # 6d. invalid email
    count_before = user_count()
    st, resp = http('POST', '/projects/units/2/assign-customer/', token=ADMIN, body={
        'name': 'ZZTEST BadEmail', 'email': 'not-an-email',
        'phone': '+91 90000 00006', 'password': 'ZzTest@12345',
    })
    check('NEG invalid email -> 400 meaningful', st == 400
          and 'valid email' in json.dumps(resp).lower(),
          'status=%s body=%s' % (st, json.dumps(resp)[:200]))
    check('NEG invalid email: no orphan user, unit untouched',
          user_count() == count_before and orm_u2() is None,
          'users=%s unit2.customer=%s' % (user_count(), orm_u2()))

    # ------------------------------------------------------------ 7. PERMISSIONS
    owner_token = str(RefreshToken.for_user(owner).access_token)
    st, resp = http('POST', '/projects/units/2/assign-customer/', token=owner_token, body={
        'name': 'ZZTEST Alloc Owner', 'email': EMAIL_O,
        'phone': '+91 90000 00007', 'password': 'ZzTest@12345',
    })
    created_o = U.objects.filter(email__iexact=EMAIL_O).first()
    check('PERM BUILDER_OWNER (id 8) can assign own unit', st == 200
          and created_o is not None and orm_u2() == created_o.id,
          'status=%s unit2.customer=%s' % (st, orm_u2()))
    st, resp = http('POST', '/projects/units/2/unassign-customer/', token=owner_token)
    check('PERM BUILDER_OWNER can unassign own unit', st == 200 and orm_u2() is None,
          'status=%s unit2.customer=%s' % (st, orm_u2()))

    contractor = orm_retry(lambda: U.objects.get(pk=14))
    contractor_token = str(RefreshToken.for_user(contractor).access_token)
    count_before = user_count()
    st, resp = http('POST', '/projects/units/2/assign-customer/', token=contractor_token, body={
        'name': 'ZZTEST Denied', 'email': 'zztest.denied.%s@example.com' % rand,
        'phone': '+91 90000 00008', 'password': 'ZzTest@12345',
    })
    check('PERM CONTRACTOR assign -> 403', st == 403,
          'status=%s body=%s' % (st, json.dumps(resp)[:120]))
    st, resp = http('POST', '/projects/units/2/unassign-customer/', token=contractor_token)
    check('PERM CONTRACTOR unassign -> 403', st == 403, 'status=%s' % st)
    check('PERM CONTRACTOR: nothing written (atomicity)',
          user_count() == count_before and orm_u2() is None,
          'users=%s unit2.customer=%s' % (user_count(), orm_u2()))

    # ------------------------------------------------------------- 8. REGRESSION
    st, resp = http('PATCH', '/projects/units/2/', token=ADMIN,
                    body={'unit_number': '101', 'floor': 3})
    u2_row = Unit.objects.filter(pk=2).values_list('unit_number', 'floor_id').first()
    check('REGRESSION PATCH unit 2 -> 200 unchanged', st == 200
          and u2_row == ('101', 3), 'status=%s row=%s' % (st, u2_row))

    st, rows = team_rows(ADMIN)
    check('REGRESSION GET /accounts/team/ 200 + allocated_units present',
          st == 200 and all('allocated_units' in r for r in rows),
          'status=%s rows=%s' % (st, len(rows)))

    st, ws = http('GET', '/projects/units/2/workspace/', token=ADMIN)
    check('REGRESSION GET workspace 200', st == 200, 'status=%s' % st)

    st, resp = http('POST', '/inspections/defects/', token=ADMIN, retry_5xx=False, body={
        'unit': 2, 'description': 'ZZTEST phase3 regression defect at living room',
        'priority': 'medium',
    })
    defect_id = resp.get('id')
    check('REGRESSION defect create (Phase-1 payload) -> 201', st in (200, 201),
          'status=%s id=%s body=%s' % (st, defect_id, json.dumps(resp)[:160]))
    if defect_id:
        st_del, _ = http('DELETE', '/inspections/defects/%s/' % defect_id, token=ADMIN)
        check('REGRESSION defect delete cleanup', st_del in (200, 202, 204)
              and not Defect.objects.filter(pk=defect_id).exists(),
              'status=%s' % st_del)

    # ---------------------------------------------------------------- 9. CLEANUP
    cleanup()
    check('CLEANUP zero zztest users (ORM)', orm_zztest_count() == 0,
          'count=%s' % orm_zztest_count())
    check('CLEANUP units 2+3 customer NULL (ORM)', orm_u2() is None and orm_u3() is None,
          'u2=%s u3=%s' % (orm_u2(), orm_u3()))
    check('CLEANUP fixture company removed (ORM)',
          BuilderCompany.objects.filter(company_name__startswith='ZZTEST Holding Co').count() == 0,
          'companies=%s' % BuilderCompany.objects.count())
    check('CLEANUP user count back to baseline', user_count() == user_count0,
          'count=%s baseline=%s' % (user_count(), user_count0))
    st, rows = team_rows(ADMIN)
    check('CLEANUP /accounts/team/ back to baseline 9 rows', st == 200 and len(rows) == 9,
          'rows=%s status=%s' % (len(rows), st))
    st, ws = http('GET', '/projects/units/2/workspace/', token=ADMIN)
    check('CLEANUP workspace customer null', st == 200
          and (ws.get('unit') or {}).get('customer') is None,
          'customer=%s' % (ws.get('unit') or {}).get('customer'))

finally:
    cleanup()
    print('\n===== SUMMARY: %s passed, %s failed =====' % (
        sum(1 for _, ok, _ in RESULTS if ok),
        sum(1 for _, ok, _ in RESULTS if not ok)))
    for name, ok, ev in RESULTS:
        if not ok:
            print('FAILED: %s | %s' % (name, ev))
