from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

from django.db import connections
from django.db.utils import OperationalError
import logging

logger = logging.getLogger(__name__)

def health_check(request):
    db_status = "ok"
    try:
        c = connections['default'].cursor()
        c.execute("SELECT 1;")
    except OperationalError as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unavailable"
    except Exception as e:
        logger.error(f"Unexpected database error in health check: {e}")
        db_status = "unavailable"
        
    status_code = 200 if db_status == "ok" else 503

    return JsonResponse({
        "status": "ok" if db_status == "ok" else "error",
        "database": db_status
    }, status=status_code)

api_v1_patterns = [
    path('health/', health_check, name='health-check'),
    path('accounts/', include('apps.accounts.urls')),
    path('builders/', include('apps.builders.urls')),
    path('platform-admin/', include('apps.platform_admin.urls')),
    path('projects/', include('apps.projects.urls')),
    path('inspections/', include('apps.inspections.urls')),
    path('documents/', include('apps.documents.urls')),
    path('handovers/', include('apps.handovers.urls')),
    path('notifications/', include('apps.notifications.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include((api_v1_patterns, 'api_v1'))),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
