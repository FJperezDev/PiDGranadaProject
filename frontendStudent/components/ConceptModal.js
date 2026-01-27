import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableWithoutFeedback 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { COLORS } from '../constants/colors';
import { StyledButton } from '../components/StyledButton';
import { useLanguage } from '../context/LanguageContext';

export const ConceptModal = ({ visible, onClose, concept, onRelatedPress }) => {
  const { t } = useLanguage();
  
  if (!concept) return null;

  const examplesList = concept.examples 
    ? concept.examples.split('@').filter(ex => ex.trim() !== '') 
    : [];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="bulb" size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.title} numberOfLines={2}>{concept.name}</Text>
                </View>
                
                <StyledButton 
                  onPress={onClose} 
                  variant="ghost" 
                  size="small"
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </StyledButton>
              </View>

              <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={true}
              >
                
                {/* 1. Descripción */}
                <View style={styles.section}>
                  <Text style={styles.label}>{t("description")}</Text>
                  <Text style={styles.description}>
                    {concept.description || t("noDescription")}
                  </Text>
                </View>

                {/* 2. Ejemplos */}
                {examplesList.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.divider} />
                    <Text style={styles.label}>
                      <Ionicons name="easel-outline" size={14} /> 
                      {" "}{t("examples")}
                    </Text>
                    
                    {examplesList.map((example, index) => (
                      <View key={index} style={styles.exampleCard}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.exampleText} style={{marginTop: 2}} />
                        <Text style={styles.exampleText}>{example.trim()}</Text>
                      </View>
                    ))} 
                  </View>
                )}

                {/* 3. Conceptos Relacionados (MEJORADO) */}
                {concept.related_concepts && concept.related_concepts.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.divider} />
                    <Text style={styles.label}>
                      <Ionicons name="git-network-outline" size={14} /> 
                      {" "}{t("related_concepts")}
                    </Text>

                    {concept.related_concepts.map((relation, index) => {
                      const targetName = typeof relation.concept_to === 'object' 
                        ? relation.concept_to.name 
                        : relation.concept_to;
                      
                      const targetObj = typeof relation.concept_to === 'object'
                        ? relation.concept_to
                        : { name: relation.concept_to };

                      return (
                        <StyledButton 
                          key={index} 
                          variant="secondary"
                          style={styles.relationButton}
                          onPress={() => onRelatedPress(targetObj)}
                        >
                          {/* Contenedor interno flexible */}
                          <View style={styles.relationContent}>
                            
                            {/* Fila superior: Icono + Título + Flecha */}
                            <View style={styles.relationHeader}>
                              <Ionicons name="link" size={18} color={COLORS.primary} style={{ marginTop: 2 }} />
                              
                              {/* flex: 1 obliga al texto a ocupar el espacio y saltar de línea si es necesario */}
                              <Text style={styles.relationTarget}>
                                {targetName}
                              </Text>
                              
                              <Ionicons name="chevron-forward" size={18} color={COLORS.primaryLight} />
                            </View>
                            
                            {/* Descripción abajo */}
                            {relation.description ? (
                              <Text style={styles.relationDescription} numberOfLines={3}>
                                {relation.description}
                              </Text>
                            ) : null}
                          </View>
                        </StyledButton>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay || 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%', 
    backgroundColor: COLORS.background,
    borderRadius: 20,
    elevation: 10,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: COLORS.primaryVeryLight,
    borderRadius: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 20,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    flexGrow: 1,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginBottom: 16,
    marginTop: 8,
  },
  exampleCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.example,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.exampleBorder,
    gap: 12,
  },
  exampleText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  relationButton: {
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    // Importante para sobreescribir el centrado por defecto de StyledButton
    justifyContent: 'flex-start', 
    alignItems: 'stretch',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
  },
  relationContent: {
    width: '100%',
    flexDirection: 'column',
  },
  relationHeader: {
    flexDirection: 'row',
    // 'flex-start' alinea arriba por si el texto ocupa 2 líneas
    alignItems: 'flex-start', 
    gap: 12,
  },
  relationTarget: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1, // Permite que el texto ocupe el espacio y empuje el resto
    lineHeight: 22,
    marginTop: 0, // Ajuste fino visual
  },
  relationDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginLeft: 30, // Sangría para alinear con el texto del título (18 icono + 12 gap)
    lineHeight: 20,
  },
});