from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BuilderCompanyViewSet
from .dashboard_views import BuilderDashboardViewSet

router = DefaultRouter()
router.register(r'companies', BuilderCompanyViewSet, basename='buildercompany')
router.register(r'dashboard-metrics', BuilderDashboardViewSet, basename='builder-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
