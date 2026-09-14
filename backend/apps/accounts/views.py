from .permissions import IsSuperAdmin, IsAnyOfRoles
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .serializers import (
    LoginSerializer, UserSerializer, TeamMemberSerializer, customer_unit_summary,
)
from .utils import get_accounts_assigned_project
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets
from rest_framework.decorators import action
from django.db.models import Prefetch


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = UserSerializer(request.user).data
        # CUSTOMER portal resolves its unit from the real Unit.customer
        # relationship (same helper the login response uses).
        if request.user.role == 'CUSTOMER':
            data['unit'] = customer_unit_summary(request.user)
        return Response(data)
        
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)

        user_payload = UserSerializer(user).data
        # The frontend maps the login response straight into its auth context
        # without re-calling /accounts/me/, so CUSTOMER logins must carry the
        # unit summary too — otherwise the portal only resolves after a reload.
        if user.role == 'CUSTOMER':
            user_payload['unit'] = customer_unit_summary(user)

        response = Response({
            'access': str(refresh.access_token),
            'user': user_payload,
        }, status=status.HTTP_200_OK)
        
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=False, # Set to True in production (HTTPS)
            samesite='Lax'
        )
        return response


class SuperAdminOnlyView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        return Response({"message": "Welcome Super Admin"})


class BuilderStaffOnlyView(APIView):
    permission_classes = [IsAnyOfRoles]
    allowed_roles = ['builder_owner', 'project_admin']

    def get(self, request):
        return Response({"message": "Welcome Builder-side staff"})


class CustomTokenRefreshView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"error": "No refresh token found"}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            token = RefreshToken(refresh_token)
            return Response({
                'access': str(token.access_token),
            })
        except TokenError:
            return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')
        
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except (TokenError, KeyError):
                pass
        return response


class TeamMemberViewSet(viewsets.ModelViewSet):
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        from .models import User as UserModel
        if user.role == 'SUPER_ADMIN':
            qs = UserModel.objects.exclude(role='SUPER_ADMIN').order_by('first_name', 'last_name')
        elif user.role == 'PROJECT_ADMIN':
            # PROJECT_ADMIN only sees CUSTOMER users assigned to units in their
            # assigned project. This enforces project-level data isolation.
            assigned_projects = user.assigned_projects.all()
            qs = UserModel.objects.filter(
                role='CUSTOMER',
                owned_units__floor__block__project__in=assigned_projects,
                builder_company=user.builder_company,
            ).distinct().order_by('first_name', 'last_name')
        elif user.builder_company_id:
            if user.role == 'ACCOUNTS':
                accounts_project = get_accounts_assigned_project(user)
                qs = UserModel.objects.filter(
                    role='CUSTOMER',
                    owned_units__floor__block__project=accounts_project,
                ).distinct().order_by('first_name', 'last_name')
            else:
                qs = UserModel.objects.filter(builder_company=user.builder_company).exclude(pk=user.pk).order_by('first_name', 'last_name')
                if user.role not in ('SUPER_ADMIN', 'BUILDER_OWNER'):
                    from django.db.models import Q
                    assigned_projects = user.assigned_projects.all()
                    qs = qs.filter(
                        Q(assigned_projects__in=assigned_projects) | 
                        Q(owned_units__floor__block__project__in=assigned_projects) |
                        Q(role__in=['BUILDER_OWNER', 'SUPER_ADMIN'])
                    ).distinct()

        else:
            return UserModel.objects.none()
        # allocated_units is a SerializerMethodField over Unit.customer — the
        # prefetch keeps the whole team list at exactly one extra query.
        from apps.projects.models import Unit
        return qs.prefetch_related(
            Prefetch(
                'owned_units',
                queryset=Unit.objects.select_related('floor__block__project'),
            )
        )

    def _require_team_manager(self, request):
        if request.user.role not in ('BUILDER_OWNER', 'PROJECT_ADMIN', 'SUPER_ADMIN') or not request.user.builder_company_id:
            return Response({'detail': 'Only Builder Owners or Project Admins can manage team members.'}, status=status.HTTP_403_FORBIDDEN)
        return None

    def create(self, request, *args, **kwargs):
        denied = self._require_team_manager(request)
        if denied:
            return denied
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        denied = self._require_team_manager(request)
        if denied:
            return denied
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        denied = self._require_team_manager(request)
        if denied:
            return denied
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        denied = self._require_team_manager(request)
        if denied:
            return denied
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def trades(self, request):
        """Distinct contractor trades of the requesting user's own builder company."""
        user = request.user
        if not user.builder_company_id:
            return Response([])
        from .models import User as UserModel
        trades = (
            UserModel.objects
            .filter(builder_company_id=user.builder_company_id, role='CONTRACTOR')
            .exclude(trade='')
            .order_by('trade')
            .values_list('trade', flat=True)
            .distinct()
        )
        return Response(list(trades))

