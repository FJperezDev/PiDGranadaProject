from django.forms import ValidationError
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.utils.permissions import BaseContentViewSet
from .serializers import ConceptSerializer, TopicSerializer, EpigraphSerializer
from apps.content.domain import services, selectors

# Create your views here.

class TopicViewSet(BaseContentViewSet):
    serializer_class = TopicSerializer

    def get_queryset(self):
        return selectors.get_all_topics()

    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            topic = services.create_topic(
                title_es=data.get('title_es'),
                title_en=data.get('title_en'),
                description_es=data.get('description_es'),
                description_en=data.get('description_en')
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(topic)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], )
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
    
    @epigraphs.mapping.post
    def create_epigraph(self, request, pk=None):
        """POST /topics/<id>/epigraphs/ — crea un nuevo epígrafe asociado al topic"""
        topic = selectors.get_topic_by_id(topic_id=pk)
        data = request.data

        try:
            epigraph = services.create_epigraph(
                topic=topic,
                name_es=data.get('name_es'),
                name_en=data.get('name_en'),
                order_id=data.get('order_id'),
                description_es=data.get('description_es'),
                description_en=data.get('description_en')
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = EpigraphSerializer(epigraph, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['put'], url_path='epigraphs/(?P<order_id>[^/.]+)')
    def update_epigraph(self, request, pk=None, order_id=None):
        """
        PUT /topics/<topic_id>/epigraphs/<epigraph_id>/ — actualiza un epígrafe de un tema
        """
        topic = selectors.get_topic_by_id(topic_id=pk)
        epigraph = selectors.get_epigraph_by_id(topic_id=pk, order_id=order_id)

        if epigraph.topic.id != topic.id:
            return Response({'detail': 'El epígrafe no pertenece a este tema.'},
                            status=status.HTTP_400_BAD_REQUEST)

        data = request.data
        
        try:
            updated_epigraph = services.update_epigraph(
                epigraph=epigraph,
                name_es=data.get('name_es'),
                name_en=data.get('name_en'),
                order_id=data.get('order_id'),
                description_es=data.get('description_es'),
                description_en=data.get('description_en')
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = EpigraphSerializer(updated_epigraph, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @concepts.mapping.post
    def link_concept(self, request, pk=None):
        """POST /topics/<id>/concepts/ — asocia un concepto al topic"""
        topic = selectors.get_topic_by_id(topic_id=pk)
        data = request.data
        concept_name = data.get('concept_name')
        concept = selectors.get_concept_by_name(name=concept_name)
        if not concept:
            return Response({'detail': 'Concept not found'}, status=status.HTTP_404_NOT_FOUND)
        order_id = data.get('order_id')

        try:
            link = services.link_concept_to_topic(
                topic=topic,
                concept=concept,
                order_id=order_id
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Concept linked to topic successfully',
            'topic': topic.id,
            'concept_id': concept.id,
            'order_id': link.order_id
        }, status=status.HTTP_200_OK)
    
    @concepts.mapping.delete
    def unlink_concept(self, request, pk=None):
        """DELETE /topics/<id>/concepts/ — asocia un concepto al topic"""
        topic = selectors.get_topic_by_id(topic_id=pk)
        data = request.data
        concept_name = data.get('concept_name')
        concept = selectors.get_concept_by_name(name=concept_name)
        if not concept:
            return Response({'detail': 'Concept not found'}, status=status.HTTP_404_NOT_FOUND)
        order_id = data.get('order_id')

        try:
            link = services.unlink_concept_from_topic(
                topic=topic,
                concept=concept
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Concept linked to topic removed successfully',
            'topic': topic.id,
            'concept_id': concept.id
        }, status=status.HTTP_200_OK)
    

class ConceptViewSet(BaseContentViewSet):
    serializer_class = ConceptSerializer

    def get_queryset(self):
        return selectors.get_all_concepts()
    
    @action(detail=True, methods=['get'], )
    def concepts(self, request, pk=None):
        print("Dentro de concepts")
        """GET /concepts/<id>/concepts/"""
        queryset = selectors.get_concepts_by_concept(pk)
        serializer = ConceptSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        data = request.data
        try: 
            concept = services.create_concept(
                name_es=data.get('name_es'),
                name_en=data.get('name_en'),
                description_es=data.get('description_es'),
                description_en=data.get('description_en')
            )
            serializer = self.get_serializer(concept)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            concept = selectors.get_concept_by_name(data.get('name_es')) or selectors.get_concept_by_name(data.get('name_en'))
            return Response({
                'detail': str(e),
                'concept': self.get_serializer(concept).data
            }, 
            status=status.HTTP_400_BAD_REQUEST)

    @concepts.mapping.post
    def link_concept(self, request, pk=None):
        """POST /concepts/<id>/concepts/ — enlaza este concepto con otro"""
        concept_from = selectors.get_concept_by_id(pk)
        concept_name = request.data.get('concept_name')
        concept_to = selectors.get_concept_by_name(name=concept_name)
        bidirectional = request.data.get('bidirectional', False)

        if not concept_to:
            return Response({'detail': 'Concept not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            services.link_concepts(concept_from, concept_to, bidirectional)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Concepts linked successfully',
            'from_id': concept_from.id,
            'to_id': concept_to.id,
            'bidirectional': bidirectional
        }, status=status.HTTP_200_OK)
    
    @concepts.mapping.delete
    def unlink_concept(self, request, pk=None):
        """DELETE /concepts/<id>/concepts/ — elimina la relación"""
        concept_from = selectors.get_concept_by_id(pk)
        concept_name = request.data.get('concept_name')
        concept_to = selectors.get_concept_by_name(name=concept_name)
        bidirectional = request.data.get('bidirectional', False)

        if not concept_to:
            return Response({'detail': 'Concept not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            services.unlink_concepts(concept_from, concept_to, bidirectional)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Concept link removed',
            'from_id': concept_from.id,
            'to_id': concept_to.id,
            'bidirectional': bidirectional
        }, status=status.HTTP_200_OK)
    

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