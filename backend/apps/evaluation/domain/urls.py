from rest_framework.routers import DefaultRouter
from ..api.views import (
    QuestionViewSet,
    ExamViewSet,
    QuestionRelatedToConceptViewSet,
    AnalyticsViewSet,
)

router = DefaultRouter()
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'qc', QuestionRelatedToConceptViewSet, basename='questionrelatedtoconcept')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = router.urls
