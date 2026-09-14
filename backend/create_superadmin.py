import os
import django
from django.core.management import call_command

os.environ["POSTGRES_HOST"] = "127.0.0.1"
os.environ["POSTGRES_USER"] = "handoverly"
os.environ["POSTGRES_PASSWORD"] = "change-me"
os.environ["POSTGRES_DB"] = "handoverly"
os.environ["POSTGRES_PORT"] = "5432"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

email = 'admin@handoverly.com'
password = 'Admin@1234'

if not User.objects.filter(email=email).exists():
    user = User.objects.create_superuser(username='admin', email=email, password=password, is_active=True, is_staff=True)
    print("Super Admin created.")
else:
    print("Super Admin already exists.")
    
print("Total users in DB:", User.objects.count())

# Verify models
from django.apps import apps
from django.db.models import Count

print("Business Records Verification:")
for model in apps.get_models():
    # Only show counts for our app models
    if 'apps' in model.__module__:
        print(f"{model.__name__}: {model.objects.count()}")

