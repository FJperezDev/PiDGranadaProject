import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/colors';
import { 
  getSubjects, 
  getTopicsBySubject, 
  createQuestion, 
  createAnswer, 
  getAnswersByQuestion,
  updateQuestion, 
  updateAnswer,   
  deleteAnswer    
} from '../api/getRequest';
import { Trash2, Plus, Save, ArrowRight, ArrowLeft, Check } from 'lucide-react-native';

export default function QuestionWizardModal({ visible, onClose, onSaveSuccess, editingQuestion }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Contexto
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopicTitles, setSelectedTopicTitles] = useState([]); 
  const [questionType, setQuestionType] = useState('multiple'); 

  // Contenido
  const [statementES, setStatementES] = useState('');
  const [statementEN, setStatementEN] = useState('');
  
  // Lista de IDs de respuestas eliminadas visualmente
  const [deletedAnswerIds, setDeletedAnswerIds] = useState([]);

  const [answers, setAnswers] = useState([
    { text_es: '', text_en: '', is_correct: false, tempId: 1 },
    { text_es: '', text_en: '', is_correct: false, tempId: 2 }
  ]);

  useEffect(() => {
    if (visible) {
      loadSubjects();
      if (editingQuestion) {
        loadEditingData();
      } else {
        resetForm();
      }
    }
  }, [visible, editingQuestion]);

  useEffect(() => {
    if (selectedSubject) {
      loadTopics(selectedSubject);
    }
  }, [selectedSubject]);

  const resetForm = () => {
    setStep(1);
    setSelectedTopicTitles([]); 
    setQuestionType('multiple');
    setStatementES('');
    setStatementEN('');
    setDeletedAnswerIds([]); 
    setAnswers([
      { text_es: '', text_en: '', is_correct: false, tempId: 1 },
      { text_es: '', text_en: '', is_correct: false, tempId: 2 }
    ]);
  };

  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
      if (data.length > 0 && !selectedSubject) setSelectedSubject(data[0].id);
    } catch (e) { console.error(e); }
  };

  const loadTopics = async (subId) => {
    try {
      const data = await getTopicsBySubject(subId);
      setTopics(data);
    } catch (e) { console.error(e); }
  };

  const handleSubjectChange = (val) => {
    setSelectedSubject(val);
    setSelectedTopicTitles([]); 
  };

  const loadEditingData = async () => {
    setStep(1); 
    setDeletedAnswerIds([]); 
    setStatementES(editingQuestion.statement_es);
    setStatementEN(editingQuestion.statement_en || '');
    setQuestionType(editingQuestion.type);

    if (editingQuestion.topics && Array.isArray(editingQuestion.topics)) {
        const existingTopics = editingQuestion.topics.map(t => t.name || t.title).filter(Boolean);
        setSelectedTopicTitles(existingTopics);
    } else if (editingQuestion.topics_titles) {
        setSelectedTopicTitles(editingQuestion.topics_titles);
    }

    try {
      const apiAnswers = (editingQuestion.answers);
      const formattedAnswers = apiAnswers.map(a => ({
          ...a,
          text_es: a.text_es || '',
          text_en: a.text_en || '',
          tempId: a.id,
          id: a.id
      }));
      setAnswers(formattedAnswers);
    } catch (e) {
      console.error("Error loading answers", e);
    }
  };

  const toggleTopic = (title) => {
    setSelectedTopicTitles(prev => {
        if (prev.includes(title)) return prev.filter(t => t !== title);
        else return [...prev, title];
    });
  };

  const handleAddAnswer = () => {
    setAnswers([...answers, { text_es: '', text_en: '', is_correct: false, tempId: Date.now() }]);
  };

  const handleRemoveAnswer = (index) => {
    if (answers.length <= 2) {
        Alert.alert("Mínimo", "Debe haber al menos 2 opciones.");
        return;
    }
    const answerToRemove = answers[index];
    if (answerToRemove.id) {
        setDeletedAnswerIds(prev => [...prev, answerToRemove.id]);
    }
    const newAnswers = [...answers];
    newAnswers.splice(index, 1);
    setAnswers(newAnswers);
  };

  const handleAnswerChangeES = (text, index) => {
    const newAnswers = [...answers];
    newAnswers[index].text_es = text;
    setAnswers(newAnswers);
  };

  const handleAnswerChangeEN = (text, index) => {
    const newAnswers = [...answers];
    newAnswers[index].text_en = text;
    setAnswers(newAnswers);
  };

  const handleCorrectChange = (index) => {
    const newAnswers = [...answers];
    if (questionType === 'multiple') {
       newAnswers[index].is_correct = !newAnswers[index].is_correct;
    } else {
      newAnswers.forEach((a, i) => a.is_correct = (i === index));
    }
    setAnswers(newAnswers);
  };

  const handleNext = () => {
      if (step === 1) {
        if(selectedTopicTitles.length === 0) {
            Alert.alert("Error", "Selecciona al menos un tema");
            return;
        }
        setStep(2);
      } else if (step === 2) {
        if (!statementES.trim()) {
            Alert.alert("Error", "El enunciado es obligatorio");
            return;
        }
        if (!answers.some(a => a.is_correct)) {
            Alert.alert("Error", "Marca al menos una respuesta correcta");
            return;
        }
        if (answers.some(a => !a.text_es.trim())) {
            Alert.alert("Error", "Faltan textos en español");
            return;
        }
        setStep(3);
      }
  }

  const handleSubmit = async () => {
    if (!statementEN.trim()) {
      Alert.alert("Error", "El enunciado en inglés es obligatorio");
      return;
    }
    if (answers.some(a => !a.text_en.trim())) {
        Alert.alert("Error", "Faltan traducciones al inglés");
        return;
    }

    setLoading(true);
    try {
        let questionId;

        if (editingQuestion) {
            setStatementEN(editingQuestion.statement_en);
            setStatementES(editingQuestion.statement_es);
            questionId = editingQuestion.id;

            const qData = {
                type: questionType,
                statement_es: statementES,
                statement_en: statementEN,
                topics: selectedTopicTitles, 
                concepts: [] 
            };
            await updateQuestion(questionId, qData);

            if (deletedAnswerIds.length > 0) {
                await Promise.all(deletedAnswerIds.map(ansId => deleteAnswer(questionId, ansId)));
            }

            const upsertPromises = answers.map(ans => {
                const ansData = {
                    text_es: ans.text_es,
                    text_en: ans.text_en,
                    is_correct: ans.is_correct
                };

                if (ans.id) {
                    return updateAnswer(questionId, ans.id, ansData);
                } else {
                    return createAnswer(questionId, ansData);
                }
            });
            await Promise.all(upsertPromises);

        } else {
            const qData = {
                type: questionType,
                statement_es: statementES,
                statement_en: statementEN,
                topics_titles: selectedTopicTitles, 
                concepts: [] 
            };
            const qResponse = await createQuestion(qData);
            questionId = qResponse.id;

            const answerPromises = answers.map(ans => 
                createAnswer(questionId, {
                    text_es: ans.text_es,
                    text_en: ans.text_en,
                    is_correct: ans.is_correct
                })
            );
            await Promise.all(answerPromises);
        }

        Alert.alert("Éxito", "Pregunta guardada correctamente");
        onSaveSuccess();
        onClose();
    } catch (error) {
        console.error(error);
        Alert.alert("Error", "Hubo un problema al guardar.");
    } finally {
        setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
        <Text style={styles.sectionHeader}>Contexto</Text>
        <Text style={styles.label}>Asignatura</Text>
        <View style={styles.pickerWrapper}>
            {/* CORRECCIÓN: selectedValue={selectedSubject ?? ""} para evitar null en web */}
            <Picker selectedValue={selectedSubject ?? ""} onValueChange={handleSubjectChange}>
                {/* Item placeholder invisible para cuando está cargando */}
                {!selectedSubject && <Picker.Item label="Seleccionando..." value="" enabled={false} />}
                {subjects.map(s => <Picker.Item key={s.id} label={s.name} value={s.id} />)}
            </Picker>
        </View>

        <Text style={styles.label}>Temas (Selección Múltiple)</Text>
        <ScrollView style={styles.topicsScroll} nestedScrollEnabled={true}>
            <View style={styles.topicsGrid}>
                {topics.length === 0 && <Text style={{color: 'gray', padding: 10}}>No hay temas.</Text>}
                {topics.map((t, i) => {
                    const topicTitle = t.title || t.name; 
                    const isSelected = selectedTopicTitles.includes(topicTitle);
                    return (
                        <TouchableOpacity 
                            key={i} 
                            style={[styles.topicChip, isSelected && styles.topicChipSelected]}
                            onPress={() => toggleTopic(topicTitle)}
                        >
                            <Text style={[styles.topicText, isSelected && styles.topicTextSelected]}>{topicTitle}</Text>
                            {isSelected && <Check size={16} color="white" style={{marginLeft: 5}}/>}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.pickerWrapper}>
            <Picker selectedValue={questionType ?? "multiple"} onValueChange={val => setQuestionType(val)}>
                <Picker.Item label="Opción Múltiple" value="multiple" />
                <Picker.Item label="Verdadero / Falso" value="boolean" />
            </Picker>
        </View>
    </View>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContainer}>
        <Text style={styles.sectionHeader}>Español (ES)</Text>
        <Text style={styles.label}>Enunciado</Text>
        <TextInput style={[styles.input, { height: 80 }]} multiline value={statementES} onChangeText={setStatementES} placeholder="Pregunta en español..." />

        <Text style={styles.label}>Respuestas</Text>
        {answers.map((ans, index) => (
            <View key={ans.id || ans.tempId} style={styles.answerRow}>
                 <Switch value={ans.is_correct} onValueChange={() => handleCorrectChange(index)} trackColor={{false:"#767577", true:COLORS.success}} />
                 <TextInput style={styles.answerInput} placeholder={`Opción ${index + 1}`} value={ans.text} onChangeText={(text) => handleAnswerChangeES(text, index)} />
                 {questionType === 'multiple' && (
                     <TouchableOpacity onPress={() => handleRemoveAnswer(index)}>
                         <Trash2 size={20} color={COLORS.danger || 'red'} />
                     </TouchableOpacity>
                 )}
            </View>
        ))}
        {questionType === 'multiple' && (
            <TouchableOpacity style={styles.addAnswerBtn} onPress={handleAddAnswer}>
                <Plus size={20} color="white" />
                <Text style={{color:'white', marginLeft:5}}>Añadir Opción</Text>
            </TouchableOpacity>
        )}
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContainer}>
        <Text style={styles.sectionHeader}>Inglés (EN)</Text>
        <Text style={styles.label}>Enunciado</Text>
        <Text style={styles.helperText}>{statementES}</Text>
        <TextInput style={[styles.input, { height: 80 }]} multiline value={statementEN} onChangeText={setStatementEN} placeholder="Question in English..." />

        <Text style={styles.label}>Respuestas</Text>
        {answers.map((ans, index) => (
            <View key={ans.id || ans.tempId} style={styles.answerRowTranslation}>
                 <View style={styles.originalTextContainer}>
                    <Text style={styles.originalTextLabel}>{ans.text_es}</Text>
                    {ans.is_correct && <Text style={styles.correctBadge}>Correcta</Text>}
                 </View>
                 <TextInput style={styles.answerInput} placeholder={`Option ${index + 1}`} value={ans.text_en} onChangeText={(text) => handleAnswerChangeEN(text, index)} />
            </View>
        ))}
    </ScrollView>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{editingQuestion ? "Editar" : "Nueva"} ({step}/3)</Text>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          <View style={styles.buttonRow}>
            <Button title="Cancelar" color={COLORS.danger || "red"} onPress={onClose} />
            <View style={{flexDirection: 'row', gap: 10}}>
                {step > 1 && <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}><ArrowLeft size={20} color="white" /></TouchableOpacity>}
                {step < 3 ? (
                    <TouchableOpacity style={styles.nextBtn} onPress={handleNext}><Text style={styles.nextBtnText}>Siguiente</Text><ArrowRight size={20} color="white" /></TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={loading}><Save size={20} color="white" /><Text style={styles.nextBtnText}>Guardar</Text></TouchableOpacity>
                )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '95%', height: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  sectionHeader: { fontSize: 18, color: COLORS.primary, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  stepContainer: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 5, color: COLORS.text },
  subLabel: { fontSize: 12, color: 'gray', marginBottom: 10 },
  helperText: { fontSize: 13, color: '#666', fontStyle: 'italic', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, fontSize: 16, textAlignVertical: 'top' },
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 10 },
  topicsScroll: { maxHeight: 150, marginBottom: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 5, padding: 5 },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topicChip: { backgroundColor: '#f0f0f0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', flexDirection: 'row', alignItems: 'center' },
  topicChipSelected: { backgroundColor: COLORS.primary || 'blue', borderColor: COLORS.primary || 'blue' },
  topicText: { color: COLORS.text || 'black', fontSize: 14 },
  topicTextSelected: { color: 'white', fontWeight: 'bold' },
  answerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  answerRowTranslation: { flexDirection: 'column', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  originalTextContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  originalTextLabel: { fontWeight: 'bold', color: '#444', flex: 1 },
  correctBadge: { fontSize: 10, color: 'green', fontWeight: 'bold', backgroundColor: '#e8f5e9', padding: 2, borderRadius: 4 },
  answerInput: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 5, padding: 8, backgroundColor: '#f9f9f9' },
  addAnswerBtn: { flexDirection: 'row', backgroundColor: COLORS.secondary || '#6200ee', padding: 10, borderRadius: 5, alignSelf: 'flex-start', alignItems: 'center', marginTop: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  backBtn: { backgroundColor: COLORS.gray || 'gray', padding: 10, borderRadius: 5, justifyContent: 'center' },
  nextBtn: { flexDirection: 'row', backgroundColor: COLORS.primary || 'blue', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5, alignItems: 'center' },
  saveBtn: { flexDirection: 'row', backgroundColor: COLORS.success || 'green', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5, alignItems: 'center' },
  nextBtnText: { color: 'white', fontWeight: 'bold', marginRight: 5, marginLeft: 5 },
});