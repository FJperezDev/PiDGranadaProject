import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { StyledButton } from '../components/StyledButton';

export const ContentModal = ({ visible, onClose, title, content }) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            <StyledButton onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </StyledButton>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.text}>{content}</Text>
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
  },
  modalContainer: {
    width: '85%',
    maxHeight: '80%', 
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 6,
    backgroundColor: 'transparent',
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 20, 
  },
  text: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
});