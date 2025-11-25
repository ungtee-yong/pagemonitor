import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onDismiss, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(timer);
  }, [message, onDismiss, duration]);

  if (!message) return null;

  return (
    <div className={`toast toast--${type}`} role="alert">
      <span>{message}</span>
      <button className="ghost-button" type="button" onClick={onDismiss}>
        ปิด
      </button>
    </div>
  );
};

export default Toast;
