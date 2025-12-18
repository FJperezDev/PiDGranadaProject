import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/colors';
import { 
  getTopicsBySubject, 
  getConceptsByTopic, 
  createQuestion, 
  createAnswer, 
  updateQuestion, 
  updateAnswer,   
  deleteAnswer    
} from '../api/evaluationRequests';
import { getSubjects } from '../api/coursesRequests';
import { Trash2, Plus, Save, ArrowRight, ArrowLeft, Check } from 'lucide-react-native';
import { StyledButton } from './StyledButton';
import { useLanguage } from '../context/LanguageContext';

export default function QuestionWizardModal({ visible, onClose, onSaveSuccess, editingQuestion }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [concepts, setConcepts] = useState([]); 
  
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopicTitles, setSelectedTopicTitles] = useState([]); 
  const [selectedConceptNames, setSelectedConceptNames] = useState([]);
  
  const [questionType, setQuestionType] = useState('multiple'); 

  const [statementES, setStatementES] = useState('');
  const [statementEN, setStatementEN] = useState('');
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

  useEffect(() => {
    if (selectedTopicTitles.length > 0 && topics.length > 0) {
      loadConceptsForSelectedTopics();
    } else {
      setConcepts([]);
    }
  }, [selectedTopicTitles, topics]);

  const resetForm = () => {
    setStep(1);
    setSelectedTopicTitles([]); 
    setSelectedConceptNames([]);
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

  const loadConceptsForSelectedTopics = async () => {
    const selectedTopicIds = topics
      .filter(t => selectedTopicTitles.includes(t.title || t.name))
      .map(t => t.id);

    let allConcepts = [];
    try {
        const promises = selectedTopicIds.map(id => getConceptsByTopic(id));
        const results = await Promise.all(promises);
        
        results.forEach(list => {
             if(Array.isArray(list)) allConcepts = [...allConcepts, ...list];
        });

        const uniqueConcepts = Array.from(new Map(allConcepts.map(c => [c.name, c])).values());
        setConcepts(uniqueConcepts);
    } catch (e) {
        console.error("Error cargando conceptos", e);
    }
  };

  const handleSubjectChange = (val) => {
    setSelectedSubject(val);
    setSelectedTopicTitles([]); 
    setSelectedConceptNames([]); 
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

    if (editingQuestion.concepts && Array.isArray(editingQuestion.concepts)) {
        const existingConcepts = editingQuestion.concepts.map(c => c.name || c.title).filter(Boolean);
        setSelectedConceptNames(existingConcepts);
    } else if (editingQuestion.concepts_names) {
        setSelectedConceptNames(editingQuestion.concepts_names);
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

  const toggleConcept = (name) => {
    setSelectedConceptNames(prev => {
        if (prev.includes(name)) return prev.filter(c => c !== name);
        else return [...prev, name];
    });
  };

  const handleAddAnswer = () => setAnswers([...answers, { text_es: '', text_en: '', is_correct: false, tempId: Date.now() }]);
  const handleRemoveAnswer = (index) => {
      if (answers.length <= 2) return Alert.alert(t('error'), "Mínimo 2 opciones");
      const ans = answers[index];
      if (ans.id) setDeletedAnswerIds(prev => [...prev, ans.id]);
      const newArr = [...answers];
      newArr.splice(index, 1);
      setAnswers(newArr);
  };
  const handleAnswerChangeES = (text, i) => { const n = [...answers]; n[i].text_es = text; setAnswers(n); };
  const handleAnswerChangeEN = (text, i) => { const n = [...answers]; n[i].text_en = text; setAnswers(n); };
  const handleCorrectChange = (i) => {
      const n = [...answers];
      if (questionType === 'multiple') n[i].is_correct = !n[i].is_correct;
      else n.forEach((a, idx) => a.is_correct = (idx === i));
      setAnswers(n);
  };

  const handleNext = () => {
      if (step === 1) {
        if(selectedTopicTitles.length === 0) {
            Alert.alert(t('error'), t('selectTopicError'));
            return;
        }
        setStep(2);
      } else if (step === 2) {
        if (!statementES.trim()) return Alert.alert(t('error'), t('missingStatement'));
        if (!answers.some(a => a.is_correct)) return Alert.alert(t('error'), t('missingCorrect'));
        if (answers.some(a => !a.text_es.trim())) return Alert.alert(t('error'), t('fillAllFields'));
        setStep(3);
      }
  }

  const handleSubmit = async () => {
    if (!statementEN.trim()) return Alert.alert(t('error'), t('missingTranslation'));
    if (answers.some(a => !a.text_en.trim())) return Alert.alert(t('error'), t('missingTranslation'));

    setLoading(true);
    try {
        const baseData = {
            type: questionType,
            statement_es: statementES,
            statement_en: statementEN,
            topics: selectedTopicTitles,
            concepts: selectedConceptNames
        };

        let questionId;

        if (editingQuestion) {
            questionId = editingQuestion.id;
            await updateQuestion(questionId, baseData);
            
            if (deletedAnswerIds.length > 0) {
                await Promise.all(deletedAnswerIds.map(aid => deleteAnswer(questionId, aid)));
            }
            await Promise.all(answers.map(ans => {
                const ansData = { text_es: ans.text_es, text_en: ans.text_en, is_correct: ans.is_correct };
                return ans.id ? updateAnswer(questionId, ans.id, ansData) : createAnswer(questionId, ansData);
            }));

        } else {
            const createData = {
                ...baseData,
                topics_titles: selectedTopicTitles,
            };
            const qResponse = await createQuestion(createData);
            questionId = qResponse.id;
            
            await Promise.all(answers.map(ans => 
                createAnswer(questionId, { text_es: ans.text_es, text_en: ans.text_en, is_correct: ans.is_correct })
            ));
        }

        Alert.alert(t('success'), t('saved'));
        onSaveSuccess();
        onClose();
    } catch (error) {
        console.error(error);
        Alert.alert(t('error'), t('error'));
    } finally {
        setLoading(false);
    }
  };

  const renderStep1 = () => (
    <ScrollView style={styles.stepContainer}>
        <Text style={styles.sectionHeader}>{t('context')}</Text>
        
        <Text style={styles.label}>{t('subject')}</Text>
        <View style={styles.pickerWrapper}>
            <Picker testID="subjectsPicker" selectedValue={selectedSubject ?? ""} onValueChange={handleSubjectChange}>
                {!selectedSubject && <Picker.Item label={t('select')} value="" enabled={false} />}
                {subjects.map(s => <Picker.Item key={s.id} label={s.name} value={s.id} />)}
            </Picker>
        </View>

        <Text style={styles.label}>{t('topics')}</Text>
        <ScrollView style={styles.topicsBox} nestedScrollEnabled={true} paddingBottom={10} >
            <View style={styles.topicsGrid}>
                {topics.length === 0 && <Text style={{color: 'gray', padding: 5}}>{t('selectTopic')}</Text>}
                {topics.map((t, i) => {
                    const topicTitle = t.title || t.name; 
                    const isSelected = selectedTopicTitles.includes(topicTitle);
                    return (
                        <StyledButton 
                          testID={t.title + "Btn"}
                          key={i} 
                          style={[styles.topicChip, isSelected && styles.topicChipSelected]} 
                          onPress={() => toggleTopic(topicTitle)}
                          variant="ghost"
                        >
                          <Text style={[styles.topicText, isSelected && styles.topicTextSelected]}>{topicTitle}</Text>
                          {isSelected && <Check size={16} color={COLORS.surface} style={{marginLeft: 5}}/>}
                        </StyledButton>
                    );
                })}
            </View>
        </ScrollView>

        {selectedTopicTitles.length > 0 && (
            <>
                <Text style={styles.label}>{t('concepts')}</Text>
                <ScrollView style={styles.topicsBox} nestedScrollEnabled={true} paddingBottom={10} >
                    <View style={styles.topicsGrid}>
                        {concepts.length === 0 && <Text style={{color: 'gray', padding: 5}}>{t('loading')}</Text>}
                        {concepts.map((c, i) => {
                            const cName = c.name || c.title; 
                            const isSelected = selectedConceptNames.includes(cName);
                            return (
                                <StyledButton 
                                  testID={c.name + "Btn"}
                                  key={i} 
                                  style={[styles.conceptChip, isSelected && styles.conceptChipSelected]} 
                                  onPress={() => toggleConcept(cName)}
                                  variant="ghost"
                                >
                                  <Text style={[styles.topicText, isSelected && styles.topicTextSelected]}>{cName}</Text>
                                  {isSelected && <Check size={14} color={COLORS.surface} style={{marginLeft: 5}}/>}
                                </StyledButton>
                            );
                        })}
                    </View>
                </ScrollView>
            </>
        )}

        <Text style={styles.label}>{t('questionType')}</Text>
        <View style={styles.pickerWrapper}>
            <Picker testID="questionTypePicker" selectedValue={questionType ?? "multiple"} onValueChange={setQuestionType}>
                <Picker.Item label={t('multipleChoice')} value="multiple" />
                <Picker.Item label={t('trueFalse')} value="boolean" />
            </Picker>
        </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContainer}>
        <Text style={styles.sectionHeader}>{t('spanishVersion')}</Text>
        <Text style={styles.label}>{t('statement')}</Text>
        <TextInput testID="statementInput" style={[styles.input, { height: 80 }]} multiline value={statementES} onChangeText={setStatementES} placeholder="..." />
        <Text style={styles.label}>{t('answers')}</Text>
        {answers.map((ans, index) => (
            <View key={ans.id || ans.tempId} style={styles.answerRow}>
                    <Switch testID={"answerSwitch" + ans.tempId} value={ans.is_correct} onValueChange={() => handleCorrectChange(index)} trackColor={{false:"#767577", true:COLORS.success}} />
                    <TextInput testID={"answerInput" + ans.tempId} style={styles.answerInput} placeholder={`${t('option')} ${index + 1}`} value={ans.text_es} onChangeText={(text) => handleAnswerChangeES(text, index)} />
                    {questionType === 'multiple' && (
                        <StyledButton 
                          onPress={() => handleRemoveAnswer(index)}
                          icon={<Trash2 size={20} color={COLORS.danger} />}
                          variant="ghost"
                        />
                    )}
            </View>
        ))}
        {questionType === 'multiple' && (
            <StyledButton 
              style={styles.addAnswerBtn} 
              onPress={handleAddAnswer}
              icon={<Plus size={20} color={COLORS.surface} />}
              variant="secondary"
            >  
              <Text style={{color:COLORS.white, marginLeft:5}}>{t('addOption')}</Text>
            </StyledButton>
        )}
    </ScrollView>
  );

  const renderStep3 = () => (
      <ScrollView style={styles.stepContainer}>
        <Text style={styles.sectionHeader}>{t('englishVersion')}</Text>
        <Text style={styles.label}>{t('statement')}</Text>
        <Text style={styles.helperText}>{statementES}</Text>
        <TextInput testID={"statementInput"} style={[styles.input, { height: 80 }]} multiline value={statementEN} onChangeText={setStatementEN} placeholder="..." />
        <Text style={styles.label}>{t('answers')}</Text>
        {answers.map((ans, index) => (
            <View key={ans.id || ans.tempId} style={styles.answerRowTranslation}>
                    <View style={styles.originalTextContainer}>
                    <Text style={styles.originalTextLabel}>{ans.text_es}</Text>
                    {ans.is_correct && <Text style={styles.correctBadge}>{t('correct')}</Text>}
                    </View>
                    <TextInput testID={"answerInput" + ans.tempId} style={styles.answerInput} placeholder={`${t('option')} ${index + 1}`} value={ans.text_en} onChangeText={(text) => handleAnswerChangeEN(text, index)} />
            </View>
        ))}
    </ScrollView>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{editingQuestion ? t('edit') : t('new')} ({step}/3)</Text>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          <View style={styles.buttonRow}>
            <StyledButton title={t('cancel')} variant='danger' onPress={onClose} style={{flex: 1, marginRight: 5}} />
            <View style={{flexDirection: 'row', gap: 10, flex: 1, justifyContent: 'flex-end'}}>
                {step > 1 && 
                  <StyledButton 
                    testID="nextBtn"
                    style={styles.backBtn} 
                    onPress={() => setStep(step - 1)}
                    icon={<ArrowLeft size={20} color={COLORS.surface} />}
                  />}
                {step < 3 ? (
                    <StyledButton 
                      testID="createBtn"
                      style={styles.nextBtn} 
                      onPress={handleNext}
                      icon={<ArrowRight size={20} color={COLORS.surface} />}
                    >
                      <Text style={styles.nextBtnText}>{t('next')}</Text>
                    </StyledButton>
                ) : (
                    <StyledButton 
                      testID="saveBtn"
                      style={styles.saveBtn} 
                      onPress={handleSubmit} 
                      disabled={loading}
                      icon={<Save size={20} color="white" />}
                    >
                      <Text style={styles.nextBtnText}>{t('save')}</Text>
                    </StyledButton>
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
  helperText: { fontSize: 13, color: '#666', fontStyle: 'italic', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, fontSize: 16, textAlignVertical: 'top' },
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 10 },
  
  topicsBox: { maxHeight: 150, marginBottom: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 5, padding: 5 },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  
  topicChip: { backgroundColor: '#f0f0f0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', flexDirection: 'row', alignItems: 'center' },
  topicChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  
  conceptChip: { backgroundColor: '#e8f5e9', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 15, borderWidth: 1, borderColor: '#c8e6c9', flexDirection: 'row', alignItems: 'center' },
  conceptChipSelected: { backgroundColor: COLORS.success, borderColor: COLORS.success },

  topicText: { color: COLORS.text, fontSize: 14 },
  topicTextSelected: { color: 'white', fontWeight: 'bold' },

  answerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  answerRowTranslation: { flexDirection: 'column', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  originalTextContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  originalTextLabel: { fontWeight: 'bold', color: '#444', flex: 1 },
  correctBadge: { fontSize: 10, color: 'green', fontWeight: 'bold', backgroundColor: '#e8f5e9', padding: 2, borderRadius: 4 },
  answerInput: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 5, padding: 8, backgroundColor: '#f9f9f9' },
  addAnswerBtn: { padding: 10, borderRadius: 5, alignSelf: 'flex-start', alignItems: 'center', marginTop: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  backBtn: { backgroundColor: COLORS.gray, padding: 10, borderRadius: 5, justifyContent: 'center' },
  nextBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5, alignItems: 'center' },
  saveBtn: { flexDirection: 'row', backgroundColor: COLORS.success, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5, alignItems: 'center' },
  nextBtnText: { color: 'white', fontWeight: 'bold', marginRight: 5, marginLeft: 5 },
});
