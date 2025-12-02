const axios = require('axios');
const config = require('./config');
const Cache = require('./cache');

const graph = axios.create({
  baseURL: 'https://graph.facebook.com/v21.0',
  timeout: 10000,
});

const cache = new Cache(config.cacheTtlSeconds);

const COMMON_POST_FIELDS = [
  'id',
  'created_time',
  'message',
  'permalink_url',
  'full_picture',
  'attachments{media,type,url}',
  'comments.limit(0).summary(true)',
];

const COMMON_COMMENT_FIELDS = [
  'id',
  'message',
  'created_time',
  'permalink_url',
  'comment_count',
  'like_count',
  'parent{id}',
  'from{id,name,picture{data{url}}}',
  'attachment',
];

async function graphGet(path, params = {}) {
  try {
    const response = await graph.get(path, {
      params: {
        access_token: config.accessToken,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    const detail = error?.response?.data ?? error.message;
    throw new Error(`Facebook API GET ${path} failed: ${JSON.stringify(detail)}`);
  }
}

async function graphPost(path, data = {}, params = {}) {
  try {
    const response = await graph.post(path, data, {
      params: {
        access_token: config.accessToken,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    const detail = error?.response?.data ?? error.message;
    throw new Error(`Facebook API POST ${path} failed: ${JSON.stringify(detail)}`);
  }
}

async function getPagePosts({ limit = 10 } = {}) {
  const cacheKey = `posts:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await graphGet(`/${config.pageId}/posts`, {
    limit,
    fields: COMMON_POST_FIELDS.join(','),
  });

  const posts = (data?.data ?? []).map((post) => ({
    id: post.id,
    message: post.message,
    createdTime: post.created_time,
    permalink: post.permalink_url,
    fullPicture: post.full_picture,
    attachments: post.attachments?.data ?? [],
    commentsSummary: post.comments?.summary ?? { total_count: 0 },
  }));

  cache.set(cacheKey, posts);
  return posts;
}

async function getPostComments(postId, { limit = 25, after } = {}) {
  const cacheKey = `comments:${postId}:${limit}:${after ?? 'start'}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await graphGet(`/${postId}/comments`, {
    fields: COMMON_COMMENT_FIELDS.join(','),
    limit,
    order: 'reverse_chronological',
    filter: 'stream',
    ...(after ? { after } : {}),
  });

  const transformed = {
    comments: (data?.data ?? []).map((comment) => ({
      id: comment.id,
      message: comment.message,
      createdTime: comment.created_time,
      permalink: comment.permalink_url,
      likeCount: comment.like_count ?? 0,
      replyCount: comment.comment_count ?? 0,
      from: comment.from
        ? {
            id: comment.from.id,
            name: comment.from.name,
            picture: comment.from.picture?.data?.url,
          }
        : null,
      attachment: comment.attachment ?? null,
      parentId: comment.parent?.id ?? null,
    })),
    paging: data?.paging ?? null,
  };

  cache.set(cacheKey, transformed);
  return transformed;
}

async function replyToComment(commentId, message) {
  if (!message || !message.trim()) {
    const error = new Error('Reply message can not be empty');
    error.status = 400;
    throw error;
  }

  const data = await graphPost(`/${commentId}/comments`, { message });

  cache.clear();
  return data;
}

module.exports = {
  getPagePosts,
  getPostComments,
  replyToComment,
};
