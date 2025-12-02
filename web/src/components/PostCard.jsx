import CommentItem from './CommentItem';
import { formatDateTime, formatRelativeTime } from '../utils/date';

const PostCard = ({ post, onReply, replyingId }) => {
  return (
    <article className="post-card">
      <header className="post-header">
        <div>
          <p className="post-time">
            {formatRelativeTime(post.createdTime)} · {formatDateTime(post.createdTime)}
          </p>
          <p className="post-message">{post.message || 'โพสต์นี้ไม่มีแคปชัน'}</p>
        </div>
        {post.permalink && (
          <a href={post.permalink} target="_blank" rel="noreferrer" className="text-link">
            เปิดโพสต์ ↗
          </a>
        )}
      </header>
      {post.fullPicture && (
        <div className="post-media">
          <img src={post.fullPicture} alt="ภาพประกอบโพสต์" loading="lazy" />
        </div>
      )}
      <section className="post-comments">
        <div className="post-comments-header">
          <h3>คอมเมนต์ล่าสุด</h3>
          <span className="badge">{post.commentCount} ข้อความ</span>
        </div>
        {post.comments?.length ? (
          <div className="comment-list">
            {post.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={onReply}
                isReplying={replyingId === comment.id}
              />
            ))}
          </div>
        ) : (
          <p className="empty-comments">ยังไม่มีคอมเมนต์ใหม่</p>
        )}
      </section>
    </article>
  );
};

export default PostCard;
