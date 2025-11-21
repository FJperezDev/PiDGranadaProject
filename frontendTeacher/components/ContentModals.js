import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS } from '../constants/colors';

// 1. Modal para Crear/Editar TOPIC
export const TopicModal = ({ visible, onClose, onSubmit }) => {
  const [data, setData] = useState({ title_es: '', title_en: '', description_es: '', description_en: '' });

  const handleSubmit = () => {
    if (!data.title_es) { Alert.alert('Error', 'El título en español es obligatorio'); return; }
    onSubmit(data);
    setData({ title_es: '', title_en: '', description_es: '', description_en: '' });
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Nuevo Tema</Text>
          <TextInput style={styles.input} placeholder="Título (ES)" value={data.title_es} onChangeText={t => setData({...data, title_es: t})} />
          <TextInput style={styles.input} placeholder="Title (EN)" value={data.title_en} onChangeText={t => setData({...data, title_en: t})} />
          <TextInput style={styles.input} placeholder="Descripción (ES)" multiline value={data.description_es} onChangeText={t => setData({...data, description_es: t})} />
          <TextInput style={styles.input} placeholder="Description (EN)" multiline value={data.description_en} onChangeText={t => setData({...data, description_en: t})} />
          
          <View style={styles.buttonRow}>
            <Button title="Cancelar" onPress={onClose} color={COLORS.danger || 'red'} />
            <Button title="Guardar" onPress={handleSubmit} color={COLORS.primary} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 2. Modal para Crear EPIGRAPH
export const EpigraphModal = ({ visible, onClose, onSubmit }) => {
  const [data, setData] = useState({ order_id: '', name_es: '', name_en: '', description_es: '', description_en: '' });

  const handleSubmit = () => {
    if (!data.name_es || !data.order_id) { Alert.alert('Error', 'Nombre y Orden son obligatorios'); return; }
    onSubmit(data);
    setData({ order_id: '', name_es: '', name_en: '', description_es: '', description_en: '' });
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Nuevo Epígrafe</Text>
          <TextInput style={styles.input} placeholder="ID Orden (ej: 1, 1.1)" value={data.order_id} onChangeText={t => setData({...data, order_id: t})} keyboardType="numeric"/>
          <TextInput style={styles.input} placeholder="Nombre (ES)" value={data.name_es} onChangeText={t => setData({...data, name_es: t})} />
          <TextInput style={styles.input} placeholder="Descripción (ES)" multiline value={data.description_es} onChangeText={t => setData({...data, description_es: t})} />
          {/* Omitido EN para brevedad, agregar si es necesario */}
          <View style={styles.buttonRow}>
            <Button title="Cancelar" onPress={onClose} color={COLORS.danger || 'red'} />
            <Button title="Guardar" onPress={handleSubmit} color={COLORS.primary} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 3. Modal para Vincular CONCEPT
export const LinkConceptModal = ({ visible, onClose, onSubmit }) => {
  const [conceptName, setConceptName] = useState('');

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalViewSmall}>
          <Text style={styles.modalTitle}>Vincular Concepto</Text>
          <Text style={styles.subTitle}>Si no existe, se creará uno nuevo.</Text>
          <TextInput style={styles.input} placeholder="Nombre del concepto" value={conceptName} onChangeText={setConceptName} />
          <View style={styles.buttonRow}>
            <Button title="Cancelar" onPress={onClose} color={COLORS.danger || 'red'} />
            <Button title="Vincular" onPress={() => { onSubmit(conceptName); setConceptName(''); }} color={COLORS.primary} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20, elevation: 5 },
  modalViewSmall: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: COLORS.text },
  subTitle: { fontSize: 12, color: 'gray', marginBottom: 10, textAlign: 'center'},
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
});