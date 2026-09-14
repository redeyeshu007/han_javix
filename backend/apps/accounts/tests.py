from django.urls import reverse
from rest_framework.test import APITestCase

from .models import User
from apps.builders.models import BuilderCompany
from apps.projects.models import Project


class LoginViewTests(APITestCase):
    def setUp(self):
        # Deliberately use a username that differs from email to cover legacy
        # accounts created before email became the login field.
        self.user = User.objects.create_user(
            username='legacy-admin',
            email='admin@example.com',
            password='CorrectPassword123!',
            role='SUPER_ADMIN',
        )

    def test_login_uses_email_lookup_and_returns_a_jwt(self):
        response = self.client.post(
            reverse('api_v1:login'),
            {'email': self.user.email, 'password': 'CorrectPassword123!'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['email'], self.user.email)
        self.assertIn('refresh_token', response.cookies)

    def test_login_rejects_an_invalid_password(self):
        response = self.client.post(
            reverse('api_v1:login'),
            {'email': self.user.email, 'password': 'wrong-password'},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['non_field_errors'], ['Invalid email or password'])


class TeamMemberApiTests(APITestCase):
    def setUp(self):
        self.builder = BuilderCompany.objects.create(
            company_name='Test Builder', contact_name='Test Owner', contact_number='1234567890',
            email='builder@example.com',
        )
        self.owner = User.objects.create_user(
            username='owner@example.com', email='owner@example.com', password='OwnerPass123!',
            role='BUILDER_OWNER', builder_company=self.builder,
        )
        self.project = Project.objects.create(
            name='Test Project', builder_company=self.builder, project_type='apartment',
            address='Test address', created_by=self.owner,
        )
        self.client.force_authenticate(self.owner)

    def test_builder_owner_creates_real_team_account_with_project_access(self):
        response = self.client.post('/api/v1/accounts/team/', {
            'name': 'Site Engineer', 'email': 'engineer@example.com', 'phone': '1234567890',
            'role': 'SITE_ENGINEER', 'password': 'MemberPass123!', 'is_active': True,
            'assigned_project_ids': [self.project.id],
        }, format='json')

        self.assertEqual(response.status_code, 201)
        member = User.objects.get(email='engineer@example.com')
        self.assertEqual(member.username, member.email)
        self.assertTrue(member.check_password('MemberPass123!'))
        self.assertEqual(member.role, 'SITE_ENGINEER')
        self.assertEqual(list(member.assigned_projects.all()), [self.project])

    def test_non_builder_owner_cannot_create_team_account(self):
        self.owner.role = 'PROJECT_ADMIN'
        self.owner.save(update_fields=['role'])
        response = self.client.post('/api/v1/accounts/team/', {
            'name': 'Blocked User', 'email': 'blocked@example.com', 'role': 'PROJECT_ADMIN',
            'password': 'MemberPass123!', 'is_active': True, 'assigned_project_ids': [self.project.id],
        }, format='json')
        self.assertEqual(response.status_code, 403)
