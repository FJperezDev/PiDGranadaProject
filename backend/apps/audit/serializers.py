from rest_framework import serializers
from .models import BackupFile
import os

class BackupFileSerializer(serializers.ModelSerializer):
    file_size = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    created_at_formatted = serializers.DateTimeField(source='created_at', format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = BackupFile
        fields = [
            'id',
            'file',
            'created_at',
            'created_at_formatted',
            'is_auto_generated',
            'file_name',
            'file_size'
        ]
        read_only_fields = fields

    def get_file_name(self, obj):
        if obj.file:
            return os.path.basename(obj.file.name)
        return None

    def get_file_size(self, obj):
        try:
            if obj.file:
                size_in_bytes = obj.file.size
                if size_in_bytes < 1024:
                    return f"{size_in_bytes} B"
                elif size_in_bytes < 1024 * 1024:
                    return f"{round(size_in_bytes / 1024, 1)} KB"
                else:
                    return f"{round(size_in_bytes / (1024 * 1024), 2)} MB"
        except Exception:
            pass
        return "0 B"