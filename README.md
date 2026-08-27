# Handoverly AI - Builder Handover OS

This project is separated into a `frontend/` (Vite/React) and `backend/` (Django).

## Project Architecture
- **Frontend**: Vite + React, located in `frontend/`.
- **Backend**: Django + Django REST Framework + Celery + Channels, located in `backend/`.
- **Database**: PostgreSQL
- **Cache / Broker**: Redis
- **File Storage**: Cloudflare R2 (Prepared)

## Required Technologies
- Docker & Docker Compose (Recommended for local dev)
- Node.js & npm (If running frontend locally outside Docker)
- Python 3.12 (If running backend locally outside Docker)

## Local Development Setup

### Environment Variables
1. Copy `.env.example` to `.env` in the root directory.
2. Update any necessary credentials (e.g. `SECRET_KEY`, `POSTGRES_PASSWORD`).

### Running the Backend with Docker
```bash
# Build and start the services (Django, PostgreSQL, Redis)
docker compose up --build

# In a new terminal, run database migrations
docker compose exec backend python manage.py migrate

# Create a superuser account
docker compose exec backend python manage.py createsuperuser
```
The backend API health check will be available at: http://localhost:8000/api/v1/health/

### Running Celery (If needed for tasks)
```bash
# To run a Celery worker
docker compose exec backend celery -A config worker -l info
```

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend is configured to use `http://localhost:5173`. Make sure `VITE_API_BASE_URL=http://localhost:8000/api/v1` is set in the frontend's `.env` when you need it to communicate with the backend.

## Testing
To run Django tests:
```bash
docker compose exec backend pytest
```
