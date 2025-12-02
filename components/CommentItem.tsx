'use client';

import { useState } from 'react';

interface Comment {
  id: string;
  message: string;
  created_time: string;
  from: {
    id: string;
    name: string;
    picture: {
      data: {
        url: string;
      };
    };
  };
  can_reply_comment?: boolean;
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onReplySuccess: () => void;
}

export default function CommentItem({
  comment,
  postId,
  onReplySuccess,
}: CommentItemProps) {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyStatus, setReplyStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'เมื่อสักครู่';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} นาทีที่แล้ว`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ชั่วโมงที่แล้ว`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} วันที่แล้ว`;
    } else {
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      return;
    }

    setIsReplying(true);
    setReplyStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/comments/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId: comment.id,
          message: replyText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถตอบกลับได้');
      }

      setReplyStatus({
        type: 'success',
        message: 'ตอบกลับสำเร็จแล้ว',
      });
      setReplyText('');
      setTimeout(() => {
        setReplyStatus({ type: null, message: '' });
        onReplySuccess();
      }, 2000);
    } catch (error: any) {
      setReplyStatus({
        type: 'error',
        message: error.message || 'เกิดข้อผิดพลาดในการตอบกลับ',
      });
    } finally {
      setIsReplying(false);
    }
  };

  const profilePictureUrl =
    comment.from.picture?.data?.url ||
    `https://graph.facebook.com/${comment.from.id}/picture?type=square`;

  return (
    <div className="comment-item">
      <img
        src={profilePictureUrl}
        alt={comment.from.name}
        className="comment-avatar"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://via.placeholder.com/40?text=U';
        }}
      />
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.from.name}</span>
          <span className="comment-time">{formatDate(comment.created_time)}</span>
        </div>
        <div className="comment-message">{comment.message}</div>

        <div className="reply-form">
          <textarea
            className="reply-input"
            placeholder="พิมพ์ข้อความตอบกลับ..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            disabled={isReplying}
          />
          <button
            className="reply-button"
            onClick={handleReply}
            disabled={isReplying || !replyText.trim()}
          >
            {isReplying ? 'กำลังส่ง...' : 'ตอบกลับ'}
          </button>

          {replyStatus.type === 'success' && (
            <div className="reply-success">{replyStatus.message}</div>
          )}
          {replyStatus.type === 'error' && (
            <div className="reply-error">{replyStatus.message}</div>
          )}
        </div>
      </div>
    </div>
  );
}
