import os
import subprocess
import time
from datetime import datetime

os.chdir("backend")
os.environ["POSTGRES_HOST"] = "localhost"
os.environ["POSTGRES_USER"] = "handoverly"
os.environ["POSTGRES_PASSWORD"] = "change-me"
os.environ["POSTGRES_DB"] = "handoverly"
os.environ["POSTGRES_PORT"] = "5432"

timestamp = int(time.time())
backup_file = f"../handoverly_pre_reset_backup_{timestamp}.sql"

print("1. Creating database backup...")
backup_cmd = f"wsl -e bash -c \"PGPASSWORD=change-me pg_dump -U handoverly -h localhost handoverly > /mnt/d/JAVIX/Export/Handoverly_AI/handoverly_pre_reset_backup_{timestamp}.sql\""
res = subprocess.run(backup_cmd, shell=True, capture_output=True, text=True)
if res.returncode != 0:
    print("Backup failed:", res.stderr)
    exit(1)
print(f"Backup created at {backup_file}")

print("\n2. Flushing the database...")
flush_cmd = r".\venv\Scripts\python.exe manage.py flush --no-input"
res = subprocess.run(flush_cmd, shell=True, capture_output=True, text=True)
if res.returncode != 0:
    print("Flush failed:", res.stderr)
    exit(1)
print("Database flushed.")

print("\n3. Creating super admin...")
# Create a python script to run in the django context to create the user
create_user_script = """
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@handoverly.com').exists():
    User.objects.create_superuser('admin@handoverly.com', 'Admin@1234', is_active=True)
    print("Super Admin created.")
else:
    print("Super Admin already exists.")
"""
with open("create_admin.py", "w") as f:
    f.write(create_user_script)

res = subprocess.run(r".\venv\Scripts\python.exe create_admin.py", shell=True, capture_output=True, text=True)
if res.returncode != 0:
    print("Create superadmin failed:", res.stderr)
    exit(1)
print(res.stdout.strip())
os.remove("create_admin.py")

print("\n4. Verifying Django...")
res = subprocess.run(r".\venv\Scripts\python.exe manage.py check", shell=True, capture_output=True, text=True)
print("Check output:\n", res.stderr if res.stderr else res.stdout)

res = subprocess.run(r".\venv\Scripts\python.exe manage.py showmigrations", shell=True, capture_output=True, text=True)
if " [X] " in res.stdout:
    print("Migrations intact.")
else:
    print("Migrations check output:", res.stdout[:500])

print("\nDone.")
