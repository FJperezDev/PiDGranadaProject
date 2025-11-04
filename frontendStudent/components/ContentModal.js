import { StyledButton } from "./StyledButton";

export const ContentModal = ({ visible, onClose, title, content }) => {
  if (!visible) return null;

  return (
    <View className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <View className="bg-slate-50 w-full h-full md:w-3/4 md:h-3/4 md:rounded-lg shadow-xl flex flex-col">
        <View className="flex justify-between items-center p-4 border-b border-slate-300">
          <Text className="text-xl font-bold">{title}</Text>
          <StyledButton onPress={onClose} className="p-2">
            <X size={28} />
          </StyledButton>
        </View>
        <View className="flex-1 p-6 overflow-y-auto">
          <Text className="text-lg leading-relaxed">{content}</Text>
        </View>
      </View>
    </View>
  );
};