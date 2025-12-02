import { useCallback, useEffect, useMemo, useState } from 'react';
import Toolbar from './components/Toolbar';
import PostCard from './components/PostCard';
import EmptyState from './components/EmptyState';
import { fetchFacebookPosts, replyToComment } from './api/facebook';
import { formatDateTime } from './utils/date';
import './index.css';

const REFRESH_INTERVAL_MS = 60_000;

function App() {
  const [posts, setPosts] = useState([]);
  const [limit, setLimit] = useState(5);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [replyingId, setReplyingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [meta, setMeta] = useState({ source: 'mock', updatedAt: null });

  const loadPosts = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setStatus('loading');
      }
      setError(null);
      try {
        const payload = await fetchFacebookPosts({ limit });
        setPosts(payload.posts || []);
        setMeta({ source: payload.source, updatedAt: payload.updatedAt });
        setStatus('ready');
      } catch (err) {
        setError(err.message || 'ไม่สามารถเชื่อมต่อได้');
        setStatus('error');
      }
    },
    [limit]
  );

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(() => loadPosts({ silent: true }), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoRefresh, loadPosts]);

  const handleReply = useCallback(
    async (commentId, message) => {
      setReplyingId(commentId);
      setToast(null);
      try {
        await replyToComment(commentId, message);
        setToast({ type: 'success', message: 'ตอบกลับสำเร็จแล้ว ✨' });
        await loadPosts({ silent: true });
      } catch (err) {
        setToast({
          type: 'error',
          message: err.message || 'ตอบกลับไม่สำเร็จ',
        });
      } finally {
        setReplyingId(null);
      }
    },
    [loadPosts]
  );

  const lastUpdatedText = useMemo(() => {
    if (!meta.updatedAt) return 'ยังไม่เคยอัปเดต';
    return formatDateTime(meta.updatedAt);
  }, [meta.updatedAt]);

  const isLoading = status === 'loading';
  const isEmpty = !isLoading && posts.length === 0;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Page Comment Command Center</p>
          <h1>ดูและตอบคอมเมนต์ Facebook Page ได้ในที่เดียว</h1>
          <p className="subtitle">
            รวมทุกโพสต์ที่มีคอมเมนต์ใหม่พร้อมข้อมูลผู้คอมเมนต์ เวลา และลิงก์ เปิดผ่าน
            Facebook Graph API / โหมด Mock สำหรับทดสอบ
          </p>
        </div>
        <div className="header-stats">
          <span className={`badge ${meta.source === 'live' ? 'badge-live' : 'badge-mock'}`}>
            {meta.source === 'live' ? 'Live Data จาก Facebook' : 'Mock Data สำหรับทดสอบ'}
          </span>
          <p className="timestamp">อัปเดตล่าสุด: {lastUpdatedText}</p>
        </div>
      </header>

      <Toolbar
        limit={limit}
        onLimitChange={setLimit}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={setAutoRefresh}
        onRefresh={() => loadPosts()}
        isRefreshing={isLoading}
      />

      {error && <div className="alert alert-error">{error}</div>}
      {toast && <div className={`alert alert-${toast.type}`}>{toast.message}</div>}

      {isLoading && (
        <div className="skeleton-list">
          {[...Array(3).keys()].map((key) => (
            <div key={key} className="skeleton-card" />
          ))}
        </div>
      )}

      {isEmpty && !isLoading && <EmptyState onRefresh={() => loadPosts()} />}

      {!isEmpty && !isLoading && (
        <section className="post-grid">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onReply={handleReply}
              replyingId={replyingId}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default App;
