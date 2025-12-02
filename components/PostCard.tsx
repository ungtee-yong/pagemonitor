'use client';

import { useState } from 'react';
import CommentItem from './CommentItem';

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

interface Post {
  id: string;
  message?: string;
  created_time: string;
  permalink_url: string;
  comments: Comment[];
  commentsCount: number;
}

interface PostCardProps {
  post: Post;
  onReply: (postId: string, commentId: string) => void;
}

export default function PostCard({ post, onReply }: PostCardProps) {
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

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-meta">
          <span>โพสต์เมื่อ {formatDate(post.created_time)}</span>
        </div>
        <a
          href={post.permalink_url}
          target="_blank"
          rel="noopener noreferrer"
          className="post-link"
        >
          ดูบน Facebook →
        </a>
      </div>

      {post.message && (
        <div className="post-message">{post.message}</div>
      )}

      <div className="comments-section">
        <div className="comments-header">
          คอมเมนต์ ({post.commentsCount})
        </div>
        {post.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={post.id}
            onReplySuccess={() => onReply(post.id, comment.id)}
          />
        ))}
      </div>
    </div>
  );
}
