import { useState } from 'react';
import { formatDateTime, formatRelativeTime } from '../utils/date';
import ReplyForm from './ReplyForm';

const fallbackAvatar = 'https://ui-avatars.com/api/?name=FB&background=E0E7FF&color=4338CA&size=96';

const CommentItem = ({ comment, onReply, isReplying }) => {
  const [isReplyingOpen, setIsReplyingOpen] = useState(false);
  const avatar = comment.commenter?.picture || fallbackAvatar;

  const handleReply = async (message) => {
    await onReply(comment.id, message);
    setIsReplyingOpen(false);
  };

  return (
    <div className="comment-item">
      <img
        className="comment-avatar"
        src={avatar}
        alt={comment.commenter?.name || 'ผู้ใช้ Facebook'}
        onError={(event) => {
          event.currentTarget.src = fallbackAvatar;
        }}
      />
      <div className="comment-body">
        <div className="comment-header">
          <div>
            <p className="comment-author">{comment.commenter?.name || 'ผู้ใช้ Facebook'}</p>
            <p className="comment-meta">
              {formatRelativeTime(comment.createdTime)} · {formatDateTime(comment.createdTime)}
            </p>
          </div>
          {comment.permalink && (
            <a
              href={comment.permalink}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              เปิดใน Facebook ↗
            </a>
          )}
        </div>
        <p className="comment-message">{comment.message}</p>
        <div className="comment-actions">
          <button
            type="button"
            className="ghost"
            onClick={() => setIsReplyingOpen((prev) => !prev)}
          >
            {isReplyingOpen ? 'ยกเลิก' : 'ตอบกลับ'}
          </button>
        </div>
        {isReplyingOpen && (
          <ReplyForm
            onSubmit={handleReply}
            isSubmitting={isReplying}
            onCancel={() => setIsReplyingOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CommentItem;
