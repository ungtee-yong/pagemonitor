import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { api } from './services/api';
import PageSidebar from './components/PageSidebar';
import PostList from './components/PostList';
import CommentThread from './components/CommentThread';
import ErrorBanner from './components/ErrorBanner';
import Toast from './components/Toast';

function App() {
  const [pages, setPages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [loading, setLoading] = useState({
    pages: false,
    posts: false,
    comments: false
  });
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const selectedPageIdRef = useRef(null);
  const selectedPostIdRef = useRef(null);

  useEffect(() => {
    selectedPageIdRef.current = selectedPageId;
  }, [selectedPageId]);

  useEffect(() => {
    selectedPostIdRef.current = selectedPostId;
  }, [selectedPostId]);

  const fetchPages = useCallback(async ({ preserveSelection = true } = {}) => {
    setLoading((prev) => ({ ...prev, pages: true }));
    setError(null);
    try {
      const data = await api.getPages();
      setPages(data);

      if (!data.length) {
        setSelectedPageId(null);
        setSelectedPostId(null);
        setPosts([]);
        setComments([]);
        return;
      }

      const preferredId = preserveSelection ? selectedPageIdRef.current : null;
      const pageToSelect =
        preferredId && data.some((page) => page.id === preferredId)
          ? preferredId
          : data[0].id;
      setSelectedPageId(pageToSelect);
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลเพจได้');
    } finally {
      setLoading((prev) => ({ ...prev, pages: false }));
    }
  }, []);

  const fetchPosts = useCallback(
    async ({ pageId, preserveSelection = false }) => {
      if (!pageId) return;
      setLoading((prev) => ({ ...prev, posts: true }));
      setError(null);
      try {
        const data = await api.getPosts(pageId);
        setPosts(data);

        if (!data.length) {
          setSelectedPostId(null);
          setComments([]);
          return;
        }

        const preferredId = preserveSelection ? selectedPostIdRef.current : null;
        const postToSelect =
          preferredId && data.some((post) => post.id === preferredId)
            ? preferredId
            : data[0].id;
        setSelectedPostId(postToSelect);
      } catch (err) {
        setError(err.message || 'ไม่สามารถโหลดโพสต์ได้');
      } finally {
        setLoading((prev) => ({ ...prev, posts: false }));
      }
    },
    []
  );

  const fetchComments = useCallback(async ({ pageId, postId }) => {
    if (!pageId || !postId) return;
    setLoading((prev) => ({ ...prev, comments: true }));
    setError(null);
    try {
      const data = await api.getComments(pageId, postId);
      setComments(data);
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดคอมเมนต์ได้');
    } finally {
      setLoading((prev) => ({ ...prev, comments: false }));
    }
  }, []);

  useEffect(() => {
    fetchPages({ preserveSelection: false });
  }, [fetchPages]);

  useEffect(() => {
    if (!selectedPageId) return;
    fetchPosts({ pageId: selectedPageId });
  }, [selectedPageId, fetchPosts]);

  useEffect(() => {
    if (!selectedPageId || !selectedPostId) return;
    fetchComments({ pageId: selectedPageId, postId: selectedPostId });
  }, [selectedPageId, selectedPostId, fetchComments]);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) || null,
    [pages, selectedPageId]
  );

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId) || null,
    [posts, selectedPostId]
  );

  const handleSelectPage = (pageId) => {
    if (pageId === selectedPageId) return;
    setSelectedPageId(pageId);
    setSelectedPostId(null);
    setPosts([]);
    setComments([]);
  };

  const handleSelectPost = (postId) => {
    if (postId === selectedPostId) return;
    setSelectedPostId(postId);
    setComments([]);
  };

  const handleReply = useCallback(
    async (commentId, message) => {
      if (!selectedPageId || !selectedPostId) {
        throw new Error('กรุณาเลือกเพจและโพสต์ก่อนตอบกลับ');
      }

      await api.replyToComment(selectedPageId, commentId, message);
      setToastMessage('ตอบกลับสำเร็จ');
      fetchComments({ pageId: selectedPageId, postId: selectedPostId });
    },
    [selectedPageId, selectedPostId, fetchComments]
  );

  const handleRetry = () => {
    if (!selectedPageId) {
      fetchPages({ preserveSelection: false });
      return;
    }

    if (!selectedPostId) {
      fetchPosts({ pageId: selectedPageId, preserveSelection: true });
      return;
    }

    fetchComments({ pageId: selectedPageId, postId: selectedPostId });
  };

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="eyebrow">Facebook Page Reply Center</p>
          <h1>ตอบทุกคอมเมนต์ได้จากหน้าเดียว</h1>
          <p>
            ดูว่าแฟนเพจไปคอมเมนต์โพสต์ไหน เวลาใด พร้อมตอบกลับได้ทันทีโดยไม่ต้องเข้า Facebook
          </p>
        </div>
        <div className="token-hint">
          <p>ต้องมีสิทธิ์ pages_show_list, pages_read_engagement และ pages_manage_posts</p>
          <p className="muted">ใส่โทเคนในไฟล์ server/.env แล้วรีสตาร์ตเซิร์ฟเวอร์</p>
        </div>
      </header>

      <ErrorBanner message={error} onRetry={error ? handleRetry : undefined} />

      <main className="layout">
        <PageSidebar
          pages={pages}
          selectedPageId={selectedPageId}
          onSelect={handleSelectPage}
          loading={loading.pages}
          onRefresh={() => fetchPages({ preserveSelection: true })}
        />

        <PostList
          posts={posts}
          selectedPostId={selectedPostId}
          onSelect={handleSelectPost}
          loading={loading.posts}
          onRefresh={(pageId) =>
            fetchPosts({ pageId: pageId || selectedPageId, preserveSelection: true })
          }
          selectedPage={selectedPage}
        />

        <CommentThread
          comments={comments}
          post={selectedPost}
          loading={loading.comments}
          onReply={handleReply}
          onRefresh={(post) => {
            if (!selectedPageId || !selectedPostId) return;
            const targetPostId = post?.id || selectedPostId;
            fetchComments({ pageId: selectedPageId, postId: targetPostId });
          }}
        />
      </main>

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}

export default App;
