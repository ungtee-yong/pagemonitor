const axios = require('axios');

const GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION || 'v19.0';
const USER_TOKEN = process.env.FACEBOOK_USER_ACCESS_TOKEN;

if (!USER_TOKEN) {
  console.warn('FACEBOOK_USER_ACCESS_TOKEN is not set. API routes will fail until it is provided.');
}

const graph = axios.create({
  baseURL: `https://graph.facebook.com/${GRAPH_VERSION}`,
  timeout: 15000
});

const pageTokenCache = new Map();

function normalizePage(page) {
  return {
    id: page.id,
    name: page.name,
    picture: page.picture?.data?.url || null
  };
}

function wrapError(error) {
  const fbError = error.response?.data?.error;
  if (fbError) {
    const err = new Error(fbError.message || 'Facebook API error');
    err.status = error.response?.status || 500;
    err.code = fbError.code;
    err.type = fbError.type;
    err.fbError = fbError;
    return err;
  }

  error.status = error.status || 500;
  return error;
}

async function graphRequest(path, { params = {}, data, method = 'get', accessToken } = {}) {
  const tokenToUse = accessToken || USER_TOKEN;
  if (!tokenToUse) {
    const err = new Error('Missing Facebook access token');
    err.status = 500;
    throw err;
  }

  try {
    const response = await graph.request({
      url: path,
      method,
      params: {
        ...params,
        access_token: tokenToUse
      },
      data
    });

    return response.data;
  } catch (error) {
    throw wrapError(error);
  }
}

async function ensurePageToken(pageId, forceRefresh = false) {
  if (!forceRefresh && pageTokenCache.has(pageId)) {
    return pageTokenCache.get(pageId);
  }

  const data = await graphRequest(`/${pageId}`, {
    params: { fields: 'access_token' }
  });

  if (!data.access_token) {
    const err = new Error('Unable to retrieve page access token.');
    err.status = 403;
    throw err;
  }

  pageTokenCache.set(pageId, data.access_token);
  return data.access_token;
}

async function listPages() {
  const data = await graphRequest('/me/accounts', {
    params: { fields: 'id,name,picture{url},access_token' }
  });

  const pages = (data?.data || []).map((page) => {
    if (page.access_token) {
      pageTokenCache.set(page.id, page.access_token);
    }

    return normalizePage(page);
  });

  return pages;
}

async function getPosts(pageId, { limit = 10 } = {}) {
  try {
    const pageToken = await ensurePageToken(pageId);
    const data = await graphRequest(`/${pageId}/posts`, {
      accessToken: pageToken,
      params: {
        fields: 'id,message,created_time,permalink_url',
        limit
      }
    });

    return data?.data || [];
  } catch (error) {
    if (error.code === 190) {
      pageTokenCache.delete(pageId);
    }
    throw error;
  }
}

async function getComments({ pageId, postId, limit = 50 }) {
  try {
    const pageToken = await ensurePageToken(pageId);
    const data = await graphRequest(`/${postId}/comments`, {
      accessToken: pageToken,
      params: {
        fields: 'id,message,created_time,permalink_url,from{id,name,picture}',
        order: 'reverse_chronological',
        limit
      }
    });

    return data?.data || [];
  } catch (error) {
    if (error.code === 190) {
      pageTokenCache.delete(pageId);
    }
    throw error;
  }
}

async function replyToComment({ pageId, commentId, message }) {
  if (!message) {
    const err = new Error('Reply message cannot be empty.');
    err.status = 400;
    throw err;
  }

  try {
    const pageToken = await ensurePageToken(pageId);
    const data = await graphRequest(`/${commentId}/comments`, {
      method: 'post',
      accessToken: pageToken,
      data: { message }
    });

    return data;
  } catch (error) {
    if (error.code === 190) {
      pageTokenCache.delete(pageId);
    }
    throw error;
  }
}

module.exports = {
  listPages,
  getPosts,
  getComments,
  replyToComment,
  ensurePageToken
};
