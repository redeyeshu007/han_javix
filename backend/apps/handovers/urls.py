from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentClearanceViewSet,
    HandoverRecordViewSet,
    ServiceRequestViewSet,
    AssociationTransitionViewSet,
    ChargeViewSet,
    PaymentRecordViewSet,
    AccountsSummaryView,
)

router = DefaultRouter()
router.register(r'payments', PaymentClearanceViewSet, basename='payment')
router.register(r'handovers', HandoverRecordViewSet, basename='handover')
router.register(r'service-requests', ServiceRequestViewSet, basename='service-request')
router.register(r'association-transitions', AssociationTransitionViewSet, basename='association-transition')
router.register(r'charges', ChargeViewSet, basename='charge')
router.register(r'payment-records', PaymentRecordViewSet, basename='payment-record')

urlpatterns = [
    path('', include(router.urls)),
    path('accounts-summary/', AccountsSummaryView.as_view(), name='accounts-summary'),
]
