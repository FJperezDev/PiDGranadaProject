from rest_framework.routers import DefaultRouter
from .views import (
    QuestionViewSet,
    AnswerViewSet,
    QuestionBelongsToTopicViewSet,
    QuestionRelatedToConceptViewSet,
    QuestionEvaluationGroupViewSet,
)

router = DefaultRouter()
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'answers', AnswerViewSet, basename='answer')
router.register(r'question-topic', QuestionBelongsToTopicViewSet, basename='questiontopic')
router.register(r'question-concept', QuestionRelatedToConceptViewSet, basename='questionconcept')
router.register(r'evaluations', QuestionEvaluationGroupViewSet, basename='questionevaluation')

urlpatterns = router.urls
