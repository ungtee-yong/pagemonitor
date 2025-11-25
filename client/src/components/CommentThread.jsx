import Avatar from './Avatar';
import ReplyForm from './ReplyForm';
import { formatDateTime } from '../utils/format';

const CommentThread = ({
  comments,
  post,
  loading,
  onReply,
  onRefresh
}) => {
  const hasPost = Boolean(post);

  return (
    <section className="panel thread">
      <div className="panel__header">
        <div>
          <p className="eyebrow">คอมเมนต์ล่าสุด</p>
          <h3>{hasPost ? 'รายละเอียดโพสต์' : 'เลือกโพสต์เพื่อดูคอมเมนต์'}</h3>
        </div>
        <button
          className="ghost-button"
          type="button"
          onClick={() => hasPost && onRefresh?.(post)}
          disabled={!hasPost || loading}
        >
          {loading ? 'กำลังโหลด...' : 'รีเฟรชคอมเมนต์'}
        </button>
      </div>

      {!hasPost ? (
        <div className="empty-state">เลือกโพสต์จากตรงกลางเพื่อดูคอมเมนต์</div>
      ) : (
        <div className="thread__content">
          <article className="post-highlight">
            <p className="post-highlight__message">{post.message || 'โพสต์นี้ไม่มีข้อความ'}</p>
            <span className="post-highlight__timestamp">{formatDateTime(post.created_time)}</span>
          </article>

          {loading && !comments.length ? (
            <div className="empty-state">กำลังโหลดคอมเมนต์...</div>
          ) : comments.length ? (
            <ul className="comment-list">
              {comments.map((comment) => (
                <li key={comment.id} className="comment-card">
                  <div className="comment-card__avatar">
                    <Avatar
                      src={comment.from?.picture?.data?.url}
                      name={comment.from?.name}
                      size={48}
                    />
                  </div>
                  <div className="comment-card__body">
                    <div className="comment-card__meta">
                      <div>
                        <p className="comment-card__name">{comment.from?.name || 'ผู้ใช้ Facebook'}</p>
                        <span className="comment-card__time">{formatDateTime(comment.created_time)}</span>
                      </div>
                      {comment.permalink_url && (
                        <a href={comment.permalink_url} target="_blank" rel="noreferrer">
                          เปิดโพสต์
                        </a>
                      )}
                    </div>
                    <p className="comment-card__message">{comment.message}</p>
                    <ReplyForm onSubmit={(message) => onReply(comment.id, message)} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">ยังไม่มีคอมเมนต์บนโพสต์นี้</div>
          )}
        </div>
      )}
    </section>
  );
};

export default CommentThread;
