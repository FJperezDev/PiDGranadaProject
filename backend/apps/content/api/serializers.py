from rest_framework import serializers
from .models import ConceptIsRelatedToConcept, Topic, Concept, Epigraph
from apps.utils.mixins import LanguageSerializerMixin
from apps.content.domain import selectors

# Epigraph serializer
class EpigraphSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Epigraph
        fields = [
            'id', 'order_id', 
            'name', 'description', 
            'name_es', 'description_es', 
            'name_en', 'description_en', 
            'topic']
        extra_kwargs = {
            'name_es': {'write_only': True, 'required': True},
            'name_en': {'write_only': True, 'required': True},
            'topic': {'write_only': True, 'required': True},
            'description_es': {'write_only': True, 'required': False},
            'description_en': {'write_only': True, 'required': False},
        }

    def get_name(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'name_{lang}', None)

    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)

# RelatedConcept serializer
class RelatedConceptSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    description = serializers.SerializerMethodField(read_only=True)
    explanation = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Concept
        fields = [
            'id',
            'name', 'description', 'explanation',
        ]

    def get_name(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'name_{lang}', None)

    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)
    
    def get_explanation(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'_annotated_explanation_{lang}', None)
    

class ShortConceptSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    related_concepts = RelatedConceptSerializer(many=True, read_only=True)

    class Meta:
        model = Concept
        fields = [
            'id',
            'name',  
            'description',
            'related_concepts',
        ]

    def get_name(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'name_{lang}', None)
    
    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)
    
    def get_related_concepts(self, obj):
        related = selectors.get_concepts_by_concept(obj.id)
        return ShortConceptSerializer(related, many=True, context=self.context).data
    

class ShortEpigraphSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Epigraph
        fields = [
            'id',
            'name', 'description',
        ]

    def get_name(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'name_{lang}', None)

    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)

# Concept serializer
class ConceptSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    description = serializers.SerializerMethodField(read_only=True)
    related_concepts = RelatedConceptSerializer(many=True, read_only=True)
    name_es = serializers.SerializerMethodField()
    name_en = serializers.SerializerMethodField()
    description_es = serializers.SerializerMethodField()
    description_en = serializers.SerializerMethodField()

    class Meta:
        model = Concept
        fields = [
            'id',
            'name', 'description',
            'name_es', 'description_es',
            'name_en', 'description_en',
            'related_concepts',
        ]

    def get_name(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'name_{lang}', None)

    def get_name_es(self, obj):
        return getattr(obj, f'name_es', None)
    
    def get_name_en(self, obj):
        return getattr(obj, f'name_en', None)

    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)
    
    def get_description_es(self, obj):
        return getattr(obj, f'description_es', None)
    
    def get_description_en(self, obj):
        return getattr(obj, f'description_en', None)
    
    def get_related_concepts(self, obj):
        relationships = ConceptIsRelatedToConcept.objects.filter(
            concept_from=obj
        ).select_related('concept_to')

        concepts_to_serialize = []
        
        for rel in relationships:
            target_concept = rel.concept_to
            target_concept._annotated_explanation_es = rel.description_es
            target_concept._annotated_explanation_en = rel.description_en
            concepts_to_serialize.append(target_concept)

        return RelatedConceptSerializer(
            concepts_to_serialize, 
            many=True, 
            context=self.context
        ).data
    
class ShortTopicSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    order_id = serializers.IntegerField(read_only=True, required=False, allow_null=True)

    class Meta:
        model = Topic
        fields = [
            'title', 'order_id',
            'description', 'id'
        ]

    def get_title(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'title_{lang}', None)

    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)
    
# Topic serializer with dynamic language support

class TopicSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    
    title = serializers.SerializerMethodField(read_only=True)
    description = serializers.SerializerMethodField(read_only=True)
    epigraphs = EpigraphSerializer(many=True, read_only=True)
    concepts = ConceptSerializer(many=True, read_only=True)
    subjects = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Topic
        fields = [
            'id',
            'title', 'description',        
            'title_es', 'title_en',          
            'description_es', 'description_en',  
            'epigraphs', 'concepts', 'subjects',
        ]

    def get_title(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'title_{lang}', None)

    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)

    def get_subjects(self, obj):
        from apps.courses.api.serializers import ShortSubjectSerializer
        relations = obj.subjects.all().select_related('subject')
        real_subjects = [rel.subject for rel in relations]
        return ShortSubjectSerializer(real_subjects, many=True, context=self.context).data



