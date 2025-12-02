const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const buildUrl = (pathname, params = {}) => {
  const base = API_BASE || window.location.origin;
  const url = new URL(pathname, base);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

const handleResponse = async (response) => {
  if (response.ok) {
    return response.json();
  }

  let detail = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
  try {
    const payload = await response.json();
    detail = payload.message || payload.detail || detail;
  } catch {
    // ignore JSON parsing errors
  }
  const error = new Error(detail);
  error.status = response.status;
  throw error;
};

export const fetchFacebookPosts = async (params = {}) => {
  const url = buildUrl('/api/facebook/posts', params);
  const response = await fetch(url);
  return handleResponse(response);
};

export const replyToComment = async (commentId, message) => {
  const url = buildUrl(`/api/facebook/comments/${commentId}/reply`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  return handleResponse(response);
};
