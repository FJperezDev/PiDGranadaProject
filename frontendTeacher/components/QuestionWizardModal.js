import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, Alert, Switch, Platform, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/colors';
import { 
  getTopicsBySubject, getConceptsByTopic, createQuestion, createAnswer, updateQuestion, updateAnswer, deleteAnswer    
} from '../api/evaluationRequests';
import { getSubjects } from '../api/coursesRequests';
import { Trash2, Plus, Save, ArrowRight, ArrowLeft, Check, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { StyledButton } from './StyledButton';
import { StyledTextInput } from './StyledTextInput';
import { useLanguage } from '../context/LanguageContext';

const CollapsibleSelector = ({ title, items, selectedItems, onToggle, emptyText, testID }) => {
    const [expanded, setExpanded] = useState(false);
    
    const selectedCount = selectedItems.length;
    const summary = selectedCount > 0 
        ? `${selectedCount} seleccionados` 
        : "Ninguno";

    return (
        <View style={styles.collapsibleContainer}>
            <TouchableOpacity 
                style={styles.collapsibleHeader} 
                testID={testID}
                onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setExpanded(!expanded);
                }}
                activeOpacity={0.7}
            >
                <View>
                    <Text style={styles.collapsibleTitle}>{title}</Text>
                    {!expanded && <Text style={styles.collapsibleSummary}>{summary}</Text>}
                </View>
                {expanded ? <ChevronUp size={20} color={COLORS.textSecondary}/> : <ChevronDown size={20} color={COLORS.textSecondary}/>}
            </TouchableOpacity>

            {expanded && (
                <View style={styles.collapsibleContent}>
                    {items.length === 0 && <Text style={styles.helperText}>{emptyText}</Text>}
                    <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 200 }}>
                        <View style={styles.chipsGrid}>
                            {items.map((item, i) => {
                                const name = item.title || item.name;
                                const isSelected = selectedItems.includes(name);
                                return (
                                    <StyledButton 
                                        testID={`${testID}-chip-${name}`}
                                        key={i} 
                                        onPress={() => onToggle(name)} 
                                        variant={isSelected ? 'primary' : 'outline'}
                                        size="small"
                                        style={{marginBottom: 6, borderColor: isSelected ? 'transparent' : COLORS.border}}
                                        textStyle={!isSelected ? {color: COLORS.textSecondary} : {}}
                                    >
                                        <Text style={[styles.chipText, isSelected && {color: COLORS.white}]}>{name}</Text>
                                        {isSelected && <Check size={14} color={COLORS.white} style={{marginLeft: 5}}/>}
                                    </StyledButton>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

export default function QuestionWizardModal({ visible, onClose, onSaveSuccess, editingQuestion }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Datos
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [concepts, setConcepts] = useState([]); 
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopicTitles, setSelectedTopicTitles] = useState([]); 
  const [selectedConceptNames, setSelectedConceptNames] = useState([]);
  const [questionType, setQuestionType] = useState('multiple'); 
  const [statementES, setStatementES] = useState('');
  const [statementEN, setStatementEN] = useState('');
  const [explanationES, setExplanationES] = useState('');
  const [explanationEN, setExplanationEN] = useState('');
  const [deletedAnswerIds, setDeletedAnswerIds] = useState([]);
  const [answers, setAnswers] = useState([
    { text_es: '', text_en: '', is_correct: false, tempId: 1 },
    { text_es: '', text_en: '', is_correct: false, tempId: 2 }
  ]);

  useEffect(() => {
    if (visible) { loadSubjects(); if (editingQuestion) loadEditingData(); else resetForm(); }
  }, [visible, editingQuestion]);

  useEffect(() => { if (selectedSubject) loadTopics(selectedSubject); }, [selectedSubject]);
  useEffect(() => { 
      if (selectedTopicTitles.length > 0 && topics.length > 0) loadConceptsForSelectedTopics();
      else setConcepts([]); 
  }, [selectedTopicTitles, topics]);

  const resetForm = () => {
    setStep(1); setSelectedTopicTitles([]); setSelectedConceptNames([]); setQuestionType('multiple');
    setStatementES(''); setStatementEN(''); setExplanationES(''); setExplanationEN(''); setDeletedAnswerIds([]); 
    setAnswers([{ text_es: '', text_en: '', is_correct: false, tempId: 1 }, { text_es: '', text_en: '', is_correct: false, tempId: 2 }]);
  };

  const loadSubjects = async () => { try { const data = await getSubjects(); setSubjects(data); if (data.length > 0 && !selectedSubject) setSelectedSubject(data[0].id); } catch (e) { console.error(e); } };
  const loadTopics = async (subId) => { try { const data = await getTopicsBySubject(subId); setTopics(data); } catch (e) { console.error(e); } };
  const loadConceptsForSelectedTopics = async () => {
    const selectedTopicIds = topics.filter(t => selectedTopicTitles.includes(t.title || t.name)).map(t => t.id);
    let allConcepts = [];
    try {
        const promises = selectedTopicIds.map(id => getConceptsByTopic(id));
        const results = await Promise.all(promises);
        results.forEach(list => { if(Array.isArray(list)) allConcepts = [...allConcepts, ...list]; });
        setConcepts(Array.from(new Map(allConcepts.map(c => [c.name, c])).values()));
    } catch (e) { console.error("Error cargando conceptos", e); }
  };

  const handleSubjectChange = (val) => { setSelectedSubject(val); setSelectedTopicTitles([]); setSelectedConceptNames([]); };

  const loadEditingData = async () => {
    setStep(1); setDeletedAnswerIds([]); 
    setStatementES(editingQuestion.statement_es); setStatementEN(editingQuestion.statement_en || '');
    setExplanationES(editingQuestion.explanation_es || ''); setExplanationEN(editingQuestion.explanation_en || '');
    setQuestionType(editingQuestion.type);
    if (editingQuestion.topics) setSelectedTopicTitles(editingQuestion.topics.map(t => t.name || t.title).filter(Boolean));
    else if (editingQuestion.topics_titles) setSelectedTopicTitles(editingQuestion.topics_titles);
    if (editingQuestion.concepts) setSelectedConceptNames(editingQuestion.concepts.map(c => c.name || c.title).filter(Boolean));
    else if (editingQuestion.concepts_names) setSelectedConceptNames(editingQuestion.concepts_names);
    try {
      setAnswers((editingQuestion.answers).map(a => ({ ...a, text_es: a.text_es || '', text_en: a.text_en || '', tempId: a.id, id: a.id })));
    } catch (e) { console.error(e); }
  };

  const toggleTopic = (title) => setSelectedTopicTitles(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  const toggleConcept = (name) => setSelectedConceptNames(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);

  const handleAddAnswer = () => setAnswers([...answers, { text_es: '', text_en: '', is_correct: false, tempId: Date.now() }]);
  const handleRemoveAnswer = (index) => {
      if (answers.length <= 2) return Alert.alert(t('error'), "Mínimo 2 opciones");
      const ans = answers[index]; if (ans.id) setDeletedAnswerIds(prev => [...prev, ans.id]);
      const newArr = [...answers]; newArr.splice(index, 1); setAnswers(newArr);
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
      if (step === 1) { if(selectedTopicTitles.length === 0) return Alert.alert(t('error'), t('selectTopicError')); setStep(2); } 
      else if (step === 2) { 
          if (!statementES.trim()) return Alert.alert(t('error'), t('missingStatement'));
          if (!answers.some(a => a.is_correct)) return Alert.alert(t('error'), t('missingCorrect'));
          if (answers.some(a => !a.text_es.trim())) return Alert.alert(t('error'), t('fillAllFields'));
          setStep(3); 
      } 
      else if (step === 3) { 
          if (!statementEN.trim() || answers.some(a => !a.text_en.trim())) return Alert.alert(t('error'), t('missingTranslation'));
          setStep(4); 
      }
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
        const baseData = { type: questionType, statement_es: statementES, statement_en: statementEN, explanation_es: explanationES, explanation_en: explanationEN, topics: selectedTopicTitles, concepts: selectedConceptNames };
        let questionId;
        if (editingQuestion) {
            questionId = editingQuestion.id;
            await updateQuestion(questionId, baseData);
            if (deletedAnswerIds.length > 0) await Promise.all(deletedAnswerIds.map(aid => deleteAnswer(questionId, aid)));
            await Promise.all(answers.map(ans => {
                const ansData = { text_es: ans.text_es, text_en: ans.text_en, is_correct: ans.is_correct };
                return ans.id ? updateAnswer(questionId, ans.id, ansData) : createAnswer(questionId, ansData);
            }));
        } else {
            const createData = { ...baseData, topics_titles: selectedTopicTitles };
            const qResponse = await createQuestion(createData);
            questionId = qResponse.id;
            await Promise.all(answers.map(ans => createAnswer(questionId, { text_es: ans.text_es, text_en: ans.text_en, is_correct: ans.is_correct })));
        }
        Alert.alert(t('success'), t('saved')); onSaveSuccess(); onClose();
    } catch (error) { console.error(error); Alert.alert(t('error'), t('error')); } finally { setLoading(false); }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingQuestion ? t('edit') : t('newQuestion')} ({step}/4)</Text>
            <StyledButton onPress={onClose} variant="ghost" style={{padding:4}}>
                <X size={24} color={COLORS.textSecondary} />
            </StyledButton>
          </View>

          {step === 1 && (
            <ScrollView style={styles.stepContainer}>
                <Text style={styles.sectionHeader}>{t('context')}</Text>
                
                <Text style={styles.label}>{t('subject')}</Text>
                <View style={styles.pickerWrapper}>
                    <Picker 
                        testID="subjectsPicker"
                        selectedValue={selectedSubject ?? ""} 
                        onValueChange={handleSubjectChange}
                        dropdownIconColor={COLORS.text} // Android
                        style={{ color: COLORS.text }} // Android Texto
                        itemStyle={{ color: COLORS.text }} // iOS
                    >
                        {!selectedSubject && <Picker.Item label={t('select')} value="" enabled={false} color={COLORS.textSecondary} />}
                        {subjects.map(s => (
                            <Picker.Item key={s.id} label={s.name} value={s.id} color={COLORS.text} />
                        ))}
                    </Picker>
                </View>

                {/* SELECTOR COLAPSABLE PARA TEMAS */}
                <Text style={styles.label}>{t('topics')}</Text>
                <CollapsibleSelector 
                    testID="topicsPicker"
                    title={t('selectTopics')} 
                    items={topics} 
                    selectedItems={selectedTopicTitles} 
                    onToggle={toggleTopic}
                    emptyText={t('selectTopic')}
                />

                {selectedTopicTitles.length > 0 && (
                    <>
                        <Text style={styles.label}>{t('concepts')}</Text>
                        <CollapsibleSelector 
                            title={t('selectConcepts')}
                            testID="conceptsPicker"
                            items={concepts} 
                            selectedItems={selectedConceptNames} 
                            onToggle={toggleConcept}
                            emptyText="No hay conceptos disponibles"
                        />
                    </>
                )}

                <Text style={styles.label}>{t('questionType')}</Text>
                <View style={styles.pickerWrapper}>
                    <Picker 
                        testID="questionTypePicker"
                        selectedValue={questionType ?? "multiple"} 
                        onValueChange={setQuestionType}
                        dropdownIconColor={COLORS.text}
                        style={{ color: COLORS.text }}
                        itemStyle={{ color: COLORS.text }}
                    >
                        <Picker.Item label={t('multipleChoice')} value="multiple" color={COLORS.text} />
                        <Picker.Item label={t('trueFalse')} value="boolean" color={COLORS.text} />
                    </Picker>
                </View>
            </ScrollView>
          )}

          {step === 2 && (
            <ScrollView style={styles.stepContainer}>
                <Text style={styles.sectionHeader}>{t('spanishVersion')}</Text>
                <Text style={styles.label}>{t('statement')}</Text>
                <StyledTextInput testID="statementInput" multiline numberOfLines={3} value={statementES} onChangeText={setStatementES} style={{minHeight: 80}} />
                
                <Text style={styles.label}>{t('answers')}</Text>
                {answers.map((ans, index) => (
                    <View key={ans.id || ans.tempId} style={styles.answerRow}>
                        <Switch testID={`answerSwitch${index + 1}`} value={ans.is_correct} onValueChange={() => handleCorrectChange(index)} trackColor={{false:"#ccc", true:COLORS.success}} />
                        <View style={{flex: 1, marginHorizontal: 8}}>
                            <StyledTextInput testID={`answerInput${index + 1}`} placeholder={`${t('option')} ${index + 1}`} value={ans.text_es} onChangeText={(text) => handleAnswerChangeES(text, index)} />
                        </View>
                        {questionType === 'multiple' && (
                            <StyledButton onPress={() => handleRemoveAnswer(index)} variant="ghost" style={{padding: 4}}>
                                <Trash2 size={20} color={COLORS.danger} />
                            </StyledButton>
                        )}
                    </View>
                ))}
                {questionType === 'multiple' && (
                    <StyledButton onPress={handleAddAnswer} variant="secondary" icon={<Plus size={18} color={COLORS.textSecondary} />} title={t('addOption')} style={{alignSelf: 'flex-start'}} />
                )}
            </ScrollView>
          )}

          {step === 3 && (
            <ScrollView style={styles.stepContainer}>
                <Text style={styles.sectionHeader}>{t('englishVersion')}</Text>
                <Text style={styles.label}>{t('statement')}</Text>
                <Text style={styles.helperText}>{statementES}</Text>
                <StyledTextInput testID="statementInputEN" multiline numberOfLines={3} value={statementEN} onChangeText={setStatementEN} style={{minHeight: 80}} />
                
                <Text style={styles.label}>{t('answers')}</Text>
                {answers.map((ans, index) => (
                    <View key={ans.id || ans.tempId} style={styles.translationRow}>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                            <Text style={styles.originalTextLabel}>{ans.text_es}</Text>
                            {ans.is_correct && <Check size={14} color={COLORS.success} style={{marginLeft: 4}} />}
                        </View>
                        <StyledTextInput testID={`answerInputEN${index + 1}`} placeholder={`${t('option')} ${index + 1} (EN)`} value={ans.text_en} onChangeText={(text) => handleAnswerChangeEN(text, index)} />
                    </View>
                ))}
            </ScrollView>
          )}

          {step === 4 && (
            <ScrollView style={styles.stepContainer}>
                <Text style={styles.sectionHeader}>{t('feedback') || 'Explicación'}</Text>
                
                <Text style={styles.label}>{t('explanationES') || 'Explicación (Español)'}</Text>
                <StyledTextInput multiline numberOfLines={4} value={explanationES} onChangeText={setExplanationES} style={{minHeight: 100, marginBottom: 15}} />

                <Text style={styles.label}>{t('explanationEN') || 'Explicación (Inglés)'}</Text>
                <StyledTextInput multiline numberOfLines={4} value={explanationEN} onChangeText={setExplanationEN} style={{minHeight: 100}} />
            </ScrollView>
          )}
          
          <View style={styles.footerRow}>
            <StyledButton title={t('cancel')} variant='ghost' onPress={onClose} />
            
            <View style={{flexDirection: 'row', gap: 10}}>
                {step > 1 && 
                  <StyledButton onPress={() => setStep(step - 1)} variant="secondary" icon={<ArrowLeft size={20} color={COLORS.textSecondary} />} />
                }
                
                {step < 4 ? (
                    <StyledButton testID="nextBtn" onPress={handleNext} title={t('next')} icon={<ArrowRight size={20} color={COLORS.white} />} style={{flexDirection: 'row-reverse'}} />
                ) : (
                    <StyledButton testID="saveBtn" onPress={handleSubmit} title={t('save')} disabled={loading} loading={loading} icon={<Save size={20} color="white" />} />
                )}
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.overlay, padding: 20 },
  modalView: { width: '100%', maxWidth: 600, height: '90%', backgroundColor: COLORS.surface, borderRadius: 24, padding: 0, elevation: 10, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, backgroundColor: COLORS.surface },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  
  stepContainer: { flex: 1, padding: 20 },
  sectionHeader: { fontSize: 18, color: COLORS.primary, fontWeight: '700', marginBottom: 15, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '700', marginTop: 15, marginBottom: 8, color: COLORS.textSecondary, textTransform: 'uppercase' },
  helperText: { fontSize: 14, color: COLORS.text, marginBottom: 8, fontStyle: 'italic', padding: 8, backgroundColor: COLORS.background, borderRadius: 8 },
  
  pickerWrapper: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  
  // Estilos Collapsible
  collapsibleContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background, // Un poco más oscuro que surface
  },
  collapsibleTitle: {
    fontWeight: '700',
    color: COLORS.text,
    fontSize: 14,
  },
  collapsibleSummary: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  collapsibleContent: {
    padding: 10,
    backgroundColor: COLORS.surface,
  },

  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipText: { fontSize: 12, fontWeight: '600' },

  answerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  translationRow: { marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  originalTextLabel: { fontWeight: '600', color: COLORS.text, fontSize: 14 },
  
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: COLORS.borderLight, backgroundColor: COLORS.surface },
});