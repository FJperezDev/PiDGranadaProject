import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { COLORS } from '../constants/colors';
import { StyledButton } from '../components/StyledButton';
import { useLanguage } from '../context/LanguageContext';

export const ConceptModal = ({ visible, onClose, concept, onRelatedPress }) => {
  const { t } = useLanguage(); // Usamos el hook directamente aquí
  
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
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="bulb" size={24} color={COLORS.primary} />
              <Text style={styles.title}>{concept.name}</Text>
            </View>
            <StyledButton onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={30} color={COLORS.secondaryLight} />
            </StyledButton>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
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
                    <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.exampleText} style={{marginTop: 2}} />
                    <Text style={styles.exampleText}>{example.trim()}</Text>
                  </View>
                ))} 
              </View>
            )}

            {/* 3. Conceptos Relacionados */}
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
                      style={styles.relationCard}
                      activeOpacity={0.7}
                      onPress={() => onRelatedPress(targetObj)}
                    >
                      <View style={styles.relationHeader}>
                        <Ionicons name="link" size={16} color={COLORS.primary} />
                        <Text style={styles.relationTarget}>{targetName}</Text>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.primary} style={{marginLeft: 'auto'}}/>
                      </View>
                      
                      {relation.description ? (
                        <Text style={styles.relationDescription}>
                          "{relation.description}"
                        </Text>
                      ) : null}
                    </StyledButton>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    maxHeight: '90%',
    ...Platform.select({
      ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 10 },
      web: { boxShadow: '0px 10px 30px rgba(0,0,0,0.2)' }
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },
  closeButton: {
    padding: 5,
    backgroundColor: COLORS.primaryLight,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 12,
    letterSpacing: 1,
    marginTop: 8,
  },
  description: {
    fontSize: 17,
    lineHeight: 26,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  exampleCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.example,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.exampleBorder,
    gap: 10,
  },
  exampleText: {
    fontSize: 15,
    color: COLORS.exampleText,
    flex: 1,
    fontStyle: 'italic',
  },
  relationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  relationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  relationTarget: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  relationDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 24, 
    lineHeight: 20,
  },
});