'use client';

import { useState, useEffect } from 'react';
import CommentItem from '@/components/CommentItem';
import PostCard from '@/components/PostCard';

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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCommentReply = (postId: string, commentId: string) => {
    // Refresh posts after reply
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Facebook Page Comments Manager</h1>
          <p>จัดการและตอบกลับคอมเมนต์จาก Facebook Page</p>
        </div>
        <div className="loading">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <h1>Facebook Page Comments Manager</h1>
          <p>จัดการและตอบกลับคอมเมนต์จาก Facebook Page</p>
        </div>
        <div className="error">
          <strong>เกิดข้อผิดพลาด:</strong> {error}
          <br />
          <br />
          <button className="refresh-button" onClick={fetchPosts}>
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Facebook Page Comments Manager</h1>
        <p>จัดการและตอบกลับคอมเมนต์จาก Facebook Page</p>
        <button
          className="refresh-button"
          onClick={fetchPosts}
          style={{ marginTop: '16px' }}
        >
          รีเฟรชข้อมูล
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <h2>ไม่มีโพสต์ที่มีคอมเมนต์</h2>
          <p>ยังไม่มีโพสต์ที่มีคอมเมนต์เข้ามา</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onReply={handleCommentReply}
          />
        ))
      )}
    </div>
  );
}
