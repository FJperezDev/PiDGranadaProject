from django.shortcuts import render
from rest_framework import viewsets
from apps.utils.permissions import IsSuperTeacher
from apps.content.domain import selectors as content_selectors
from apps.courses.domain import selectors as courses_selectors
from apps.evaluation.domain import selectors as evaluation_selectors
from rest_framework.decorators import action
from rest_framework.response import Response
# Create your views here.

class AuditViewSet(viewsets.ViewSet):
    permission_classes = [IsSuperTeacher]
    
    @action(detail=False, methods=['get'], url_path='changes')
    def get_changes(self, request):
        courses_changes = courses_selectors.get_all_changes()
        content_changes = content_selectors.get_all_changes()
        evaluation_changes = evaluation_selectors.get_all_changes()

        all_changes = sorted(
            list(courses_changes + content_changes + evaluation_changes),
            key=lambda change: change.created_at,
            reverse=True
        )

        serialized_changes = []
        for change in all_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)
    
    @action(detail=False, methods=['get'], url_path='questions')
    def get_questions_changes(self, request):
        questions_changes = evaluation_selectors.get_all_question_changes()
        serialized_changes = []
        for change in questions_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)
    
    @action(detail=False, methods=['get'], url_path='questions/(?P<question_id>[^/.]+)/answers')
    def get_answers_changes(self, request, question_id: int):
        answers_changes = evaluation_selectors.get_answer_changes(question_id)
        serialized_changes = []
        for change in answers_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)

    @action(detail=False, methods=['get'], url_path='concepts')
    def get_concepts_changes(self, request):
        concepts_changes = content_selectors.get_all_concept_changes()
        serialized_changes = []
        for change in concepts_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)
    
    @action(detail=False, methods=['get'], url_path='topics')
    def get_topics_changes(self, request):
        topics_changes = content_selectors.get_all_topic_changes()
        serialized_changes = []
        for change in topics_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)
    
    @action(detail=False, methods=['get'], url_path='topics/(?P<topic_id>[^/.]+)/epigraphs')
    def get_epigraphs_changes(self, request, topic_id: int):
        epigraphs_changes = content_selectors.get_all_epigraph_changes(topic_id=topic_id)
        serialized_changes = []
        for change in epigraphs_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)
    
    @action(detail=False, methods=['get'], url_path='groups')
    def get_groups_changes(self, request):
        groups_changes = courses_selectors.get_all_changes()
        serialized_changes = []
        for change in groups_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)
    
    @action(detail=False, methods=['get'], url_path='subjects')
    def get_subjects_changes(self, request):
        subjects_changes = courses_selectors.get_all_changes()
        serialized_changes = []
        for change in subjects_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)