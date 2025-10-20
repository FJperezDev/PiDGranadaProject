from rest_framework import serializers
from .models import Topic, Concept, Epigraph

# Utility mixin for language-aware fields
class LanguageSerializerMixin:
    def get_lang(self):
        request = self.context.get('request')
        if request:
            lang = request.headers.get('Accept-Language', 'es')[:2]
            return 'en' if lang == 'en' else 'es'
        return 'es'

# Topic serializer with dynamic language support
class TopicSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ['id', 'title', 'description']

    def get_title(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'title_{lang}', None)

    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)

# Concept serializer
class ConceptSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Concept
        fields = ['id', 'name', 'description']

    def get_name(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'name_{lang}', None)

    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)

# Epigraph serializer
class EpigraphSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Epigraph
        fields = ['id', 'order_id', 'name', 'description', 'topic']

    def get_name(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'name_{lang}', None)

    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)

