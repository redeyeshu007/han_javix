import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import json
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from apps.handovers.views import ChargeViewSet
from apps.projects.models import Unit

User = get_user_model()
user = User.objects.filter(role='ACCOUNTS').first()
unit = Unit.objects.first()

if not user or not unit:
    print("User or Unit not found")
    exit()

print(f"Testing with user: {user.email}, unit: {unit.id}")

factory = RequestFactory()
request = factory.post(
    '/api/handovers/charges/', 
    data=json.dumps({
        'unit': unit.id,
        'charge_type': 'MAINTENANCE_DEPOSIT',
        'amount': 20000.00,
    }),
    content_type='application/json'
)
request.user = user

view = ChargeViewSet.as_view({'post': 'create'})

try:
    response = view(request)
    print("Response Status:", response.status_code)
    try:
        print("Response Data:", response.data)
    except:
        pass
except Exception as e:
    import traceback
    traceback.print_exc()
