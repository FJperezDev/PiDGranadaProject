# models.py
from django.db import models
import os

class BackupFile(models.Model):
    file = models.FileField(upload_to='backups/')
    created_at = models.DateTimeField(auto_now_add=True)
    is_auto_generated = models.BooleanField(default=False)

    def delete(self, *args, **kwargs):
        # Borrar el archivo físico al borrar el registro de la BD
        if self.file and os.path.isfile(self.file.path):
            os.remove(self.file.path)
        super().delete(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']