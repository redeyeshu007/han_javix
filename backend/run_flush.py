import os
import django
from django.core.management import call_command
from django.db import connection

os.environ["POSTGRES_HOST"] = "127.0.0.1"
os.environ["POSTGRES_USER"] = "handoverly"
os.environ["POSTGRES_PASSWORD"] = "change-me"
os.environ["POSTGRES_DB"] = "handoverly"
os.environ["POSTGRES_PORT"] = "5432"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

django.setup()

print("Killing other connections...")
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'handoverly'
          AND pid != pg_backend_pid();
    """)
print("Connections terminated.")

print("Flushing database...")
call_command('flush', interactive=False)
print("Database flushed successfully.")

print("Checking migrations...")
call_command('showmigrations')
