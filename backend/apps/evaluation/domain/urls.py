from rest_framework.routers import DefaultRouter
from ..api.views import (
    QuestionViewSet,
    ExamViewSet,
    AnswerViewSet
)

router = DefaultRouter()
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'answers', AnswerViewSet, basename='answer')
router.register(r'exams', ExamViewSet, basename='exam')

urlpatterns = router.urls
