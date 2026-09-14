from apps.accounts.models import User
u = User.objects.get(pk=9)
print("ORM member 9:", repr(u.first_name), repr(u.last_name), repr(u.phone))
