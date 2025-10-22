from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from ...customauth.permissions import IsTeacher, IsSuperTeacher
from .serializers import ConceptSerializer, TopicSerializer, EpigraphSerializer
from ..domain import services, selectors

# Create your views here.

class BaseContentViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if(self.action in ['create', 'delete']):
            permission_classes = [IsSuperTeacher]
        else:
            permission_classes = [IsTeacher]
        return [perm() for perm in permission_classes]

class TopicViewSet(BaseContentViewSet):
    serializer_class = TopicSerializer
    queryset = selectors.get_all_topics()

    def perform_create(self, serializer):
        data = serializer.validated_data
        services.create_topic(
            title_es=data.get('title_es'),
            title_en=data.get('title_en'),
            description_es=data.get('description_es'),
            description_en=data.get('description_en')
        )
    
    @action(detail=True, methods=['get'])
    def concepts(self, request, pk=None):
        print("Dentro de concepts")
        """GET /topics/<id>/concepts/"""
        queryset = selectors.get_concepts_by_topic(pk)
        serializer = ConceptSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def epigraphs(self, request, pk=None):
        """GET /topics/<id>/epigraphs/"""
        queryset = selectors.get_epigraphs_by_topic(pk)
        serializer = EpigraphSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    

class ConceptViewSet(BaseContentViewSet):
    serializer_class = ConceptSerializer

    def get_queryset(self):
        return selectors.get_all_concepts()
    
    def perform_create(self, serializer):
        data = serializer.validated_data
        services.create_concept(
            name_es=data.get('name_es'),
            name_en=data.get('name_en'),
            description_es=data.get('description_es'),
            description_en=data.get('description_en')
        )

    @action(detail=True, methods=['post'])
    def topic(self, request, pk=None):
        """POST /topics/<id>/epigraphs/"""
        queryset = selectors.get_epigraphs_by_topic(pk)
        serializer = EpigraphSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

class EpigraphViewSet(BaseContentViewSet):
    serializer_class = EpigraphSerializer

    def get_queryset(self):
        return selectors.get_all_epigraphs()

    def perform_create(self, serializer):
        data = serializer.validated_data
        topic = data.get('topic')
        services.create_epigraph(
            topic=topic,
            name_es=data.get('name_es'),
            name_en=data.get('name_en'),
            order_id=data.get('order_id'),
            description_es=data.get('description_es'),
            description_en=data.get('description_en')
        )