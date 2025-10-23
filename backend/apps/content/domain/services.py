# apps/content/domain/services.py
from ..api.models import Topic, Concept, Epigraph, TopicIsAboutConcept
from django.core.exceptions import ValidationError

# --- Topic Services ---
def create_topic(title_es: str, title_en: str, description_es=None, description_en=None) -> Topic:
    """Crea un nuevo Topic con validaciones básicas."""
    if not title_es and not title_en:
        raise ValidationError("Debe proporcionar al menos un título en algún idioma.")
    topic = Topic.objects.create(
        title_es=title_es,
        title_en=title_en,
        description_es=description_es,
        description_en=description_en,
    )
    return topic

# --- Concept Services ---
def create_concept(name_es: str, name_en: str, description_es=None, description_en=None) -> Concept:
    """Crea un nuevo Concept."""
    if Concept.objects.filter(name_es=name_es).exists():
        raise ValidationError("Ya existe un concepto con ese nombre.")
    if Concept.objects.filter(name_en=name_en).exists():
        raise ValidationError("Exists a concept with that name already.")
    
    if not name_es and not name_en:
        raise ValidationError("Debe proporcionar al menos un nombre.")
    return Concept.objects.create(
        name_es=name_es,
        name_en=name_en,
        description_es=description_es,
        description_en=description_en,
    )


# --- Epigraph Services ---
def create_epigraph(topic: Topic, name_es: str, name_en: str, order_id: int, description_es=None, description_en=None) -> Epigraph:
    """Crea un epígrafe para un tema, asegurando que no se duplique el orden."""
    if Epigraph.objects.filter(topic=topic, order_id=order_id).exists():
        raise ValidationError("Ya existe un epígrafe con ese orden en este tema.")
    return Epigraph.objects.create(
        topic=topic,
        name_es=name_es,
        name_en=name_en,
        description_es=description_es,
        description_en=description_en,
        order_id=order_id,
    )
def update_epigraph(epigraph: Epigraph, name_es: str = None, name_en: str = None,
                    order_id: int = None, description_es: str = None, description_en: str = None) -> Epigraph:
    """Actualiza un epígrafe con los nuevos datos proporcionados."""
    if order_id is not None and epigraph.order_id != order_id:
        if Epigraph.objects.filter(topic=epigraph.topic, order_id=order_id).exclude(id=epigraph.id).exists():
            raise ValidationError("Ya existe un epígrafe con ese orden en este tema.")
        epigraph.order_id = order_id
    if name_es is not None:
        epigraph.name_es = name_es
    if name_en is not None:
        epigraph.name_en = name_en
    if description_es is not None:
        epigraph.description_es = description_es
    if description_en is not None:
        epigraph.description_en = description_en
    epigraph.save()
    return epigraph
 
# --- Topic ↔ Concept relation ---
def link_concept_to_topic(topic: Topic, concept: Concept, order_id: int) -> TopicIsAboutConcept:
    """Asocia un concepto a un topic, con orden definido."""
    if TopicIsAboutConcept.objects.filter(topic=topic, concept=concept).exists():
        raise ValidationError("Este concepto ya está asociado al tema.")
    return TopicIsAboutConcept.objects.create(topic=topic, concept=concept, order_id=order_id)

def unlink_concept_from_topic(topic: Topic, concept: Concept) -> None:
    """Desasocia un concepto de un topic."""
    relation = TopicIsAboutConcept.objects.filter(topic=topic, concept=concept)
    if not relation.exists():
        raise ValidationError("Este concepto no está asociado al tema.")
    relation.delete()