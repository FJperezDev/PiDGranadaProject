import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { Check, X } from 'lucide-react-native';
import { getConceptInfo, getTopicInfo } from '../api/contentRequests'

// --- COMPONENTE AUXILIAR PARA SELECCIÓN MÚLTIPLE ---
const MultiSelect = ({ items, selectedIds, onToggle, labelKey = 'name' }) => (
  <View style={styles.multiSelectContainer}>
    {items.map((item) => {
      const isSelected = selectedIds.includes(item.id);
      return (
        <TouchableOpacity
          key={item.id}
          style={[styles.chip, isSelected && styles.chipSelected]}
          onPress={() => onToggle(item.id)}
        >
          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
            {item[labelKey] || item.title || item.name_es} 
          </Text>
          {isSelected && <Check size={14} color="white" style={{ marginLeft: 4 }} />}
        </TouchableOpacity>
      );
    })}
  </View>
);

// --- TOPIC MODAL (Crear / Editar) ---
export const TopicModal = ({ visible, onClose, onSubmit, editingTopic, allSubjects = [], allConcepts = [] }) => {
  const [data, setData] = useState({ 
    title_es: '', title_en: '', description_es: '', description_en: '', 
    subject_ids: [], concept_ids: [] 
  });

  const [originalSubjectIds, setOriginalSubjectIds] = useState([]);
  const [originalConceptIds, setOriginalConceptIds] = useState([]);

  useEffect(() => {
    const loadTopicData = async () => {
      if (editingTopic) {
        try{
          const detailedTopic = await getTopicInfo(editingTopic.id);
          const existingSubjectIds = detailedTopic.subjects ? detailedTopic.subjects.map(s => s.id) : [];
          const existingConceptIds = detailedTopic.concepts ? detailedTopic.concepts.map(c => c.id) : [];
          console.log(detailedTopic)

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
        } catch (err){
          console.error("Error: ", err);
        }
      } else {
        setData({ title_es: '', title_en: '', description_es: '', description_en: '', subject_ids: [], concept_ids: [] });
        setOriginalSubjectIds([]);
        setOriginalConceptIds([]);
      }
    }
    if(visible)
      loadTopicData();
    
  }, [editingTopic, visible]);

  const toggleSubject = (id) => {
    setData(prev => ({
      ...prev,
      subject_ids: prev.subject_ids.includes(id) 
        ? prev.subject_ids.filter(sid => sid !== id) 
        : [...prev.subject_ids, id]
    }));
  };

  const toggleConcept = (id) => {
    setData(prev => ({
      ...prev,
      concept_ids: prev.concept_ids.includes(id)
        ? prev.concept_ids.filter(cid => cid !== id)
        : [...prev.concept_ids, id]
    }));
  };

  const handleSubmit = () => {
    if (!data.title_es) { Alert.alert('Error', 'El título en español es obligatorio'); return; }
    onSubmit(data, originalSubjectIds, originalConceptIds);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{editingTopic ? 'Editar Tema' : 'Nuevo Tema'}</Text>
          <ScrollView>
            <Text style={styles.label}>Información Básica</Text>
            <TextInput style={styles.input} placeholder="Título (ES)" value={data.title_es} onChangeText={t => setData({...data, title_es: t})} />
            <TextInput style={styles.input} placeholder="Title (EN)" value={data.title_en} onChangeText={t => setData({...data, title_en: t})} />
            <TextInput style={styles.input} placeholder="Descripción (ES)" multiline value={data.description_es} onChangeText={t => setData({...data, description_es: t})} />
            <TextInput style={styles.input} placeholder="Description (EN)" multiline value={data.description_en} onChangeText={t => setData({...data, description_en: t})} />
            
            <Text style={styles.label}>Vincular Asignaturas</Text>
            <MultiSelect items={allSubjects} selectedIds={data.subject_ids} onToggle={toggleSubject} labelKey="name" />

            <Text style={styles.label}>Vincular Conceptos</Text>
            <MultiSelect items={allConcepts} selectedIds={data.concept_ids} onToggle={toggleConcept} labelKey="name" />
          </ScrollView>
          
          <View style={styles.buttonRow}>
            <Button title="Cancelar" onPress={onClose} color={COLORS.danger || 'red'} />
            <Button title="Guardar" onPress={handleSubmit} color={COLORS.primary} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const ConceptModal = ({ visible, onClose, onSubmit, editingConcept, allConcepts = [] }) => {
  const [data, setData] = useState({ name_es: '', name_en: '', description_es:'', description_en:'', related_concept_ids: [] });
  const [originalRelatedIds, setOriginalRelatedIds] = useState([]);

  useEffect(() => {
    const loadConceptData = async () => {
      if (editingConcept) {
        try{
          const detailedConcept = await getConceptInfo(editingConcept.id)
          console.log(detailedConcept)
          const existingRelatedIds = detailedConcept.related_concepts ? detailedConcept.related_concepts.map(c => c.id) : [];

          setData({
            name_es: detailedConcept.name_es || '',
            name_en: detailedConcept.name_en || '',
            description_es: detailedConcept.description_es || '',
            description_en: detailedConcept.description_en || '',
            related_concept_ids: existingRelatedIds,
          });
          setOriginalRelatedIds(existingRelatedIds);
        } catch (err){
          console.error("Error: ", err);
        }
        
      } else {
        setData({ name_es: '', name_en: '', description_es: '', description_en: '', related_concept_ids: [] });
        setOriginalRelatedIds([]);
      }
    }
    if(visible)
      loadConceptData();
  }, [editingConcept, visible]);

  const toggleRelated = (id) => {
    setData(prev => ({
      ...prev,
      related_concept_ids: prev.related_concept_ids.includes(id)
        ? prev.related_concept_ids.filter(cid => cid !== id)
        : [...prev.related_concept_ids, id]
    }));
  };

  const availableConceptsToLink = allConcepts.filter(c => !editingConcept || c.id !== editingConcept.id);

  const handleSubmit = () => {
    if (!data.name_es) { Alert.alert('Error', 'El nombre es obligatorio'); return; }
    onSubmit(data, originalRelatedIds);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{editingConcept ? 'Editar Concepto' : 'Nuevo Concepto'}</Text>
          <ScrollView>
            <Text style={styles.label}>Información</Text>
            <TextInput style={styles.input} placeholder="Nombre (ES)" value={data.name_es} onChangeText={t => setData({...data, name_es: t})} />
            <TextInput style={styles.input} placeholder="Name (EN)" value={data.name_en} onChangeText={t => setData({...data, name_en: t})} />
            <TextInput style={styles.input} placeholder="Descripcion (ES)" value={data.description_es} onChangeText={t => setData({...data, description_es: t})} />
            <TextInput style={styles.input} placeholder="Description (EN)" value={data.description_en} onChangeText={t => setData({...data, description_en: t})} />
            
            <Text style={styles.label}>Conceptos Relacionados</Text>
            {availableConceptsToLink.length === 0 ? (
               <Text style={styles.hint}>No hay otros conceptos disponibles.</Text>
            ) : (
               <MultiSelect items={availableConceptsToLink} selectedIds={data.related_concept_ids} onToggle={toggleRelated} labelKey="name" />
            )}
          </ScrollView>

          <View style={styles.buttonRow}>
            <Button title="Cancelar" onPress={onClose} color={COLORS.danger || 'red'} />
            <Button title="Guardar" onPress={handleSubmit} color={COLORS.primary} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const EpigraphModal = ({ visible, onClose, onSubmit, editingEpigraph }) => {
  const [data, setData] = useState({ 
    order_id: '', 
    name_es: '', 
    name_en: '', 
    description_es: '', 
    description_en: '' 
  });

  // Efecto para cargar datos si estamos editando
  useEffect(() => {
    if (editingEpigraph) {
      setData({
        order_id: editingEpigraph.order_id ? String(editingEpigraph.order_id) : '', 
        name_es: editingEpigraph.name_es || editingEpigraph.name || '',
        name_en: editingEpigraph.name_en || '',
        description_es: editingEpigraph.description_es || '',
        description_en: editingEpigraph.description_en || ''
      });
    } else {
      // Limpiar si es creación
      setData({ order_id: '', name_es: '', name_en: '', description_es: '', description_en: '' });
    }
  }, [editingEpigraph, visible]);

  const handleSubmit = () => {
    if (!data.name_es || !data.order_id) { 
        Alert.alert('Error', 'El Nombre (ES) y el ID de Orden son obligatorios'); 
        return; 
    }
    onSubmit(data);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {editingEpigraph ? 'Editar Epígrafe' : 'Nuevo Epígrafe'}
          </Text>
          <ScrollView>
            <Text style={styles.label}>Orden y Nombres</Text>
            <TextInput 
                style={styles.input} 
                placeholder="ID Orden (ej: 1, 1.1)" 
                value={data.order_id} 
                onChangeText={t => setData({...data, order_id: t})} 
                keyboardType="numeric"
            />
            <TextInput 
                style={styles.input} 
                placeholder="Nombre (ES)" 
                value={data.name_es} 
                onChangeText={t => setData({...data, name_es: t})} 
            />
            <TextInput 
                style={styles.input} 
                placeholder="Name (EN)" 
                value={data.name_en} 
                onChangeText={t => setData({...data, name_en: t})} 
            />
            
            <Text style={styles.label}>Descripciones</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Descripción (ES)" 
                multiline 
                value={data.description_es} 
                onChangeText={t => setData({...data, description_es: t})} 
            />
            <TextInput 
                style={styles.input} 
                placeholder="Description (EN)" 
                multiline 
                value={data.description_en} 
                onChangeText={t => setData({...data, description_en: t})} 
            />
          </ScrollView>
          
          <View style={styles.buttonRow}>
            <Button title="Cancelar" onPress={onClose} color={COLORS.danger || 'red'} />
            <Button title="Guardar" onPress={handleSubmit} color={COLORS.primary} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', maxHeight: '85%', backgroundColor: 'white', borderRadius: 10, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: COLORS.text },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: '#555' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  multiSelectContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#f9f9f9', flexDirection: 'row', alignItems: 'center' },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, color: '#333' },
  chipTextSelected: { color: 'white', fontWeight: 'bold' },
  hint: { fontStyle: 'italic', color: 'gray', fontSize: 12 }
});