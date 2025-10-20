from rest_framework import viewsets
from .models import Topic, Concept, Epigraph
from ..customauth.permissions import IsSuperTeacherOrReadOnly, IsTeacherOrReadOnly
from .serializers import ConceptSerializer, TopicSerializer, EpigraphSerializer

# Create your views here.

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [IsTeacherOrReadOnly, IsSuperTeacherOrReadOnly]

class ConceptViewSet(viewsets.ModelViewSet):
    queryset = Concept.objects.all()
    serializer_class = ConceptSerializer
    permission_classes = [IsTeacherOrReadOnly, IsSuperTeacherOrReadOnly]

class EpigraphViewSet(viewsets.ModelViewSet):
    queryset = Epigraph.objects.all()
    serializer_class = EpigraphSerializer
    permission_classes = [IsTeacherOrReadOnly, IsSuperTeacherOrReadOnly]
