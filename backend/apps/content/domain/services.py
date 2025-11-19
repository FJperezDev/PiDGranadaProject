# apps/content/domain/services.py
from ..api.models import Topic, Concept, Epigraph, TopicIsAboutConcept, ConceptIsRelatedToConcept
from django.core.exceptions import ValidationError
from apps.utils.audit import makeChanges
from apps.customauth.models import CustomTeacher
from apps.content.domain import selectors

# --- Topic Services ---
def create_topic(title_es: str, title_en: str, teacher: CustomTeacher, description_es=None, description_en=None) -> Topic:
    """Crea un nuevo Topic con validaciones básicas."""
    if not title_es and not title_en:
        raise ValidationError("Debe proporcionar al menos un título en algún idioma.")
    topic = Topic.objects.create(
        title_es=title_es,
        title_en=title_en,
        description_es=description_es,
        description_en=description_en,
    )
    makeChanges(user=teacher, old_object=None, new_object=topic)

    return topic

def update_topic(topic: Topic, teacher: CustomTeacher, title_es: str = None, title_en: str = None,
                 description_es: str = None, description_en: str = None) -> Topic:
    """Actualiza un topic con los nuevos datos proporcionados."""
    old_topic = Topic.objects.get(pk=topic.pk)
    old_topic.pk = None
    if title_es is not None:
        topic.title_es = title_es
    if title_en is not None:
        topic.title_en = title_en
    if description_es is not None:
        topic.description_es = description_es
    if description_en is not None:
        topic.description_en = description_en
    topic.save()
    old_topic.save()
    makeChanges(user=teacher, old_object=old_topic, new_object=topic)

    return topic

def delete_topic(topic: Topic, teacher: CustomTeacher):
    makeChanges(user=teacher, old_object=topic, new_object=None)
    return topic.delete()

# --- Concept Services ---
def create_concept(name_es: str, name_en: str, teacher: CustomTeacher,description_es=None, description_en=None) -> Concept:
    """Crea un nuevo Concept."""
    if Concept.objects.filter(name_es=name_es).exists():
        raise ValidationError("Ya existe un concepto con ese nombre.")
    if Concept.objects.filter(name_en=name_en).exists():
        raise ValidationError("Exists a concept with that name already.")
    
    if not name_es and not name_en:
        raise ValidationError("Debe proporcionar al menos un nombre.")
    
    concept = Concept.objects.create(
        name_es=name_es,
        name_en=name_en,
        description_es=description_es,
        description_en=description_en,
    )
    makeChanges(user=teacher, old_object=None, new_object=concept)
    return concept

def update_concept(concept: Concept, teacher: CustomTeacher, name_es: str = None, name_en: str = None,
                   description_es: str = None, description_en: str = None) -> Concept:
    """Actualiza un concepto con los nuevos datos proporcionados."""
    old_concept = Concept.objects.get(pk=concept.pk)
    old_concept.pk = None
    if name_es is not None:
        concept.name_es = name_es
    if name_en is not None:
        concept.name_en = name_en
    if description_es is not None:
        concept.description_es = description_es
    if description_en is not None:
        concept.description_en = description_en
    concept.save()
    old_concept.save()
    makeChanges(user=teacher, old_object=old_concept, new_object=concept)
    return concept

def delete_concept(concept: Concept, teacher: CustomTeacher):
    makeChanges(user=teacher, old_object=concept, new_object=None)
    return concept.delete()

# --- Epigraph Services ---
def create_epigraph(topic: Topic, name_es: str, teacher: CustomTeacher, name_en: str, order_id: int, description_es=None, description_en=None) -> Epigraph:
    """Crea un epígrafe para un tema, asegurando que no se duplique el orden."""
    if Epigraph.objects.filter(topic=topic, order_id=order_id).exists():
        raise ValidationError("Ya existe un epígrafe con ese orden en este tema.")
    epigraph = Epigraph.objects.create(
        topic=topic,
        name_es=name_es,
        name_en=name_en,
        description_es=description_es,
        description_en=description_en,
        order_id=order_id,
    )

    makeChanges(user=teacher, old_object=None, new_object=epigraph)
    
    return epigraph

def update_epigraph(epigraph: Epigraph, teacher: CustomTeacher, name_es: str = None, name_en: str = None,
                    order_id: int = None, description_es: str = None, description_en: str = None) -> Epigraph:
    """Actualiza un epígrafe con los nuevos datos proporcionados."""
    old_epigraph = Epigraph.objects.get(pk=epigraph.pk)
    old_epigraph.pk = None
    if order_id is not None and epigraph.order_id != order_id:
        if Epigraph.objects.filter(topic=epigraph.topic, order_id=order_id).exclude(pk=epigraph.pk).exists():
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
    old_epigraph.save()
    makeChanges(user=teacher, old_object=old_epigraph, new_object=epigraph)

    return epigraph

def delete_epigraph(epigraph: Epigraph, teacher: CustomTeacher):
    makeChanges(user=teacher, old_object=epigraph, new_object=None)
    return epigraph.delete()

def delete_epigraphs_by_topic(topic: Topic, teacher: CustomTeacher):
    epigraphs = selectors.get_epigraphs_by_topic(topic)
    for epigraph in epigraphs:
        makeChanges(user=teacher, old_object=epigraph, new_object=None)
    epigraphs.delete()

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

# --- Concept ↔ Concept relation ---
def link_concepts(concept_from: Concept, concept_to: Concept, bidirectional=False):
    """Asocia uno o dos conceptos (de forma opcional bidireccional)."""
    if concept_from == concept_to:
        raise ValidationError("No se puede asociar un concepto consigo mismo.")
    
    if ConceptIsRelatedToConcept.objects.filter(
        concept_from=concept_from, concept_to=concept_to
    ).exists():
        raise ValidationError("Estos conceptos ya están relacionados.")
    
    ConceptIsRelatedToConcept.objects.create(
        concept_from=concept_from, concept_to=concept_to
    )

    if bidirectional:
        ConceptIsRelatedToConcept.objects.get_or_create(
            concept_from=concept_to, concept_to=concept_from
        )

def unlink_concepts(concept_from: Concept, concept_to: Concept, bidirectional=False) -> None:
    """Desasocia dos conceptos entre sí."""
    relations = ConceptIsRelatedToConcept.objects.filter(
        concept_from=concept_from, concept_to=concept_to
    )

    if not relations.exists():
        raise ValidationError("Estos conceptos no están relacionados.")
    
    relations.delete()

    if bidirectional:
        ConceptIsRelatedToConcept.objects.filter(
            concept_from=concept_to, concept_to=concept_from
        ).delete()