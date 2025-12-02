import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = '/api/facebook';

export function useFacebook() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Facebook SDK
  useEffect(() => {
    const initFB = () => {
      if (window.FB) {
        window.FB.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        
        window.FB.getLoginStatus((response) => {
          if (response.status === 'connected') {
            handleAuthResponse(response);
          } else {
            setLoading(false);
          }
          setIsInitialized(true);
        });
      }
    };

    if (window.FB) {
      initFB();
    } else {
      window.fbAsyncInit = initFB;
    }
  }, []);

  const handleAuthResponse = async (response) => {
    if (response.status === 'connected') {
      const token = response.authResponse.accessToken;
      setAccessToken(token);
      setIsLoggedIn(true);
      
      // Get user info
      window.FB.api('/me', { fields: 'id,name,picture' }, (userInfo) => {
        setUser(userInfo);
      });
      
      // Get managed pages
      try {
        const pagesResponse = await axios.get(`${API_BASE}/pages`, {
          params: { accessToken: token }
        });
        setPages(pagesResponse.data.data || []);
        
        // Auto-select first page if available
        if (pagesResponse.data.data?.length > 0) {
          setSelectedPage(pagesResponse.data.data[0]);
        }
      } catch (err) {
        setError(err.response?.data?.details || 'Failed to fetch pages');
      }
    }
    setLoading(false);
  };

  const login = useCallback(() => {
    window.FB.login((response) => {
      handleAuthResponse(response);
    }, { 
      scope: 'pages_show_list,pages_read_engagement,pages_manage_engagement,pages_read_user_content'
    });
  }, []);

  const logout = useCallback(() => {
    window.FB.logout(() => {
      setIsLoggedIn(false);
      setUser(null);
      setAccessToken(null);
      setPages([]);
      setSelectedPage(null);
    });
  }, []);

  const selectPage = useCallback((page) => {
    setSelectedPage(page);
  }, []);

  return {
    isInitialized,
    isLoggedIn,
    user,
    accessToken,
    pages,
    selectedPage,
    loading,
    error,
    login,
    logout,
    selectPage
  };
}

export function usePosts(pageId, pageAccessToken) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);

  const fetchPosts = useCallback(async (loadMore = false) => {
    if (!pageId || !pageAccessToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = { accessToken: pageAccessToken, limit: 25 };
      if (loadMore && cursor) {
        params.after = cursor;
      }
      
      const response = await axios.get(`${API_BASE}/posts/${pageId}`, { params });
      const newPosts = response.data.data || [];
      
      if (loadMore) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
      setHasMore(!!response.data.paging?.next);
      setCursor(response.data.paging?.cursors?.after || null);
    } catch (err) {
      setError(err.response?.data?.details || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [pageId, pageAccessToken, cursor]);

  useEffect(() => {
    if (pageId && pageAccessToken) {
      setPosts([]);
      setCursor(null);
      setHasMore(true);
      fetchPosts(false);
    }
  }, [pageId, pageAccessToken]);

  const refresh = useCallback(() => {
    setCursor(null);
    setHasMore(true);
    fetchPosts(false);
  }, [fetchPosts]);

  return { posts, loading, error, hasMore, fetchPosts, refresh };
}

export function useComments(postId, pageAccessToken) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);

  const fetchComments = useCallback(async (loadMore = false) => {
    if (!postId || !pageAccessToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = { accessToken: pageAccessToken, limit: 50 };
      if (loadMore && cursor) {
        params.after = cursor;
      }
      
      const response = await axios.get(`${API_BASE}/comments/${postId}`, { params });
      const newComments = response.data.data || [];
      
      if (loadMore) {
        setComments(prev => [...prev, ...newComments]);
      } else {
        setComments(newComments);
      }
      
      setHasMore(!!response.data.paging?.next);
      setCursor(response.data.paging?.cursors?.after || null);
    } catch (err) {
      setError(err.response?.data?.details || 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, [postId, pageAccessToken, cursor]);

  useEffect(() => {
    if (postId && pageAccessToken) {
      setComments([]);
      setCursor(null);
      setHasMore(true);
      fetchComments(false);
    }
  }, [postId, pageAccessToken]);

  const reply = useCallback(async (commentId, message) => {
    try {
      await axios.post(`${API_BASE}/reply/${commentId}`, {
        accessToken: pageAccessToken,
        message
      });
      // Refresh comments after reply
      fetchComments(false);
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.details || 'Failed to reply');
    }
  }, [pageAccessToken, fetchComments]);

  const likeComment = useCallback(async (commentId) => {
    try {
      await axios.post(`${API_BASE}/like/${commentId}`, {
        accessToken: pageAccessToken
      });
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.details || 'Failed to like');
    }
  }, [pageAccessToken]);

  const hideComment = useCallback(async (commentId, isHidden) => {
    try {
      await axios.post(`${API_BASE}/hide/${commentId}`, {
        accessToken: pageAccessToken,
        isHidden
      });
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.details || 'Failed to hide/unhide');
    }
  }, [pageAccessToken]);

  const deleteComment = useCallback(async (commentId) => {
    try {
      await axios.delete(`${API_BASE}/comment/${commentId}`, {
        params: { accessToken: pageAccessToken }
      });
      setComments(prev => prev.filter(c => c.id !== commentId));
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.details || 'Failed to delete');
    }
  }, [pageAccessToken]);

  const refresh = useCallback(() => {
    setCursor(null);
    setHasMore(true);
    fetchComments(false);
  }, [fetchComments]);

  return { 
    comments, 
    loading, 
    error, 
    hasMore, 
    fetchComments, 
    reply, 
    likeComment, 
    hideComment, 
    deleteComment,
    refresh 
  };
}
