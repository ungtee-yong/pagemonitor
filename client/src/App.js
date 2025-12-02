import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchPostsWithComments();
  }, []);

  const fetchPostsWithComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/posts-with-comments`);
      setPosts(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'ไม่สามารถโหลดข้อมูลได้');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (commentId) => {
    if (!replyMessage.trim()) {
      alert('กรุณากรอกข้อความตอบกลับ');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/comments/${commentId}/replies`, {
        message: replyMessage
      });
      alert('ตอบกลับสำเร็จ!');
      setReplyMessage('');
      setReplyingTo(null);
      // Refresh comments
      fetchPostsWithComments();
    } catch (err) {
      alert('ไม่สามารถตอบกลับได้: ' + (err.response?.data?.error || err.message));
      console.error('Error replying:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getProfilePicture = (picture) => {
    if (picture && picture.data && picture.data.url) {
      return picture.data.url;
    }
    return 'https://via.placeholder.com/40';
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error">
          <h2>เกิดข้อผิดพลาด</h2>
          <p>{error}</p>
          <button onClick={fetchPostsWithComments}>ลองอีกครั้ง</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📱 จัดการคอมเมนต์ Facebook Page</h1>
        <button onClick={fetchPostsWithComments} className="refresh-btn">
          🔄 รีเฟรช
        </button>
      </header>

      <div className="content">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>ไม่มีโพสต์ที่มีคอมเมนต์</p>
          </div>
        ) : (
          <div className="posts-container">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <h3>โพสต์</h3>
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
                  <div className="post-message">
                    {post.message.length > 200 
                      ? `${post.message.substring(0, 200)}...` 
                      : post.message}
                  </div>
                )}
                
                <div className="post-meta">
                  <span>📅 {formatDate(post.created_time)}</span>
                  <span>💬 {post.comments.length} คอมเมนต์</span>
                </div>

                <div className="comments-section">
                  <h4>คอมเมนต์ ({post.comments.length})</h4>
                  
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="comment-card">
                      <div className="comment-header">
                        <img 
                          src={getProfilePicture(comment.from?.picture)} 
                          alt={comment.from?.name || 'User'}
                          className="profile-picture"
                        />
                        <div className="comment-info">
                          <div className="comment-author">
                            {comment.from?.name || 'ไม่ระบุชื่อ'}
                          </div>
                          <div className="comment-time">
                            {formatDate(comment.created_time)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="comment-message">
                        {comment.message}
                      </div>
                      
                      <div className="comment-actions">
                        {comment.like_count > 0 && (
                          <span className="like-count">👍 {comment.like_count}</span>
                        )}
                        <button 
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="reply-btn"
                        >
                          {replyingTo === comment.id ? 'ยกเลิก' : 'ตอบกลับ'}
                        </button>
                      </div>

                      {replyingTo === comment.id && (
                        <div className="reply-form">
                          <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="พิมพ์ข้อความตอบกลับ..."
                            rows="3"
                            className="reply-input"
                          />
                          <div className="reply-actions">
                            <button 
                              onClick={() => handleReply(comment.id)}
                              className="send-reply-btn"
                            >
                              ส่งคำตอบ
                            </button>
                            <button 
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyMessage('');
                              }}
                              className="cancel-btn"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
