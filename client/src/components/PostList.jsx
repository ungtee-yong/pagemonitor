import { formatDateTime, trimMessage } from '../utils/format';

const PostList = ({
  posts,
  selectedPostId,
  onSelect,
  loading,
  onRefresh,
  selectedPage
}) => {
  const hasPage = Boolean(selectedPage);

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">โพสต์บนเพจ</p>
          <h3>{hasPage ? selectedPage.name : 'เลือกเพจก่อน'}</h3>
        </div>
        <div className="panel__actions">
          <button
            className="ghost-button"
            type="button"
            onClick={() => onRefresh?.(hasPage ? selectedPage.id : undefined)}
            disabled={!hasPage || loading}
          >
            {loading ? 'กำลังโหลด...' : 'รีเฟรชโพสต์'}
          </button>
        </div>
      </div>

      {!hasPage ? (
        <div className="empty-state">เลือกเพจเพื่อดูโพสต์ที่มีคอมเมนต์</div>
      ) : loading && !posts.length ? (
        <div className="empty-state">กำลังโหลดโพสต์ล่าสุด...</div>
      ) : posts.length ? (
        <ul className="post-list">
          {posts.map((post) => {
            const isActive = post.id === selectedPostId;
            return (
              <li key={post.id} className={`post-card ${isActive ? 'is-active' : ''}`}>
                <button type="button" onClick={() => onSelect(post.id)}>
                  <p className="post-card__message">
                    {post.message ? trimMessage(post.message, 140) : 'โพสต์นี้ไม่มีข้อความ'}
                  </p>
                  <div className="post-card__meta">
                    <span>{formatDateTime(post.created_time)}</span>
                    {post.permalink_url && (
                      <a
                        href={post.permalink_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        เปิดบน Facebook
                      </a>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty-state">โพสต์ล่าสุดยังไม่มีคอมเมนต์</div>
      )}
    </section>
  );
};

export default PostList;
