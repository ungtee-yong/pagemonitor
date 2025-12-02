import { useState } from 'react';
import { useFacebook, usePosts, useComments } from './hooks/useFacebook';
import Header from './components/Header';
import PageSelector from './components/PageSelector';
import PostList from './components/PostList';
import CommentPanel from './components/CommentPanel';
import LoginScreen from './components/LoginScreen';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const { 
    isInitialized, 
    isLoggedIn, 
    user, 
    pages, 
    selectedPage, 
    loading: authLoading,
    error: authError,
    login, 
    logout, 
    selectPage 
  } = useFacebook();

  const [selectedPost, setSelectedPost] = useState(null);

  const { 
    posts, 
    loading: postsLoading, 
    error: postsError,
    hasMore: hasMorePosts,
    fetchPosts,
    refresh: refreshPosts
  } = usePosts(selectedPage?.id, selectedPage?.access_token);

  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    hasMore: hasMoreComments,
    fetchComments,
    reply,
    likeComment,
    hideComment,
    deleteComment,
    refresh: refreshComments
  } = useComments(selectedPost?.id, selectedPage?.access_token);

  // Show loading screen while initializing
  if (!isInitialized || authLoading) {
    return <LoadingScreen />;
  }

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return <LoginScreen onLogin={login} error={authError} />;
  }

  return (
    <div className="min-h-screen">
      <Header 
        user={user} 
        onLogout={logout} 
      />
      
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Selector */}
        <PageSelector 
          pages={pages}
          selectedPage={selectedPage}
          onSelectPage={(page) => {
            selectPage(page);
            setSelectedPost(null);
          }}
        />

        {authError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
            {authError}
          </div>
        )}

        {selectedPage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Posts Panel */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-display font-semibold text-white">
                  โพสต์ทั้งหมด
                </h2>
                <button 
                  onClick={refreshPosts}
                  className="px-3 py-1.5 text-sm rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  รีเฟรช
                </button>
              </div>
              
              <PostList 
                posts={posts}
                loading={postsLoading}
                error={postsError}
                selectedPost={selectedPost}
                onSelectPost={setSelectedPost}
                hasMore={hasMorePosts}
                onLoadMore={() => fetchPosts(true)}
              />
            </div>

            {/* Comments Panel */}
            <div className="glass rounded-2xl overflow-hidden">
              <CommentPanel 
                post={selectedPost}
                comments={comments}
                loading={commentsLoading}
                error={commentsError}
                hasMore={hasMoreComments}
                onLoadMore={() => fetchComments(true)}
                onReply={reply}
                onLike={likeComment}
                onHide={hideComment}
                onDelete={deleteComment}
                onRefresh={refreshComments}
                pageName={selectedPage?.name}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
