import { useState } from 'react';

const ReplyForm = ({ onSubmit }) => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed) {
      setError('กรุณาพิมพ์ข้อความตอบกลับ');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      await onSubmit(trimmed);
      setMessage('');
      setStatus('success');
      setTimeout(() => setStatus('idle'), 1500);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'ตอบกลับไม่สำเร็จ');
    }
  };

  return (
    <form className="reply-form" onSubmit={handleSubmit}>
      <textarea
        rows="2"
        placeholder="ตอบกลับคอมเมนต์นี้..."
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
          if (error) {
            setError(null);
          }
        }}
        disabled={status === 'loading'}
      />
      <div className="reply-form__footer">
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'กำลังส่ง...' : 'ตอบกลับ'}
        </button>
        {status === 'success' && <span className="success-text">ส่งแล้ว ✔</span>}
        {error && <span className="error-text">{error}</span>}
      </div>
    </form>
  );
};

export default ReplyForm;
