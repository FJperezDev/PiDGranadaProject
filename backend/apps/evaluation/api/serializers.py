from rest_framework import serializers
from apps.utils.mixins import LanguageSerializerMixin
from .models import (
    Question, Answer,
    # TeacherMakeChangeQuestion, TeacherMakeChangeAnswer,
    QuestionBelongsToTopic, QuestionRelatedToConcept,
    QuestionEvaluationGroup
)
from apps.content.api.serializers import ShortTopicSerializer, ShortConceptSerializer

class AnswerSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    text = serializers.SerializerMethodField()
    text_es = serializers.CharField(required=True)
    text_en = serializers.CharField(required=True)
    is_correct = serializers.BooleanField(required=True)

    class Meta:
        model = Answer
        fields = ['id', 'text', 'text_es', 'text_en', 'is_correct', 'question']
        read_only_fields = ['id', 'question']
        
    def get_text(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'text_{lang}', None)
    def get_text_es(self, obj):
        return obj.text_es
    def get_text_en(self, obj):
        return obj.text_en

class ShortAnswerSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    text = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct']

    def get_text(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'text_{lang}', None)

class ShortQuestionSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    statement = serializers.SerializerMethodField()
    answers = ShortAnswerSerializer(many=True, read_only=True)
    explanation = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'type', 'statement', 'answers', 'explanation']

    def get_statement(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'statement_{lang}', None)
    
    def get_explanation(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'explanation_{lang}', None)

class QuestionSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    # 1. Cambiamos esto para usar un método personalizado en lugar de la relación directa
    answers = serializers.SerializerMethodField()
    
    topics = serializers.SerializerMethodField()
    subjects = serializers.SerializerMethodField()
    concepts = serializers.SerializerMethodField()
    statement = serializers.SerializerMethodField()
    statement_es = serializers.SerializerMethodField()
    statement_en = serializers.SerializerMethodField()
    explanation = serializers.SerializerMethodField()
    explanation_es = serializers.SerializerMethodField()
    explanation_en = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'id', 'type', 'statement', 'statement_es', 'statement_en', 'approved', 'generated',
            'answers', 'topics', 'subjects', 'concepts', 'explanation', 'explanation_es', 'explanation_en'
        ]
        read_only_fields = ['id', 'answers']
        extra_kwargs = {
            'statement_es': {'write_only': True, 'required': True},
            'statement_en': {'write_only': True, 'required': True},
            'explanation_es': {'write_only': True, 'required': False},
            'explanation_en': {'write_only': True, 'required': False},
        }

    # 2. Implementamos el método para filtrar las respuestas
    def get_answers(self, obj):
        # Accedemos al related_name 'answers' definido en tu modelo Answer
        # y aplicamos el filtro old=False
        queryset = obj.answers.filter(old=False)
        # Serializamos el resultado filtrado
        return AnswerSerializer(queryset, many=True, context=self.context).data

    def get_topics(self, obj):
        queryset = [qt.topic for qt in obj.topics.all()]
        return ShortTopicSerializer(queryset, many=True, context=self.context).data

    def get_concepts(self, obj):
        queryset = [qc.concept for qc in obj.concepts.all()]
        return ShortConceptSerializer(queryset, many=True, context=self.context).data
    
    def get_explanation(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'explanation_{lang}', None)
    
    def get_explanation_es(self, obj):
        return obj.explanation_es
    
    def get_explanation_en(self, obj):
        return obj.explanation_en

    def get_statement_es(self, obj):
        return obj.statement_es
    
    def get_statement_en(self, obj):
        return obj.statement_en
    
    def get_statement(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'statement_{lang}', None)
    
    def get_subjects(self, obj):
        from apps.courses.api.serializers import ShortSubjectSerializer
        subjects_set = set()
        
        # 1. Recorremos los temas (Topics) asociados a la pregunta
        for qt in obj.topics.all():
            # qt es 'QuestionBelongsToTopic', qt.topic es el 'Topic' real
            topic = qt.topic
            
            # 2. Recorremos la relación inversa hacia los Subjects
            # topic.subjects devuelve instancias de 'SubjectIsAboutTopic'
            for subject_relation in topic.subjects.all():
                # 3. Extraemos el Subject real de la relación y lo añadimos al set
                subjects_set.add(subject_relation.subject)
        
        # 4. IMPORTANTE: Usamos ShortSubjectSerializer, NO ShortTopicSerializer
        # Asegúrate de que ShortSubjectSerializer incluya 'description' si lo necesitas en el JSON
        return ShortSubjectSerializer(subjects_set, many=True, context=self.context).data
    
# class TeacherMakeChangeQuestionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TeacherMakeChangeQuestion
#         fields = '__all__'


# class TeacherMakeChangeAnswerSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TeacherMakeChangeAnswer
#         fields = '__all__'

class QuestionBelongsToTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionBelongsToTopic
        fields = '__all__'
        read_only_fields = ['id']


class QuestionRelatedToConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionRelatedToConcept
        fields = '__all__'
        read_only_fields = ['id']

class QuestionEvaluationGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionEvaluationGroup
        fields = '__all__'
        read_only_fields = ['id']

class AnalyticsResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField(allow_null=True)
    label = serializers.CharField()
    full_label = serializers.CharField()
    value = serializers.FloatField()
    attempts = serializers.IntegerField()
    total_failures = serializers.FloatField(required=False)