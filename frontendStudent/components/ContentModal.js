import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

export const ContentModal = ({ visible, onClose, title, content }) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true} // hace que el fondo sea visible para poder oscurecerlo
      onRequestClose={onClose} // cierra en Android con el botón atrás
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.text}>{content}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // oscurece el fondo
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    elevation: 10, // sombra en Android
    shadowColor: '#000', // sombra en iOS
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
  },
  closeButton: {
    padding: 6,
  },
  content: {
    maxHeight: '70%',
  },
  text: {
    fontSize: 16,
    color: COLORS.text,
  },
});