from rest_framework import serializers
from .models import User
from apps.projects.models import Project, Unit
from django.db import transaction


def customer_unit_summary(user):
    """
    Unit summary for the CUSTOMER portal, read from the Unit.customer reverse
    relation (the single source of truth for allocations). select_related keeps
    it at one query; None when the customer has no allocated unit.
    """
    unit = (
        Unit.objects.filter(customer=user)
        .select_related('floor__block__project')
        .first()
    )
    if unit is None:
        return None
    return {
        'unit_id': unit.id,
        'unit_number': unit.unit_number,
        'project_id': unit.floor.block.project_id,
        'project_name': unit.floor.block.project.name,
    }


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    builder_company_name = serializers.SerializerMethodField()
    assigned_project = serializers.SerializerMethodField()

    name = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'is_active', 'name', 'password', 'builder_company_name', 'assigned_project']
        
    def get_role(self, obj):
        if obj.is_superuser or obj.role == 'SUPER_ADMIN':
            return 'super_admin'
        return obj.role.lower()
        
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email

    def get_builder_company_name(self, obj):
        if obj.builder_company:
            return obj.builder_company.company_name
        return None

    def get_assigned_project(self, obj):
        """
        For PROJECT_ADMIN and ACCOUNTS: return the single assigned project as {id, name}.
        This is the single source of truth for project scoping on the frontend.
        All other roles return None.
        """
        if obj.role not in ['PROJECT_ADMIN', 'ACCOUNTS']:
            return None
        project = obj.assigned_projects.only('id', 'name').first()
        if project is None:
            return None
        return {'id': project.id, 'name': project.name}

    def update(self, instance, validated_data):
        name = validated_data.pop('name', None)
        if name:
            parts = name.split(' ', 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ''
            
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
            
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # Login is email-based; legacy records need not have username=email.
        try:
            user = User.objects.get(email__iexact=data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password")
        if not user.check_password(data['password']):
            raise serializers.ValidationError("Invalid email or password")
        if not user.is_active:
            raise serializers.ValidationError("Account is suspended")
        data['user'] = user
        return data


class TeamMemberSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    assigned_project_ids = serializers.PrimaryKeyRelatedField(
        source='assigned_projects', many=True, queryset=Project.objects.all(), required=False
    )
    full_name = serializers.SerializerMethodField(read_only=True)
    # Units this member is allocated to via Unit.customer (CUSTOMER role).
    # Additive read-only — TeamList and other consumers are unaffected. The
    # viewset prefetches owned_units with select_related, so list responses
    # cost exactly one extra query.
    allocated_units = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'name', 'full_name', 'email', 'phone', 'role', 'is_active',
            'password', 'assigned_project_ids', 'trade', 'allocated_units',
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email

    def get_allocated_units(self, obj):
        return [
            {
                'id': unit.id,
                'unit_number': unit.unit_number,
                'project_name': unit.floor.block.project.name,
                'floor_name': unit.floor.name,
                'block_name': unit.floor.block.name,
            }
            for unit in obj.owned_units.all()
        ]

    def validate_role(self, value):
        allowed = {
            'PROJECT_ADMIN', 'SITE_ENGINEER',
            'ACCOUNTS', 'CONTRACTOR', 'CUSTOMER',
        }
        if value not in allowed:
            raise serializers.ValidationError('This role cannot be created from Team.')
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.method == 'POST':
            user = request.user
            if user.builder_company and user.builder_company.subscription_plan:
                plan = user.builder_company.subscription_plan
                # Correct relation name is 'staff' not 'users'
                current_users = user.builder_company.staff.count()
                if current_users >= plan.max_users:
                    raise serializers.ValidationError({
                        "non_field_errors": f"Subscription limit reached. Your plan allows up to {plan.max_users} users."
                    })
        
        projects = attrs.get('assigned_projects', [])
        if request and request.user:
            if any(project.builder_company_id != request.user.builder_company_id for project in projects):
                raise serializers.ValidationError({'assigned_project_ids': 'Projects must belong to your builder.'})
            # Only allow assigning projects the current user manages (Builder Owner
            # manages all).
            if request.user.role not in ('SUPER_ADMIN', 'BUILDER_OWNER') and projects:
                # Need to check managed projects properly
                allowed_project_ids = request.user.assigned_projects.values_list('id', flat=True)
                for p in projects:
                    if p.id not in allowed_project_ids:
                        raise serializers.ValidationError(
                            {'assigned_project_ids': f'You do not have permission to assign project {p.name}.'}
                        )

        # Only enforce the project requirement when the payload touches role/projects;
        # otherwise partial updates (e.g. status-only) would be wrongly rejected.
        if not self.partial or 'role' in attrs or 'assigned_projects' in attrs:
            role = attrs.get('role', self.instance.role if self.instance else None)
            
            # Roles that don't need explicit projects
            company_wide = ('SUPER_ADMIN', 'BUILDER_OWNER', 'ACCOUNTS')
            req_projects = role not in company_wide

            active_projects = projects if 'assigned_projects' in attrs else (list(self.instance.assigned_projects.all()) if self.instance else [])

            if req_projects and not active_projects:
                raise serializers.ValidationError({'assigned_project_ids': 'Select at least one assigned project for this role.'})
            
            if role == 'PROJECT_ADMIN':
                if len(active_projects) != 1:
                    raise serializers.ValidationError({'assigned_project_ids': 'Project Admin must be assigned to exactly ONE project.'})
                
                # Check uniqueness (one Project Admin per project)
                proj_id = active_projects[0].id
                existing_admin_query = User.objects.filter(role='PROJECT_ADMIN', assigned_projects__id=proj_id)
                if self.instance:
                    existing_admin_query = existing_admin_query.exclude(pk=self.instance.pk)
                
                if existing_admin_query.exists():
                    raise serializers.ValidationError({'assigned_project_ids': 'A Project Admin already exists for this project.'})

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        name = validated_data.pop('name').strip()
        projects = validated_data.pop('assigned_projects', [])
        password = validated_data.pop('password')
        first_name, _, last_name = name.partition(' ')
        email = validated_data.pop('email').lower()
        user = User.objects.create_user(
            username=email, email=email, password=password,
            first_name=first_name, last_name=last_name,
            builder_company=self.context['request'].user.builder_company,
            **validated_data,
        )
        if projects:
            user.assigned_projects.set(projects)
        return user

    @transaction.atomic
    def update(self, instance, validated_data):
        name = validated_data.pop('name', None)
        if name:
            first_name, _, last_name = name.strip().partition(' ')
            instance.first_name = first_name
            instance.last_name = last_name
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        email = validated_data.pop('email', None)
        if email:
            instance.email = email.lower()
            instance.username = instance.email
        projects = validated_data.pop('assigned_projects', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if projects is not None:
            instance.assigned_projects.set(projects)
        return instance
