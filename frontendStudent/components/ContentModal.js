import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native'; // 1. Importamos ScrollView
import { X } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { StyledButton } from '../components/StyledButton';

export const ContentModal = ({ visible, onClose, title, content }) => {
  console.log(content);
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Limitamos la altura del contenedor para forzar el scroll si el texto es largo */}
        <View style={styles.modalContainer}>
          
          {/* Header Fijo (No se mueve al scrollear) */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            <StyledButton onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </StyledButton>
          </View>

          {/* 2. Usamos ScrollView para el contenido */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent} // Padding interno del scroll
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    // Importante: maxHeight evita que el modal ocupe toda la pantalla,
    // forzando al ScrollView a activarse cuando el texto es largo.
    maxHeight: '80%', 
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: COLORS.shadow || '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1, // Opcional: separador visual sutil
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    marginRight: 10, // Espacio para que no choque con la X
  },
  closeButton: {
    padding: 6,
  },
  // Estilos del ScrollView
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