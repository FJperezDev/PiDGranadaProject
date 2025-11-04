import { TouchableOpacity, Text, View } from 'react-native';

export const StyledButton = ({ title, onClick, className = '', icon, disabled }) => {
  return (
    <TouchableOpacity
      className={`flex flex-row items-center justify-center bg-slate-300 py-3 px-5 rounded-full shadow-md ${
        disabled ? 'opacity-50' : 'active:bg-slate-400'
      } ${className}`}
      onPress={onClick}
      disabled={disabled}
    >
      {icon && <View className="mr-2">{icon}</View>}
      <Text className="font-semibold text-black">{title}</Text>
    </TouchableOpacity>
  );
};