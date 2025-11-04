import { TextInput } from 'react-native';

export const StyledTextInput = ({ value, onChange, placeholder, ...props }) => {
  return (
    <TextInput
      type="text"
      className="bg-white w-full max-w-sm p-4 rounded-lg border border-slate-300 text-lg text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      {...props}
    />
  );
};