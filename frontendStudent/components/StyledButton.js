

export const StyledButton = ({ title, onClick, className = '', icon, disabled }) => {
  return (
    <button
      className={`flex flex-row items-center justify-center bg-slate-300 py-3 px-5 rounded-full font-semibold text-black shadow-md transition hover:bg-slate-400 active:bg-slate-500 disabled:opacity-50 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </button>
  );
};