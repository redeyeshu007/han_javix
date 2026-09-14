from rest_framework import serializers
from .models import Document

from apps.builders.utils import check_and_update_storage

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.name')
    customer_name = serializers.ReadOnlyField(source='customer.name')
    unit_number = serializers.ReadOnlyField(source='unit.unit_number')
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'document_type', 'category', 'file',
            'file_name', 'file_size', 'builder_company', 'project',
            'unit', 'customer', 'defect', 'status', 'rejection_reason',
            'uploaded_by', 'uploaded_by_name', 'customer_name',
            'unit_number', 'project_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['uploaded_by'] = user
        
        builder = user.builder_company
        if builder and not validated_data.get('builder_company'):
            validated_data['builder_company'] = builder
            
        file_obj = validated_data.get('file')
        if file_obj:
            if not validated_data.get('file_name'):
                validated_data['file_name'] = file_obj.name
            
            # Enforce storage limits
            builder_to_check = validated_data.get('builder_company') or builder
            if builder_to_check:
                check_and_update_storage(builder_to_check, file_obj.size)
                
        return super().create(validated_data)
