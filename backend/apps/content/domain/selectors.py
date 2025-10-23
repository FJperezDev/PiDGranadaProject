# apps/content/domain/selectors.py
from ..api.models import Topic, Concept, Epigraph

def get_all_topics():
    """Devuelve todos los temas con sus epígrafes y conceptos precargados."""
    return Topic.objects.prefetch_related('epigraphs', 'concepts').all()

def get_topic_by_id(topic_id: int) -> Topic:
    """Obtiene un topic específico con sus relaciones."""
    return Topic.objects.prefetch_related('epigraphs', 'concepts').get(id=topic_id)

def get_topic_by_title(title: str):
    """Devuelve un topic específico por su título en cualquier idioma."""
    return Topic.objects.filter(title_es=title).first() or Topic.objects.filter(title_en=title).first()

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

def get_concept_by_name(name: str):
    """Devuelve un concepto específico por su nombre en cualquier idioma."""
    return Concept.objects.filter(name_es=name).first() or Concept.objects.filter(name_en=name).first()

def get_concepts_by_topic(topic_id: int):
    """Devuelve los conceptos asociados a un tema concreto."""
    return Concept.objects.filter(topics__id=topic_id).distinct()

def get_epigraphs_by_topic(topic_id: int):
    """Devuelve los epígrafes pertenecientes a un tema concreto."""
    return Epigraph.objects.filter(topic_id=topic_id).order_by('order_id')

def get_epigraph_by_id(topic_id: int, order_id: int) -> Epigraph:
    """Obtiene un epígrafe específico por su ID."""
    return Epigraph.objects.get(order_id=order_id, topic_id=topic_id)