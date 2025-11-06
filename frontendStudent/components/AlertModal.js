import { View, Text } from 'react-native';
import { StyledButton } from './StyledButton';

export const AlertModal = ({ visible, onClose, title, message }) => {
  if (!visible) return null;

  return (
    <View className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <View className="bg-white w-full max-w-md rounded-lg shadow-xl flex flex-col p-6">
        <Text className="text-xl font-bold mb-4">{title}</Text>
        <Text className="text-base mb-6">{message}</Text>
        <StyledButton
          title="OK"
          onPress={onClose}
          className="self-end bg-cyan-200"
        />
      </View>
    </View>
  );
};