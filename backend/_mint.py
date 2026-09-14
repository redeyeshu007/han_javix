from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.models import User
u = User.objects.get(email='sudharsanelangovan2005@gmail.com')
open('_owner_token.txt', 'w').write(str(RefreshToken.for_user(u).access_token))
print("minted for", u.email, u.role)
