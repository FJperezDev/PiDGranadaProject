# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..api.views import TopicViewSet, ConceptViewSet, EpigraphViewSet

router = DefaultRouter()
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'concepts', ConceptViewSet, basename='concept')
router.register(r'epigraphs', EpigraphViewSet, basename='epigraph')

urlpatterns = [
    path('', include(router.urls)),
]
