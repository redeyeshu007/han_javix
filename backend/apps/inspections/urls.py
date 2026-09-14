from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    UnitInspectionViewSet,
    UnitInspectionResultViewSet,
    DefectViewSet,
    DefectActivityLogViewSet,
    PlatformChecklistViewSet,
    SiteEngineerDashboardView,
)

router = DefaultRouter()

router.register(r'platform-checklists', PlatformChecklistViewSet, basename='platform-checklists')
router.register(r'inspections', UnitInspectionViewSet, basename='unit-inspection')
router.register(r'inspection-results', UnitInspectionResultViewSet, basename='inspection-result')
router.register(r'defects', DefectViewSet, basename='defect')
router.register(r'defect-activity-logs', DefectActivityLogViewSet, basename='defect-activity-log')

urlpatterns = [
    path('site-engineer-dashboard/', SiteEngineerDashboardView.as_view(), name='site-engineer-dashboard'),
] + router.urls
