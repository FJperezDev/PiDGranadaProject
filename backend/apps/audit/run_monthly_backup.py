from django.core.management.base import BaseCommand
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from .models import BackupFile
from .utils import generate_excel_backup

class Command(BaseCommand):
    help = 'Genera backup mensual y rota los antiguos (trimestral)'

    def handle(self, *args, **kwargs):
        # 1. Generar nuevo backup
        self.stdout.write("Generando backup automático...")
        generate_excel_backup(is_auto=True)

        # 2. Rotación: Eliminar backups automáticos mayores a 3 meses
        cutoff_date = timezone.now() - relativedelta(months=3)
        old_backups = BackupFile.objects.filter(
            created_at__lt=cutoff_date, 
            is_auto_generated=True
        )
        count = old_backups.count()
        old_backups.delete() # Esto dispara el método delete() del modelo y borra el archivo
        
        self.stdout.write(f"✅ Proceso terminado. {count} backups antiguos eliminados.")