from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SubscriptionPlanViewSet,
    ChecklistViewSet,
    AuditLogViewSet,
    SubscriptionBillingViewSet,
    DashboardView,
)

router = DefaultRouter()
router.register(r'plans', SubscriptionPlanViewSet)
router.register(r'checklists', ChecklistViewSet)
router.register(r'audit-logs', AuditLogViewSet)
router.register(r'subscription-billing', SubscriptionBillingViewSet, basename='subscription-billing')

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('', include(router.urls)),
]
