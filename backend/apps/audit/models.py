# models.py
from django.db import models
import os

class BackupFile(models.Model):
    # Los archivos se guardan en media/backups/
    file = models.FileField(upload_to='backups/')
    created_at = models.DateTimeField(auto_now_add=True)
    # True = Detectado del sistema / False = Creado manualmente desde la app
    is_auto_generated = models.BooleanField(default=False) 

    def delete(self, *args, **kwargs):
        # Borrar el archivo físico al borrar el registro de la BD
        if self.file and os.path.isfile(self.file.path):
            try:
                os.remove(self.file.path)
            except Exception as e:
                print(f"Error borrando archivo físico: {e}")
        super().delete(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']