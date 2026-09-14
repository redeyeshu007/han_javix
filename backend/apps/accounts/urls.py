from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    LoginView,
    MeView,
    LogoutView,
    SuperAdminOnlyView,
    BuilderStaffOnlyView,
    CustomTokenRefreshView,
    TeamMemberViewSet,
)

router = DefaultRouter()
router.register('team', TeamMemberViewSet, basename='team')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('super-admin-only/', SuperAdminOnlyView.as_view(), name='super-admin-only'),
    path('builder-staff-only/', BuilderStaffOnlyView.as_view(),
         name='builder-staff-only'),
    path('', include(router.urls)),
]
