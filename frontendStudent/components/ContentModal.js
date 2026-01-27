import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
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
      statusBarTranslucent={true}
    >
      {/* CONTENEDOR PRINCIPAL:
         Simplemente centra el contenido. No tiene eventos de toque.
      */}
      <View style={styles.mainContainer}>
        
        {/* CAPA 1: EL FONDO (BACKDROP)
           Está posicionado absolutamente para llenar la pantalla.
           Es el único que escucha el 'onPress' para cerrar.
           Al ser un "hermano" del modal (y no su padre), no roba el scroll.
        */}
        <Pressable 
          style={styles.backdrop} 
          onPress={onClose} 
        />

        {/* CAPA 2: EL MODAL (CONTENIDO)
           Se renderiza encima del backdrop. Es una View normal,
           por lo que el ScrollView funciona nativamente sin interferencias.
        */}
        <View style={styles.modalCard}>
          
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            <StyledButton 
              onPress={onClose} 
              variant="ghost" 
              size="small"
              style={styles.closeButton}
            >
              <X size={24} color={COLORS.text} />
            </StyledButton>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Usamos un Text dentro de un View para asegurar
               que el motor de renderizado calcule bien la altura.
            */}
            <View>
              <Text style={styles.text}>
                {content ? content.replace(/\\n/g, '\n') : ''}
              </Text>
            </View>
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Importante: No ponemos color de fondo aquí, lo ponemos en el backdrop
  },
  backdrop: {
    // Esto hace que el Pressable ocupe toda la pantalla detrás del modal
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay || 'rgba(0, 0, 0, 0.5)', 
    zIndex: 1, // Asegura que esté detrás visualmente (aunque el orden de renderizado manda)
  },
  modalCard: {
    zIndex: 2, // Se pinta encima del backdrop
    width: '85%', // Un poco más ancho para móviles
    maxWidth: 500,
    maxHeight: '80%', 
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    // Sombras
    elevation: 10,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden', 
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
    paddingHorizontal: 0, 
    paddingVertical: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    width: '100%',
    // Dejamos que el ScrollView ocupe el espacio restante
    flexShrink: 1, 
  },
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1, 
  },
  text: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'left',
  },
});