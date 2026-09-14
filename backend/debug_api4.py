import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from rest_framework.test import APIClient
from apps.accounts.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import traceback

user = User.objects.filter(role='ACCOUNTS').first()
if user:
    print('Testing as', user.email)
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    try:
        res = client.get('/api/projects/units/')
        print('Units status:', res.status_code)
        if res.status_code == 200:
            print('Units count:', len(res.data.get('results', [])) if 'results' in res.data else len(res.data))
        else:
            print('Units response:', res.data)
            
        res = client.get('/api/accounts/team/?role=CUSTOMER')
        print('Customers status:', res.status_code)
        if res.status_code == 200:
            print('Customers count:', len(res.data.get('results', [])) if 'results' in res.data else len(res.data))
        else:
            print('Customers response:', res.data)
            
    except Exception as e:
        traceback.print_exc()
else:
    print('No ACCOUNTS user found.')
