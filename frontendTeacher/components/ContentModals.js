import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, Modal, StyleSheet, ScrollView, 
  Alert, TouchableOpacity, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Check, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react-native';
import { getTopicInfo, getConceptInfo } from '../api/contentRequests';
import { StyledButton } from './StyledButton';
import { useLanguage } from '../context/LanguageContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
        <TouchableOpacity
          key={item.id}
          style={[styles.chip, isSelected && styles.chipSelected]}
          onPress={() => onToggle(item.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
            {item[labelKey] || item.title || item.name_es} 
          </Text>
          {isSelected && <Check size={14} color={COLORS.white} style={{ marginLeft: 4 }} />}
        </TouchableOpacity>
      );
    })}
  </View>
);

const ModalWrapper = ({ visible, title, onClose, children, onSave }) => {
    const { t } = useLanguage();
    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.centeredView}
            >
            <View style={styles.modalView}>
                <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                    <X size={24} color={COLORS.text} />
                </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {children}
                </ScrollView>

                <View style={styles.buttonRow}>
                <StyledButton title={t('cancel')} onPress={onClose} variant='secondary' style={{flex: 1, marginRight: 8}} />
                <StyledButton title={t('save')} onPress={onSave} style={{flex: 1, marginLeft: 8}} />
                </View>
            </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

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
    <ModalWrapper visible={visible} onClose={onClose} onSave={handleSubmit} title={editingTopic ? t('edit') + ' ' + t('topic') : t('newQuestion') + ' ' + t('topic')}>
      <Text style={styles.sectionLabel}>Datos Generales</Text>
      <TextInput style={styles.input} placeholder="Título (Español)" value={data.title_es} onChangeText={t => setData({...data, title_es: t})} placeholderTextColor={COLORS.textSecondary} />
      <TextInput style={styles.input} placeholder="Title (English)" value={data.title_en} onChangeText={t => setData({...data, title_en: t})} placeholderTextColor={COLORS.textSecondary} />
      <TextInput style={[styles.input, styles.textArea]} placeholder="Descripción (Español)" multiline value={data.description_es} onChangeText={t => setData({...data, description_es: t})} placeholderTextColor={COLORS.textSecondary} />
      <TextInput style={[styles.input, styles.textArea]} placeholder="Description (English)" multiline value={data.description_en} onChangeText={t => setData({...data, description_en: t})} placeholderTextColor={COLORS.textSecondary} />
      
      <View style={{height: 10}} />

      <CollapsibleSection title={t('subjects')} count={data.subject_ids.length}>
        <MultiSelect items={allSubjects} selectedIds={data.subject_ids} onToggle={(id) => toggleSelection('subject_ids', id)} labelKey="name" />
      </CollapsibleSection>

      <CollapsibleSection title={t('concepts')} count={data.concept_ids.length}>
        <MultiSelect items={allConcepts} selectedIds={data.concept_ids} onToggle={(id) => toggleSelection('concept_ids', id)} labelKey="name" />
      </CollapsibleSection>
    </ModalWrapper>
  );
};

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

  const updateRelationDescES = (id, text) => {
    setRelatedConcepts(prev => prev.map(r => r.id === id ? { ...r, description_es: text } : r));
  };

  const updateRelationDescEN = (id, text) => {
    setRelatedConcepts(prev => prev.map(r => r.id === id ? { ...r, description_en: text } : r));
  };

  const availableConceptsToLink = allConcepts.filter(c => !editingConcept || c.id !== editingConcept.id);
  const selectedIds = relatedConcepts.map(r => r.id);

  const handleSubmit = () => {
    if (!data.name_es) return Alert.alert(t('error'), 'El nombre en español es obligatorio');
    onSubmit({ ...data, related_concepts: relatedConcepts }, originalRelatedIds);
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} onSave={handleSubmit} title={editingConcept ? t('edit') + ' ' + t('concept') : t('newQuestion') + ' ' + t('concept')}>
      <Text style={styles.sectionLabel}>Definición</Text>
      <TextInput style={styles.input} placeholder="Nombre (ES)" value={data.name_es} onChangeText={t => setData({...data, name_es: t})} placeholderTextColor={COLORS.textSecondary} />
      <TextInput style={styles.input} placeholder="Name (EN)" value={data.name_en} onChangeText={t => setData({...data, name_en: t})} placeholderTextColor={COLORS.textSecondary} />
      <TextInput style={[styles.input, styles.textArea]} placeholder="Descripción (ES)" multiline value={data.description_es} onChangeText={t => setData({...data, description_es: t})} placeholderTextColor={COLORS.textSecondary} />
      <TextInput style={[styles.input, styles.textArea]} placeholder="Description (EN)" multiline value={data.description_en} onChangeText={t => setData({...data, description_en: t})} placeholderTextColor={COLORS.textSecondary} />

      <View style={styles.separator} />

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
              
              <Text style={{fontSize: 10, color: 'gray', marginBottom: 2}}>Explicación (ES)</Text>
              <TextInput 
                style={[styles.relationInput, {marginBottom: 8}]} 
                placeholder="Ej: Es un tipo de..." 
                value={relation.description_es}
                onChangeText={(t) => updateRelationDescES(relation.id, t)}
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={{fontSize: 10, color: 'gray', marginBottom: 2}}>Explanation (EN)</Text>
              <TextInput 
                style={styles.relationInput} 
                placeholder="Ex: It is a type of..." 
                value={relation.description_en}
                onChangeText={(t) => updateRelationDescEN(relation.id, t)}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          ))}
        </View>
      )}
    </ModalWrapper>
  );
};

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
    <ModalWrapper visible={visible} onClose={onClose} onSave={handleSubmit} title={editingEpigraph ? t('edit') + ' ' + t('epigraphs') : t('newQuestion') + ' ' + t('epigraphs')}>
      <View style={{flexDirection: 'row', gap: 10}}>
        <View style={{flex: 1}}>
          <Text style={styles.labelSmall}>Orden</Text>
          <TextInput style={styles.input} placeholder="Ej: 1.1" value={data.order_id} onChangeText={t => setData({...data, order_id: t})} keyboardType="numeric" placeholderTextColor={COLORS.textSecondary} />
        </View>
        <View style={{flex: 3}}>
          <Text style={styles.labelSmall}>Nombre</Text>
          <TextInput style={styles.input} placeholder="Nombre (ES)" value={data.name_es} onChangeText={t => setData({...data, name_es: t})} placeholderTextColor={COLORS.textSecondary} />
        </View>
      </View>
      
      <TextInput style={styles.input} placeholder="Name (EN)" value={data.name_en} onChangeText={t => setData({...data, name_en: t})} placeholderTextColor={COLORS.textSecondary} />
      <Text style={styles.sectionLabel}>Contenido</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Texto del epígrafe (ES)" multiline value={data.description_es} onChangeText={t => setData({...data, description_es: t})} placeholderTextColor={COLORS.textSecondary} />
      <TextInput style={[styles.input, styles.textArea]} placeholder="Text of heading (EN)" multiline value={data.description_en} onChangeText={t => setData({...data, description_en: t})} placeholderTextColor={COLORS.textSecondary} />
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  centeredView: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: COLORS.overlay 
  },
  modalView: { 
    width: '90%', 
    maxHeight: '85%', 
    backgroundColor: COLORS.surface, 
    borderRadius: 20, 
    padding: 0, 
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLORS.text, 
    flex: 1 
  },
  closeIcon: {
    padding: 5,
  },
  modalScroll: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 10,
    marginTop: 5,
  },
  labelSmall: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: 'bold'
  },
  input: { 
    backgroundColor: COLORS.background,
    borderWidth: 1, 
    borderColor: 'transparent', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 12,
    fontSize: 15,
    color: COLORS.text
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  buttonRow: { 
    flexDirection: 'row', 
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background
  },
  
  collapsibleContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.background,
  },
  collapsibleTitle: {
    fontWeight: '600',
    color: COLORS.text,
    fontSize: 15
  },
  collapsibleContent: {
    padding: 15,
    backgroundColor: COLORS.surface
  },

  multiSelectContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
  },
  chip: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    backgroundColor: COLORS.surface, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  chipSelected: { 
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 2
  },
  chipText: { 
    fontSize: 13, 
    color: COLORS.textSecondary 
  },
  chipTextSelected: { 
    color: COLORS.white, 
    fontWeight: '600' 
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15
  },
  relationCard: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  relationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  relationTitle: {
    fontWeight: 'bold',
    color: COLORS.text
  },
  relationInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 13
  }
});