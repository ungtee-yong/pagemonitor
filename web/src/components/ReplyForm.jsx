import { useState } from 'react';

const ReplyForm = ({ onSubmit, isSubmitting, onCancel }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = value.trim();
    if (!message) {
      setError('กรุณาพิมพ์ข้อความตอบกลับ');
      return;
    }
    setError(null);
    await onSubmit(message);
    setValue('');
  };

  return (
    <form className="reply-form" onSubmit={handleSubmit}>
      <textarea
        rows={3}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="ตอบกลับลูกค้าทันที..."
        disabled={isSubmitting}
      />
      {error && <p className="form-error">{error}</p>}
      <div className="reply-form-actions">
        <button type="button" className="ghost" onClick={onCancel} disabled={isSubmitting}>
          ยกเลิก
        </button>
        <button type="submit" className="primary" disabled={isSubmitting}>
          {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำตอบ'}
        </button>
      </div>
    </form>
  );
};

export default ReplyForm;
