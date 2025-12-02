import { MessageCircle, Heart, Share2, Image, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

function PostSkeleton() {
  return (
    <div className="p-4 border-b border-white/5 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-white/10 rounded w-1/2 mb-4"></div>
      <div className="flex gap-4">
        <div className="h-3 bg-white/10 rounded w-16"></div>
        <div className="h-3 bg-white/10 rounded w-16"></div>
      </div>
    </div>
  );
}

function PostCard({ post, isSelected, onSelect }) {
  const commentCount = post.comments?.summary?.total_count || 0;
  const reactionCount = post.reactions?.summary?.total_count || 0;
  const shareCount = post.shares?.count || 0;
  const hasComments = commentCount > 0;

  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 text-left border-b border-white/5 transition-all hover:bg-white/5 ${
        isSelected ? 'bg-indigo-500/20 border-l-2 border-l-indigo-500' : ''
      }`}
    >
      {/* Post Image */}
      {post.full_picture && (
        <div className="mb-3 rounded-lg overflow-hidden bg-white/5">
          <img 
            src={post.full_picture} 
            alt="Post"
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {/* Post Message */}
      <p className={`text-sm mb-2 line-clamp-3 ${
        post.message ? 'text-gray-200' : 'text-gray-500 italic'
      }`}>
        {post.message || '(ไม่มีข้อความ)'}
      </p>

      {/* Post Time */}
      <p className="text-xs text-gray-500 mb-3">
        {formatDistanceToNow(new Date(post.created_time), { 
          addSuffix: true, 
          locale: th 
        })}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs">
        <div className={`flex items-center gap-1.5 ${
          hasComments ? 'text-indigo-400' : 'text-gray-500'
        }`}>
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{commentCount}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Heart className="w-3.5 h-3.5" />
          <span>{reactionCount}</span>
        </div>
        {shareCount > 0 && (
          <div className="flex items-center gap-1.5 text-gray-500">
            <Share2 className="w-3.5 h-3.5" />
            <span>{shareCount}</span>
          </div>
        )}
        <a 
          href={post.permalink_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="ml-auto text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* New comments indicator */}
      {hasComments && (
        <div className="mt-2 px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs inline-block">
          {commentCount} คอมเมนต์
        </div>
      )}
    </button>
  );
}

export default function PostList({ 
  posts, 
  loading, 
  error, 
  selectedPost, 
  onSelectPost,
  hasMore,
  onLoadMore
}) {
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (loading && posts.length === 0) {
    return (
      <div className="max-h-[600px] overflow-y-auto">
        {[...Array(5)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-6 text-center">
        <Image className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">ยังไม่มีโพสต์</p>
      </div>
    );
  }

  return (
    <div className="max-h-[600px] overflow-y-auto">
      {posts.map((post) => (
        <PostCard 
          key={post.id}
          post={post}
          isSelected={selectedPost?.id === post.id}
          onSelect={() => onSelectPost(post)}
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
    </div>
  );
}
