const facebookClient = require('../lib/facebookClient');
const { getRuntimeConfig } = require('../lib/config');
const mockResponse = require('../mock/posts.json');

const normalizeComment = (comment, postId) => {
  if (!comment) return null;
  const commenter = comment.from
    ? {
        id: comment.from.id,
        name: comment.from.name,
        picture: comment.from.picture?.data?.url,
      }
    : null;

  return {
    id: comment.id,
    postId,
    message: comment.message,
    createdTime: comment.created_time,
    permalink: comment.permalink_url,
    commentCount: comment.comment_count || 0,
    commenter,
  };
};

const normalizePost = (post) => {
  if (!post) return null;
  const comments = (post.comments?.data || [])
    .map((comment) => normalizeComment(comment, post.id))
    .filter(Boolean);

  return {
    id: post.id,
    message: post.message || post.story || '',
    createdTime: post.created_time,
    permalink: post.permalink_url,
    fullPicture: post.full_picture,
    commentCount: post.comments?.summary?.total_count || comments.length,
    comments,
  };
};

const isMockMode = () => {
  const { useMockData, pageId, accessToken } = getRuntimeConfig();
  return useMockData || !pageId || !accessToken;
};

const sortPosts = (posts = []) =>
  posts.slice().sort((a, b) => {
    const left = new Date(a.createdTime || a.created_time).getTime();
    const right = new Date(b.createdTime || b.created_time).getTime();
    return right - left;
  });

const getPosts = async (params) => {
  if (isMockMode()) {
    return {
      posts: sortPosts(mockResponse.posts),
      paging: mockResponse.paging || null,
      source: 'mock',
      updatedAt: new Date().toISOString(),
    };
  }

  const response = await facebookClient.fetchPosts(params);
  const posts = sortPosts(
    (response.data || []).map(normalizePost).filter(Boolean)
  );

  return {
    posts,
    paging: response.paging || null,
    source: 'live',
    updatedAt: new Date().toISOString(),
  };
};

const replyToComment = async (commentId, message) => {
  if (!message) {
    const error = new Error('Message is required');
    error.status = 400;
    throw error;
  }

  if (isMockMode()) {
    return {
      id: `mock_${Date.now()}`,
      commentId,
      message,
      createdTime: new Date().toISOString(),
      source: 'mock',
    };
  }

  const response = await facebookClient.replyToComment(commentId, message);
  return {
    ...response,
    source: 'live',
  };
};

module.exports = {
  getPosts,
  replyToComment,
  isMockMode,
};
