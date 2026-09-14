from rest_framework import viewsets, permissions, filters

# Roles allowed to approve/reject documents (master spec: technical +
# builder-side roles; CRM/Accounts/Contractor/Customer may upload and view
# but not approve). Recorded as an implementation assumption.
DOC_APPROVER_ROLES = {'SUPER_ADMIN', 'BUILDER_OWNER'}
DOC_DECISION_STATUSES = {'APPROVED', 'REJECTED'}
from .models import Document
from .serializers import DocumentSerializer

from apps.inspections.views import BlockProjectAdminMutationMixin

class DocumentViewSet(BlockProjectAdminMutationMixin, viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'file_name', 'category']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Document.objects.none()
            
        if user.role == 'SUPER_ADMIN':
            qs = Document.objects.all()
        elif user.role == 'CUSTOMER':
            qs = Document.objects.filter(customer=user)
        elif user.builder_company:
            qs = Document.objects.filter(builder_company=user.builder_company)
        else:
            qs = Document.objects.none()

        params = self.request.query_params
        if params.get('document_type'):
            qs = qs.filter(document_type=params.get('document_type'))
        if params.get('category'):
            qs = qs.filter(category=params.get('category'))
        if params.get('status'):
            qs = qs.filter(status=params.get('status'))
        if params.get('project'):
            qs = qs.filter(project_id=params.get('project'))
        if params.get('unit'):
            qs = qs.filter(unit_id=params.get('unit'))
        if params.get('customer'):
            qs = qs.filter(customer_id=params.get('customer'))
        if params.get('defect'):
            qs = qs.filter(defect_id=params.get('defect'))

        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        status = serializer.validated_data.get('status')
        if status in DOC_DECISION_STATUSES and self.request.user.role not in DOC_APPROVER_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only Builder Owner, Project Admin, Project Manager or Site Engineer can approve or reject documents.')
        serializer.save()

    def perform_update(self, serializer):
        new_status = serializer.validated_data.get('status')
        if new_status in DOC_DECISION_STATUSES and self.request.user.role not in DOC_APPROVER_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only Builder Owner, Project Admin, Project Manager or Site Engineer can approve or reject documents.')
        serializer.save()
