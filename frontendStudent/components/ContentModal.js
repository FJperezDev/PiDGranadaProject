export const ContentModal = ({ visible, onClose, title, content }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-slate-50 w-full h-full md:w-3/4 md:h-3/4 md:rounded-lg shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-300">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2">
            <X size={28} />
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <p className="text-lg leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
};