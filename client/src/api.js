const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

const buildUrl = (path, params) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalized}`;
  if (!params) return url;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value);
    }
  });
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
};

async function request(path, { method = 'GET', body, params } = {}) {
  const response = await fetch(buildUrl(path, params), {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload?.error;
    throw new Error(message || `API ${method} ${path} failed with ${response.status}`);
  }

  return payload;
}

export const fetchPosts = (limit = 15) => request('/posts', { params: { limit } });

export const fetchComments = (postId, { limit = 25, after } = {}) =>
  request(`/posts/${postId}/comments`, { params: { limit, after } });

export const sendReply = (commentId, message) =>
  request(`/comments/${commentId}/reply`, {
    method: 'POST',
    body: { message },
  });

export const apiBaseUrl = API_BASE_URL;
