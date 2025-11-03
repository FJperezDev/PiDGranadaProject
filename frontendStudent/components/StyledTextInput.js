export const StyledTextInput = ({ value, onChange, placeholder, ...props }) => {
  return (
    <input
      type="text"
      className="bg-white w-full max-w-sm p-4 rounded-lg border border-slate-300 text-lg text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      {...props}
    />
  );
};