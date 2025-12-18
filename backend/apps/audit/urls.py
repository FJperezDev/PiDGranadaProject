from rest_framework.routers import DefaultRouter
from apps.audit.views import AuditViewSet, BackupViewSet, InviteUserView
from django.urls import path

router = DefaultRouter()
router.register(r'audits', AuditViewSet, basename='audit')
router.register(r'backups', BackupViewSet, basename='backup')

urlpatterns = router.urls