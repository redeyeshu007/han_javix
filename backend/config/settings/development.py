from .base import *
import dj_database_url
import os

DEBUG = True

# In development, you might want to allow wildcard or a larger set of hosts
if not ALLOWED_HOSTS or ALLOWED_HOSTS == ['']:
    ALLOWED_HOSTS = ['localhost', '127.0.0.1']

from dotenv import load_dotenv
from .base import BASE_DIR

# Explicitly load .env from BASE_DIR
load_dotenv(BASE_DIR / '.env')

# Database setup parsing from env variables
# CONN_MAX_AGE: persistent DB connections (seconds). The DB is a remote Supabase
# Postgres, so without this Django opens a fresh TCP+TLS connection per request
# (~2-3s overhead each). Env-overridable; 60 keeps idle connections for a minute.
CONN_MAX_AGE = int(os.environ.get('DB_CONN_MAX_AGE', '60'))

if os.environ.get('USE_SQLITE', 'false').lower() in ('true', '1', 'yes') or os.environ.get('DB_ENGINE', '') == 'sqlite':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
            'CONN_MAX_AGE': CONN_MAX_AGE,
        }
    }

else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'postgres'),
            'USER': os.environ.get('DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': os.environ.get('DB_HOST', 'db'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'CONN_MAX_AGE': CONN_MAX_AGE,
            # Bounded connect timeout: the remote pooler can stall; without
            # this a stalled connection hangs a request thread indefinitely.
            'OPTIONS': {'connect_timeout': int(os.environ.get('DB_CONNECT_TIMEOUT', '15'))},
        }
    }

# Logging configuration for development (console)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True
