import { useState } from 'react';
import { MessageCircle, RefreshCw, Send, Heart, EyeOff, Trash2, ChevronDown, ChevronUp, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

function CommentSkeleton() {
  return (
    <div className="p-4 border-b border-white/5 animate-pulse">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10"></div>
        <div className="flex-1">
          <div className="h-3 bg-white/10 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-white/10 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

function ReplyForm({ onSubmit, onCancel, loading }) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const success = await onSubmit(message.trim());
    if (success) {
      setMessage('');
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 pl-13">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="เขียนคำตอบ..."
          className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-sm transition-colors"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

function CommentCard({ comment, onReply, onLike, onHide, onDelete, isPageReply, pageName }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = comment.from || {};
  const replies = comment.comments?.data || [];
  const hasReplies = replies.length > 0;

  const handleReply = async (message) => {
    setActionLoading(true);
    setError(null);
    try {
      await onReply(comment.id, message);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleLike = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await onLike(comment.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className={`p-4 border-b border-white/5 ${isPageReply ? 'bg-indigo-500/5 ml-8' : ''}`}>
      <div className="flex gap-3">
        {/* Profile Picture */}
        {from.picture?.data?.url ? (
          <img 
            src={from.picture.data.url} 
            alt={from.name}
            className="w-10 h-10 rounded-full ring-2 ring-white/10 flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-gray-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Name & Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white text-sm">
              {from.name || 'ผู้ใช้ Facebook'}
            </span>
            {isPageReply && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-xs">
                {pageName || 'เพจ'}
              </span>
            )}
          </div>

          {/* Comment Message */}
          <p className="text-gray-200 text-sm mt-1 whitespace-pre-wrap break-words">
            {comment.message}
          </p>

          {/* Attachment */}
          {comment.attachment && (
            <div className="mt-2 rounded-lg overflow-hidden bg-white/5 max-w-xs">
              {comment.attachment.media?.image?.src && (
                <img 
                  src={comment.attachment.media.image.src}
                  alt="Attachment"
                  className="w-full"
                />
              )}
            </div>
          )}

          {/* Meta & Actions */}
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="text-gray-500">
              {formatDistanceToNow(new Date(comment.created_time), { 
                addSuffix: true, 
                locale: th 
              })}
            </span>
            
            {comment.like_count > 0 && (
              <span className="text-gray-500 flex items-center gap-1">
                <Heart className="w-3 h-3" fill="currentColor" />
                {comment.like_count}
              </span>
            )}

            <button 
              onClick={handleLike}
              disabled={actionLoading}
              className="text-gray-400 hover:text-pink-400 transition-colors disabled:opacity-50"
            >
              <Heart className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-gray-400 hover:text-indigo-400 transition-colors"
            >
              ตอบกลับ
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-xs mt-2">{error}</p>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <ReplyForm 
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              loading={actionLoading}
            />
          )}

          {/* Show Replies Toggle */}
          {hasReplies && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  ซ่อนการตอบกลับ
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  ดูการตอบกลับ ({replies.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {showReplies && hasReplies && (
        <div className="mt-3 space-y-3">
          {replies.map((reply) => (
            <CommentCard 
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              onHide={onHide}
              onDelete={onDelete}
              isPageReply={reply.from?.id === comment.from?.id}
              pageName={pageName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentPanel({ 
  post,
  comments, 
  loading, 
  error, 
  hasMore,
  onLoadMore,
  onReply, 
  onLike, 
  onHide, 
  onDelete,
  onRefresh,
  pageName
}) {
  if (!post) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-display font-medium text-gray-300 mb-2">
          เลือกโพสต์เพื่อดูคอมเมนต์
        </h3>
        <p className="text-sm text-gray-500">
          คลิกที่โพสต์ทางซ้ายมือเพื่อดูและตอบกลับคอมเมนต์
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-semibold text-white">
            คอมเมนต์
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            {post.message || '(โพสต์ไม่มีข้อความ)'}
          </p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-h-[500px]">
        {error && (
          <div className="p-4 text-red-400 text-center">
            {error}
          </div>
        )}

        {loading && comments.length === 0 ? (
          <>
            {[...Array(4)].map((_, i) => (
              <CommentSkeleton key={i} />
            ))}
          </>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">ยังไม่มีคอมเมนต์ในโพสต์นี้</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentCard 
                key={comment.id}
                comment={comment}
                onReply={onReply}
                onLike={onLike}
                onHide={onHide}
                onDelete={onDelete}
                pageName={pageName}
              />
            ))}
            
            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={onLoadMore}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
