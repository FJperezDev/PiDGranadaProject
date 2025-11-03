from rest_framework.routers import DefaultRouter
from ..api.views import SubjectViewSet, StudentGroupViewSet

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'studentgroups', StudentGroupViewSet, basename='studentgroup')

urlpatterns = router.urls