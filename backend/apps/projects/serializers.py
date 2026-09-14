from rest_framework import serializers
from .models import Project, Block, Floor, Unit, Milestone


class UnitSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='unit_number', read_only=True)
    projectId = serializers.IntegerField(source='floor.block.project_id', read_only=True)
    blockId = serializers.IntegerField(source='floor.block_id', read_only=True)
    floorId = serializers.IntegerField(source='floor_id', read_only=True)
    type = serializers.CharField(source='unit_type', read_only=True)
    areaSqFt = serializers.DecimalField(source='area_sqft', max_digits=10, decimal_places=2, read_only=True)
    customerId = serializers.IntegerField(source='customer_id', read_only=True, allow_null=True)
    project_id = serializers.IntegerField(source='floor.block.project_id', read_only=True)
    block_id = serializers.IntegerField(source='floor.block_id', read_only=True)

    class Meta:
        model = Unit
        fields = '__all__'

    def to_representation(self, instance):
        repr = super().to_representation(instance)
        if instance.customer:
            repr['customer'] = {
                'id': instance.customer.id,
                'name': (instance.customer.get_full_name() or instance.customer.username),
                'email': instance.customer.email,
                'phone': getattr(instance.customer, 'phone_number', None)
            }
        return repr

    def validate(self, data):
        request = self.context.get('request')
        if request and request.method == 'POST':
            user = request.user
            if user.builder_company and user.builder_company.subscription_plan:
                plan = user.builder_company.subscription_plan
                current_units = Unit.objects.filter(floor__block__project__builder_company=user.builder_company).count()
                if current_units >= plan.max_units:
                    raise serializers.ValidationError({
                        "non_field_errors": f"Subscription limit reached. Your plan allows up to {plan.max_units} units."
                    })
        return data


class FloorSerializer(serializers.ModelSerializer):
    units = UnitSerializer(many=True, read_only=True)
    projectId = serializers.IntegerField(source='block.project_id', read_only=True)
    blockId = serializers.IntegerField(source='block_id', read_only=True)
    project_id = serializers.IntegerField(source='block.project_id', read_only=True)

    class Meta:
        model = Floor
        fields = '__all__'


class BlockSerializer(serializers.ModelSerializer):
    floors = FloorSerializer(many=True, read_only=True)
    projectId = serializers.IntegerField(source='project_id', read_only=True)

    class Meta:
        model = Block
        fields = '__all__'


class MilestoneSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        from apps.builders.utils import check_and_update_storage
        project = validated_data.get('project')
        if project and project.builder_company:
            file_obj = validated_data.get('evidence')
            if file_obj:
                check_and_update_storage(project.builder_company, file_obj.size)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from apps.builders.utils import check_and_update_storage
        if instance.project and instance.project.builder_company:
            file_obj = validated_data.get('evidence')
            if file_obj:
                check_and_update_storage(instance.project.builder_company, file_obj.size)
        return super().update(instance, validated_data)

    class Meta:
        model = Milestone
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    blocks = BlockSerializer(many=True, read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['created_by']

    def create(self, validated_data):
        from apps.builders.utils import check_and_update_storage
        builder = validated_data.get('builder_company')
        file_obj = validated_data.get('image')
        if builder and file_obj:
            check_and_update_storage(builder, file_obj.size)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from apps.builders.utils import check_and_update_storage
        builder = instance.builder_company
        file_obj = validated_data.get('image')
        if builder and file_obj:
            check_and_update_storage(builder, file_obj.size)
        return super().update(instance, validated_data)

    def validate(self, data):
        request = self.context.get('request')
        
        project_type = data.get('project_type', getattr(self.instance, 'project_type', None))
        project_type_other = data.get('project_type_other', getattr(self.instance, 'project_type_other', None))
        
        if project_type == 'other' and not project_type_other:
            raise serializers.ValidationError({
                "project_type_other": "Please specify the custom project type."
            })
        if project_type != 'other' and 'project_type_other' in data:
            data['project_type_other'] = '' # Clear it if not other
            
        start_date = data.get('start_date', getattr(self.instance, 'start_date', None))
        expected_completion_date = data.get('expected_completion_date', getattr(self.instance, 'expected_completion_date', None))
        
        if start_date and expected_completion_date and start_date > expected_completion_date:
            raise serializers.ValidationError({
                "expected_completion_date": "Expected completion date cannot be before the start date."
            })

        if request and request.method == 'POST':
            user = request.user
            if user.builder_company and user.builder_company.subscription_plan:
                plan = user.builder_company.subscription_plan
                current_projects = user.builder_company.projects.count()
                if current_projects >= plan.max_projects:
                    raise serializers.ValidationError({
                        "non_field_errors": f"Subscription limit reached. Your plan allows up to {plan.max_projects} projects."
                    })
        return data
