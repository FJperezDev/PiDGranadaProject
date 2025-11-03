export const AlertModal = ({ visible, onClose, title, message }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl flex flex-col p-6">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-base mb-6">{message}</p>
        <StyledButton
          title="OK"
          onClick={onClose}
          className="self-end bg-cyan-200"
        />
      </div>
    </div>
  );
};