from rest_framework.routers import DefaultRouter
from ..api.views import (
    QuestionViewSet,
    ExamViewSet
)

router = DefaultRouter()
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'exams', ExamViewSet, basename='exam')

urlpatterns = router.urls
