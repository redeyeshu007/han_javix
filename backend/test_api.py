import sys
sys.stdout = open('log.txt', 'w')
sys.stderr = sys.stdout

from rest_framework.test import APIClient
from apps.accounts.models import User
from rest_framework_simplejwt.tokens import RefreshToken

user = User.objects.filter(role='ACCOUNTS').first()
if user:
    print('Testing as', user.email)
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    res = client.get('/projects/units/')
    print('Units status:', res.status_code)
    print('Units response:', res.data)
    
    res = client.get('/accounts/team/?role=CUSTOMER')
    print('Customers status:', res.status_code)
    print('Customers response:', res.data)
else:
    print('No ACCOUNTS user found.')
