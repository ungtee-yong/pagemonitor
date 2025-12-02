import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { apiBaseUrl, fetchComments, fetchPosts, sendReply } from './api'

const formatDateTime = (value) => {
  try {
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'th-TH'
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

const truncate = (text, limit = 140) => {
  if (!text) return ''
  return text.length > limit ? `${text.slice(0, limit)}…` : text
}

function App() {
  const [posts, setPosts] = useState([])
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [comments, setComments] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [loadingComments, setLoadingComments] = useState(false)
  const [banner, setBanner] = useState(null)
  const [activeReplyId, setActiveReplyId] = useState(null)
  const [replyDraft, setReplyDraft] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId),
    [posts, selectedPostId],
  )

  const notify = (message, type = 'info') => {
    setBanner({ message, type })
  }

  const loadPosts = async () => {
    setLoadingPosts(true)
    try {
      const data = await fetchPosts(15)
      setPosts(data)
      if (!data.length) {
        setSelectedPostId(null)
        return
      }
      const keepsSelection = data.some((post) => post.id === selectedPostId)
      setSelectedPostId(keepsSelection ? selectedPostId : data[0].id)
    } catch (error) {
      notify(error.message ?? 'ไม่สามารถโหลดโพสต์ได้', 'error')
    } finally {
      setLoadingPosts(false)
    }
  }

  const loadComments = async (postId, cursor) => {
    if (!postId) return
    setLoadingComments(true)
    try {
      const data = await fetchComments(postId, { after: cursor })
      setComments((prev) => (cursor ? [...prev, ...data.comments] : data.comments))
      setNextCursor(data?.paging?.cursors?.after ?? null)
    } catch (error) {
      notify(error.message ?? 'ไม่สามารถโหลดคอมเมนต์ได้', 'error')
    } finally {
      setLoadingComments(false)
    }
  }

  useEffect(() => {
    loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedPostId) {
      loadComments(selectedPostId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPostId])

  const handleSelectPost = (postId) => {
    setSelectedPostId(postId)
    setComments([])
    setNextCursor(null)
    setActiveReplyId(null)
    setReplyDraft('')
  }

  const handleReplySubmit = async (commentId) => {
    const message = replyDraft.trim()
    if (!message) {
      notify('กรุณาพิมพ์ข้อความก่อนส่งตอบกลับ', 'error')
      return
    }
    setSendingReply(true)
    try {
      await sendReply(commentId, message)
      notify('ตอบกลับสำเร็จ 🎉', 'success')
      setActiveReplyId(null)
      setReplyDraft('')
      await loadComments(selectedPostId)
    } catch (error) {
      notify(error.message ?? 'ส่งข้อความไม่สำเร็จ', 'error')
    } finally {
      setSendingReply(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Page Monitor</p>
          <h1>จัดการคอมเมนต์จากเพจ Facebook ได้ที่นี่</h1>
          <p className="muted">
            ดึงโพสต์และคอมเมนต์จาก {apiBaseUrl} และตอบกลับได้โดยไม่ต้องเปิด
            Facebook
          </p>
        </div>
        <div className="header-actions">
          <button className="secondary" onClick={loadPosts} disabled={loadingPosts}>
            {loadingPosts ? 'กำลังโหลด…' : 'รีเฟรชโพสต์'}
          </button>
        </div>
      </header>

      {banner && (
        <div className={`banner banner-${banner.type}`}>
          <span>{banner.message}</span>
          <button onClick={() => setBanner(null)} aria-label="ปิดแจ้งเตือน">
            ×
          </button>
        </div>
      )}

      <main className="app-grid">
        <section className="panel posts-panel">
          <div className="panel-header">
            <h2>โพสต์ล่าสุด</h2>
            <span className="muted">{posts.length} รายการ</span>
          </div>
          {loadingPosts ? (
            <div className="empty-state">กำลังโหลดโพสต์...</div>
          ) : posts.length === 0 ? (
            <div className="empty-state">ยังไม่มีโพสต์ให้แสดง</div>
          ) : (
            <ul className="post-list">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className={`post-card ${post.id === selectedPostId ? 'active' : ''}`}
                  onClick={() => handleSelectPost(post.id)}
                >
                  <div className="post-meta">
                    <span>{formatDateTime(post.createdTime)}</span>
                    <span>{post.commentsSummary?.total_count ?? 0} คอมเมนต์</span>
                  </div>
                  <p className="post-message">
                    {post.message ? truncate(post.message, 180) : 'ไม่มีข้อความ'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel comments-panel">
          {selectedPost ? (
            <>
              <div className="panel-header">
                <div>
                  <h2>คอมเมนต์</h2>
                  <p className="muted">
                    โพสต์: {truncate(selectedPost.message ?? 'ไม่มีข้อความ', 120)}
                  </p>
                </div>
                <button
                  className="secondary"
                  onClick={() => loadComments(selectedPostId)}
                  disabled={loadingComments}
                >
                  {loadingComments ? 'กำลังโหลด…' : 'รีเฟรชคอมเมนต์'}
                </button>
              </div>
              <ul className="comment-list">
                {comments.length === 0 && !loadingComments ? (
                  <li className="empty-state">ยังไม่มีคอมเมนต์ในโพสต์นี้</li>
                ) : (
                  comments.map((comment) => (
                    <li key={comment.id} className="comment-card">
                      <img
                        src={
                          comment.from?.picture ||
                          `https://ui-avatars.com/api/?background=4a90e2&color=fff&name=${
                            comment.from?.name ?? 'แฟนเพจ'
                          }`
                        }
                        alt={comment.from?.name}
                        className="avatar"
                      />
                      <div className="comment-body">
                        <div className="comment-meta">
                          <strong>{comment.from?.name ?? 'ผู้ใช้ Facebook'}</strong>
                          <span>{formatDateTime(comment.createdTime)}</span>
                        </div>
                        <p className="comment-text">{comment.message}</p>
                        {comment.attachment?.media?.image?.src && (
                          <img
                            src={comment.attachment.media.image.src}
                            alt="Comment attachment"
                            className="comment-attachment"
                          />
                        )}
                        <div className="comment-actions">
                          <span>ถูกใจ {comment.likeCount ?? 0}</span>
                          <span>ตอบกลับ {comment.replyCount ?? 0}</span>
                          <button
                            className="link"
                            onClick={() => {
                              setActiveReplyId(comment.id)
                              setReplyDraft('')
                            }}
                          >
                            ตอบกลับ
                          </button>
                        </div>
                        {activeReplyId === comment.id && (
                          <div className="reply-box">
                            <textarea
                              placeholder="พิมพ์ข้อความตอบกลับ..."
                              value={replyDraft}
                              onChange={(event) => setReplyDraft(event.target.value)}
                              disabled={sendingReply}
                            />
                            <div className="reply-actions">
                              <button
                                className="secondary"
                                onClick={() => {
                                  setActiveReplyId(null)
                                  setReplyDraft('')
                                }}
                                disabled={sendingReply}
                              >
                                ยกเลิก
                              </button>
                              <button
                                onClick={() => handleReplySubmit(comment.id)}
                                disabled={sendingReply}
                              >
                                {sendingReply ? 'กำลังส่ง…' : 'ส่งตอบกลับ'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>
              {nextCursor && (
                <button
                  className="secondary full-width"
                  onClick={() => loadComments(selectedPostId, nextCursor)}
                  disabled={loadingComments}
                >
                  {loadingComments ? 'กำลังโหลด…' : 'ดูคอมเมนต์เพิ่มเติม'}
                </button>
              )}
            </>
          ) : (
            <div className="empty-state">เลือกโพสต์ทางซ้ายเพื่อดูคอมเมนต์</div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
