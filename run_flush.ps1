$env:POSTGRES_HOST="localhost"
$env:POSTGRES_USER="handoverly"
$env:POSTGRES_PASSWORD="change-me"
$env:POSTGRES_DB="handoverly"
$env:POSTGRES_PORT="5432"

cd backend
.\venv\Scripts\python.exe manage.py flush --no-input
.\venv\Scripts\python.exe manage.py showmigrations
