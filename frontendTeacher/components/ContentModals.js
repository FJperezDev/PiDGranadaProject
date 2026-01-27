import React, { useState, useEffect } from 'react';
import { 
  View, Text, Modal, StyleSheet, ScrollView, Alert, 
  TouchableOpacity, KeyboardAvoidingView, Platform, LayoutAnimation 
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Check, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react-native';
import { getTopicInfo, getConceptInfo } from '../api/contentRequests';
import { StyledButton } from './StyledButton';
import { StyledTextInput } from './StyledTextInput';
import { useLanguage } from '../context/LanguageContext';

// --- COMPONENTES AUXILIARES ---

const CollapsibleSection = ({ title, count, children, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.collapsibleContainer}>
      <TouchableOpacity onPress={toggleExpand} style={styles.collapsibleHeader} activeOpacity={0.7}>
        <Text style={styles.collapsibleTitle}>
          {title} {count > 0 && <Text style={{color: COLORS.primary}}>({count})</Text>}
        </Text>
        {expanded ? <ChevronUp size={20} color={COLORS.textSecondary} /> : <ChevronDown size={20} color={COLORS.textSecondary} />}
      </TouchableOpacity>
      {expanded && <View style={styles.collapsibleContent}>{children}</View>}
    </View>
  );
};

const MultiSelect = ({ items, selectedIds, onToggle, labelKey = 'name' }) => (
  <View style={styles.multiSelectContainer}>
    {items.map((item) => {
      const isSelected = selectedIds.includes(item.id);
      return (
        <StyledButton
          key={item.id}
          onPress={() => onToggle(item.id)}
          variant={isSelected ? 'primary' : 'outline'}
          size="small"
          style={[styles.chip, !isSelected && { borderColor: COLORS.border }]} // Borde gris si no seleccionado
          textStyle={!isSelected ? { color: COLORS.textSecondary } : {}}
        >
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={[styles.chipText, isSelected ? {color: COLORS.white} : {color: COLORS.textSecondary}]}>
                {item[labelKey] || item.title || item.name_es}
            </Text>
            {isSelected && <Check size={14} color={COLORS.white} style={{ marginLeft: 6 }} />}
          </View>
        </StyledButton>
      );
    })}
  </View>
);

const ModalWrapper = ({ visible, title, onClose, children, onSave }) => {
    const { t } = useLanguage();
    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <StyledButton onPress={onClose} variant="ghost" style={{padding: 4}}>
                            <X size={24} color={COLORS.textSecondary} />
                        </StyledButton>
                    </View>

                    <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                        {children}
                    </ScrollView>

                    <View style={styles.buttonRow}>
                        <StyledButton title={t('cancel')} onPress={onClose} variant='ghost' style={{flex: 1, marginRight: 8}} />
                        <StyledButton title={t('save')} onPress={onSave} style={{flex: 1, marginLeft: 8}} />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// --- MODAL TEMA ---
export const TopicModal = ({ visible, onClose, onSubmit, editingTopic, allSubjects = [], allConcepts = [] }) => {
  const { t } = useLanguage();
  const [data, setData] = useState({ 
    title_es: '', title_en: '', description_es: '', description_en: '', 
    subject_ids: [], concept_ids: [] 
  });
  const [originalSubjectIds, setOriginalSubjectIds] = useState([]);
  const [originalConceptIds, setOriginalConceptIds] = useState([]);

  useEffect(() => {
    if (visible && editingTopic) {
      getTopicInfo(editingTopic.id).then(detailedTopic => {
        const existingSubjectIds = detailedTopic.subjects ? detailedTopic.subjects.map(s => s.id) : [];
        const existingConceptIds = detailedTopic.concepts ? detailedTopic.concepts.map(c => c.id) : [];
        setData({
          title_es: detailedTopic.title_es || detailedTopic.title || '',
          title_en: detailedTopic.title_en || '',
          description_es: detailedTopic.description_es || detailedTopic.description || '',
          description_en: detailedTopic.description_en || '',
          subject_ids: existingSubjectIds,
          concept_ids: existingConceptIds
        });
        setOriginalSubjectIds(existingSubjectIds);
        setOriginalConceptIds(existingConceptIds);
      }).catch(err => console.error(err));
    } else if (visible) {
      setData({ title_es: '', title_en: '', description_es: '', description_en: '', subject_ids: [], concept_ids: [] });
    }
  }, [visible, editingTopic]);

  const toggleSelection = (key, id) => {
    setData(prev => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter(x => x !== id) : [...prev[key], id]
    }));
  };

  const handleSubmit = () => {
    if (!data.title_es) return Alert.alert(t('error'), 'El título en español es obligatorio');
    onSubmit(data, originalSubjectIds, originalConceptIds);
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} onSave={handleSubmit} title={editingTopic ? t('edit') : t('create')}>
      <Text style={styles.sectionLabel}>Datos Generales</Text>
      <StyledTextInput placeholder="Título (Español)" value={data.title_es} onChangeText={t => setData({...data, title_es: t})} style={{marginBottom: 10}} />
      <StyledTextInput placeholder="Title (English)" value={data.title_en} onChangeText={t => setData({...data, title_en: t})} style={{marginBottom: 10}} />
      <StyledTextInput placeholder="Descripción (Español)" multiline numberOfLines={3} value={data.description_es} onChangeText={t => setData({...data, description_es: t})} style={[styles.textArea, {marginBottom: 10}]} />
      <StyledTextInput placeholder="Description (English)" multiline numberOfLines={3} value={data.description_en} onChangeText={t => setData({...data, description_en: t})} style={[styles.textArea, {marginBottom: 15}]} />
      
      <CollapsibleSection title={t('subjects')} count={data.subject_ids.length}>
        <MultiSelect items={allSubjects} selectedIds={data.subject_ids} onToggle={(id) => toggleSelection('subject_ids', id)} labelKey="name" />
      </CollapsibleSection>

      <View style={{height: 10}} />

      <CollapsibleSection title={t('concepts')} count={data.concept_ids.length}>
        <MultiSelect items={allConcepts} selectedIds={data.concept_ids} onToggle={(id) => toggleSelection('concept_ids', id)} labelKey="name" />
      </CollapsibleSection>
    </ModalWrapper>
  );
};

// --- MODAL CONCEPTO ---
export const ConceptModal = ({ visible, onClose, onSubmit, editingConcept, allConcepts = [] }) => {
  const { t } = useLanguage();
  const [data, setData] = useState({ name_es: '', name_en: '', description_es:'', description_en:'' });
  
  const [relatedConcepts, setRelatedConcepts] = useState([]); 
  const [originalRelatedIds, setOriginalRelatedIds] = useState([]);

  useEffect(() => {
    if (visible && editingConcept) {
      getConceptInfo(editingConcept.id).then(detailed => {
        setData({
          name_es: detailed.name_es || '',
          name_en: detailed.name_en || '',
          description_es: detailed.description_es || '',
          description_en: detailed.description_en || '',
        });
        const related = detailed.related_concepts ? detailed.related_concepts.map(r => ({
          id: r.concept_to.id,
          name: r.concept_to.name || r.concept_to.name_es,
          description_es: r.description_es || '',
          description_en: r.description_en || '',
        })) : [];
        setRelatedConcepts(related);
        setOriginalRelatedIds(related.map(r => r.id));
      }).catch(err => console.error(err));
    } else if (visible) {
      setData({ name_es: '', name_en: '', description_es: '', description_en: '' });
      setRelatedConcepts([]);
      setOriginalRelatedIds([]);
    }
  }, [visible, editingConcept]);

  const toggleRelated = (item) => {
    if (relatedConcepts.find(r => r.id === item.id)) {
      setRelatedConcepts(prev => prev.filter(r => r.id !== item.id));
    } else {
      setRelatedConcepts(prev => [...prev, { id: item.id, name: item.name || item.name_es, description_es: '', description_en: '' }]);
    }
  };

  const updateRelationDesc = (id, lang, text) => {
    const key = lang === 'es' ? 'description_es' : 'description_en';
    setRelatedConcepts(prev => prev.map(r => r.id === id ? { ...r, [key]: text } : r));
  };

  const availableConceptsToLink = allConcepts.filter(c => !editingConcept || c.id !== editingConcept.id);
  const selectedIds = relatedConcepts.map(r => r.id);

  const handleSubmit = () => {
    if (!data.name_es) return Alert.alert(t('error'), 'El nombre en español es obligatorio');
    onSubmit({ ...data, related_concepts: relatedConcepts }, originalRelatedIds);
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} onSave={handleSubmit} title={editingConcept ? t('edit') : t('create')}>
      <Text style={styles.sectionLabel}>Definición</Text>
      <StyledTextInput placeholder="Nombre (ES)" value={data.name_es} onChangeText={t => setData({...data, name_es: t})} style={{marginBottom: 10}} />
      <StyledTextInput placeholder="Name (EN)" value={data.name_en} onChangeText={t => setData({...data, name_en: t})} style={{marginBottom: 10}} />
      <StyledTextInput placeholder="Descripción (ES)" multiline numberOfLines={3} value={data.description_es} onChangeText={t => setData({...data, description_es: t})} style={[styles.textArea, {marginBottom: 10}]} />
      <StyledTextInput placeholder="Description (EN)" multiline numberOfLines={3} value={data.description_en} onChangeText={t => setData({...data, description_en: t})} style={[styles.textArea, {marginBottom: 15}]} />

      <CollapsibleSection title={t('relatedTo')} count={relatedConcepts.length}>
        <MultiSelect items={availableConceptsToLink} selectedIds={selectedIds} onToggle={(id) => {
          const item = availableConceptsToLink.find(i => i.id === id);
          toggleRelated(item);
        }} labelKey="name" />
      </CollapsibleSection>

      {relatedConcepts.length > 0 && (
        <View style={{ marginTop: 15 }}>
          <Text style={styles.sectionLabel}>Detallar Relaciones</Text>
          {relatedConcepts.map(relation => (
            <View key={relation.id} style={styles.relationCard}>
              <View style={styles.relationHeader}>
                <Text style={styles.relationTitle}>{relation.name}</Text>
                <TouchableOpacity onPress={() => toggleRelated(relation)}>
                  <Trash2 size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
              
              <StyledTextInput 
                style={{marginBottom: 8, fontSize: 13, paddingVertical: 8}} 
                placeholder="Explicación (ES)" 
                value={relation.description_es}
                onChangeText={(t) => updateRelationDesc(relation.id, 'es', t)}
              />
              <StyledTextInput 
                style={{fontSize: 13, paddingVertical: 8}}
                placeholder="Explanation (EN)" 
                value={relation.description_en}
                onChangeText={(t) => updateRelationDesc(relation.id, 'en', t)}
              />
            </View>
          ))}
        </View>
      )}
    </ModalWrapper>
  );
};

// --- MODAL EPÍGRAFE ---
export const EpigraphModal = ({ visible, onClose, onSubmit, editingEpigraph }) => {
  const { t } = useLanguage();
  const [data, setData] = useState({ order_id: '', name_es: '', name_en: '', description_es: '', description_en: '' });

  useEffect(() => {
    if (visible) {
      if (editingEpigraph) {
        setData({
          order_id: editingEpigraph.order_id != null ? String(editingEpigraph.order_id) : '',
          name_es: editingEpigraph.name_es || '',
          name_en: editingEpigraph.name_en || '',
          description_es: editingEpigraph.description_es || '',
          description_en: editingEpigraph.description_en || ''
        });
      } else {
        setData({ order_id: '', name_es: '', name_en: '', description_es: '', description_en: '' });
      }
    }
  }, [visible, editingEpigraph]);

  const handleSubmit = () => {
    if (!data.name_es || !data.order_id) return Alert.alert(t('error'), 'El Nombre (ES) y el ID de Orden son obligatorios');
    onSubmit(data);
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} onSave={handleSubmit} title={editingEpigraph ? t('edit') : t('create')}>
      <View style={{flexDirection: 'row', gap: 10, marginBottom: 10}}>
        <View style={{flex: 1}}>
          <Text style={styles.labelSmall}>Orden</Text>
          <StyledTextInput placeholder="Ej: 1.1" value={data.order_id} onChangeText={t => setData({...data, order_id: t})} keyboardType="numeric" />
        </View>
        <View style={{flex: 3}}>
          <Text style={styles.labelSmall}>Nombre</Text>
          <StyledTextInput placeholder="Nombre (ES)" value={data.name_es} onChangeText={t => setData({...data, name_es: t})} />
        </View>
      </View>
      
      <StyledTextInput placeholder="Name (EN)" value={data.name_en} onChangeText={t => setData({...data, name_en: t})} style={{marginBottom: 15}} />
      
      <Text style={styles.sectionLabel}>Contenido</Text>
      <StyledTextInput placeholder="Texto del epígrafe (ES)" multiline numberOfLines={4} value={data.description_es} onChangeText={t => setData({...data, description_es: t})} style={[styles.textArea, {marginBottom: 10}]} />
      <StyledTextInput placeholder="Text of heading (EN)" multiline numberOfLines={4} value={data.description_en} onChangeText={t => setData({...data, description_en: t})} style={styles.textArea} />
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  centeredView: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: COLORS.overlay,
    padding: 20
  },
  modalView: { 
    width: '100%', 
    maxWidth: 500, 
    maxHeight: '90%', 
    backgroundColor: COLORS.surface, 
    borderRadius: 24, 
    padding: 0, 
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: COLORS.text, 
    flex: 1 
  },
  modalScroll: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  labelSmall: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '700'
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  buttonRow: { 
    flexDirection: 'row', 
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.surface
  },
  
  // Collapsible
  collapsibleContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.background, // Gris muy suave
  },
  collapsibleTitle: {
    fontWeight: '600',
    color: COLORS.text,
    fontSize: 15
  },
  collapsibleContent: {
    padding: 12,
    backgroundColor: COLORS.surface
  },

  multiSelectContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
  },
  chip: { 
    // Los estilos base los maneja StyledButton
    marginBottom: 4,
  },
  chipText: { 
    fontSize: 13, 
    fontWeight: '600',
  },

  // Relation Card
  relationCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight
  },
  relationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center'
  },
  relationTitle: {
    fontWeight: '700',
    color: COLORS.text,
    fontSize: 15
  },
});