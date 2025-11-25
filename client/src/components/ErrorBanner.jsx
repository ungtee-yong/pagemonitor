const ErrorBanner = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="error-banner">
      <p>{message}</p>
      {onRetry && (
        <button className="ghost-button" type="button" onClick={onRetry}>
          ลองอีกครั้ง
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
