from django.forms import ValidationError
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.utils.permissions import BaseContentViewSet
from .serializers import ConceptSerializer, TopicSerializer, EpigraphSerializer, ShortConceptSerializer, ShortEpigraphSerializer, ShortTopicSerializer
from apps.content.domain import services, selectors

# Create your views here.

class TopicViewSet(BaseContentViewSet):
    serializer_class = ShortTopicSerializer

    def get_serializer_class(self):
        if self.action == 'retrieve': 
            return TopicSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        return selectors.get_all_topics()

    def update(self, request, *args, **kwargs):
        topic = selectors.get_topic_by_id(kwargs['pk'])
        topic = services.update_topic(topic, teacher=request.user, **request.data)
        return Response(self.get_serializer(topic).data, status=status.HTTP_200_OK)
      
    def destroy(self, request, *args, **kwargs):
        return services.delete_topic(selectors.get_topic_by_id(kwargs['pk']), teacher=request.user)

    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            topic = services.create_topic(
                title_es=data.get('title_es'),
                title_en=data.get('title_en'),
                description_es=data.get('description_es'),
                description_en=data.get('description_en'),
                teacher=request.user
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(topic)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], )
    def concepts(self, request, pk=None):
        """GET /topics/<id>/concepts/"""
        queryset = selectors.get_concepts_by_topic(pk)
        serializer = ConceptSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post', 'delete'], url_path='epigraphs')
    def epigraphs(self, request, pk=None):
        """GET /topics/<id>/epigraphs/ — obtiene los epigrafes asociados al topic tiene los grupos asociados a la asignatura
           POST /topics/<id>/epigraphs/ — crea un grupo asociado a la asignatura
           DELETE /topics/<id>/epigraphs/ — elimina los grupos."""
        if request.method == 'GET':
            topic = selectors.get_topic_by_id(topic_id=pk)
            if not topic:
                return Response({'detail': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)

            epigraphs = selectors.get_epigraphs_by_topic(topic)
            serializer = EpigraphSerializer(epigraphs, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'POST':
            topic = selectors.get_topic_by_id(topic_id=pk)
            if not topic:
                return Response({'detail': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)
            epigraph = services.create_epigraph(
                topic=topic,
                name_es=request.data.get('name_es'),
                name_en=request.data.get('name_en'),
                description_es=request.data.get('description_es'),
                description_en=request.data.get('description_en'),
                order_id=request.data.get('order_id'),
                teacher=request.user
            )
            serializer = EpigraphSerializer(epigraph, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        elif request.method == 'DELETE':
            topic = selectors.get_topic_by_id(topic_id=pk)
            services.delete_epigraphs_by_topic(topic, teacher=request.user)
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get', 'put', 'delete'], url_path='epigraphs/(?P<order_id>[^/.]+)')
    def epigraph_detail(self, request, pk=None, order_id=None):
        """GET /topics/<id>/epigraphs/<id>/ — obtiene un epigrafe específico.
           PUT /topics/<id>/epigraphs/<id>/ — actualiza un epigrafe asociado al tema.
           DELETE /topics/<id>/epigraphs/<id>/ — elimina un epigrafe."""
        epigraph = selectors.get_epigraph_by_id(topic_id=pk, order_id=order_id)
        if not epigraph or epigraph.topic.id != int(pk):
            return Response({'detail': 'Epigraph not found in this topic'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = EpigraphSerializer(epigraph, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == 'PUT':
            epigraph = services.update_epigraph(epigraph, teacher=request.user, **request.data)
            serializer = EpigraphSerializer(epigraph, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == 'DELETE':
            services.delete_epigraph(epigraph, teacher=request.user)
            return Response(status=status.HTTP_204_NO_CONTENT)

    @concepts.mapping.post
    def link_concept(self, request, pk=None):
        """POST /topics/<id>/concepts/ — asocia un concepto al topic"""
        topic = selectors.get_topic_by_id(topic_id=pk)
        data = request.data
        concept_name = data.get('concept_name')
        if not concept_name:
            name_es = data.get('name_es')
            name_en = data.get('name_en')
            description_es = data.get('description_es')
            description_en = data.get('description_en')
            concept = services.create_concept(
                name_es=name_es,
                name_en=name_en,
                description_es=description_es,
                description_en=description_en,
                teacher=request.user
            )
            concept_name = concept.name_es or concept.name_en

        concept = selectors.get_concept_by_name(name=concept_name)
        if not concept:
            return Response({'detail': 'Concept not found'}, status=status.HTTP_404_NOT_FOUND)
        order_id = data.get('order_id')
        if not order_id:
            order_id = services.get_next_order_id_for_topic(topic)

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
    serializer_class = ShortConceptSerializer

    def get_serializer_class(self):
        if self.action == 'retrieve': 
            return ConceptSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        return selectors.get_all_concepts()

    @action(detail=True, methods=['get'], )
    def concepts(self, request, pk=None):
        """GET /concepts/<id>/concepts/"""
        queryset = selectors.get_concepts_by_concept(pk)
        serializer = ConceptSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    # Audit create, update and delete Concept

    def update(self, request, *args, **kwargs):
        concept = selectors.get_concept_by_id(kwargs['pk'])
        services.update_concept(concept, teacher=request.user, **request.data)
        serializer = self.get_serializer(concept)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, *args, **kwargs):
        return services.delete_concept(selectors.get_concept_by_id(kwargs['pk']), teacher=request.user)

    def create(self, request, *args, **kwargs):
        data = request.data
        try: 
            concept = services.create_concept(
                name_es=data.get('name_es'),
                name_en=data.get('name_en'),
                description_es=data.get('description_es'),
                description_en=data.get('description_en'),
                teacher=request.user
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
    