from rest_framework.routers import DefaultRouter
from .views import SubjectViewSet, StudentGroupViewSet

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'groups', StudentGroupViewSet, basename='studentgroup')

urlpatterns = router.urls