# apps/content/domain/selectors.py
from .models import Topic, Concept, Epigraph

def get_all_topics():
    """Devuelve todos los temas con sus epígrafes y conceptos precargados."""
    return Topic.objects.prefetch_related('epigraphs', 'concepts').all()

def get_topic_by_id(topic_id: int) -> Topic:
    """Obtiene un topic específico con sus relaciones."""
    return Topic.objects.prefetch_related('epigraphs', 'concepts').get(id=topic_id)

def get_all_concepts():
    """Devuelve todos los conceptos."""
    return Concept.objects.all()

def get_all_epigraphs():
    """Devuelve todos los epígrafes."""
    return Epigraph.objects.select_related('topic').all()

def get_epigraphs_by_topic(topic_id: int):
    """Devuelve todos los epígrafes pertenecientes a un tema."""
    return Epigraph.objects.filter(topic_id=topic_id).order_by('order_id')


# --- SPECIFIC SELECTORS ---

def get_concepts_by_topic(topic_id: int):
    """Devuelve los conceptos asociados a un tema concreto."""
    return Concept.objects.filter(topics__id=topic_id).distinct()

def get_epigraphs_by_topic(topic_id: int):
    """Devuelve los epígrafes pertenecientes a un tema concreto."""
    return Epigraph.objects.filter(topic_id=topic_id).order_by('order_id')