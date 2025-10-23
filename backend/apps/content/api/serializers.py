from rest_framework import serializers
from .models import Topic, Concept, Epigraph
from ...utils.mixins import LanguageSerializerMixin

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

# Concept serializer
class ConceptSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    description = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Concept
        fields = [
            'id',
            'name', 'description',
            'name_es', 'description_es',
            'name_en', 'description_en',
        ]

        extra_kwargs = {
            'name_es': {'write_only': True, 'required': True},
            'name_en': {'write_only': True, 'required': True},
            'description_es': {'write_only': True, 'required': False},
            'description_en': {'write_only': True, 'required': False},
        }

    def get_name(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'name_{lang}', None)

    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)

# Topic serializer with dynamic language support
class TopicSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    
    title = serializers.SerializerMethodField(read_only=True)
    description = serializers.SerializerMethodField(read_only=True)
    epigraphs = EpigraphSerializer(many=True, read_only=True)
    concepts = ConceptSerializer(many=True, read_only=True)

    class Meta:
        model = Topic
        fields = [
            'id',
            'title', 'description',          # lectura dinámica
            'title_es', 'title_en',          # escritura directa
            'description_es', 'description_en',  # escritura directa
            'epigraphs', 'concepts'
        ]
        extra_kwargs = {
            'title_es': {'write_only': True, 'required': True},
            'title_en': {'write_only': True, 'required': True},
            'description_es': {'write_only': True, 'required': False},
            'description_en': {'write_only': True, 'required': False},
        }

    def get_title(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'title_{lang}', None)

    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)




