const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMessage = payload?.error?.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์';
    const error = new Error(errorMessage);
    error.details = payload?.error;
    throw error;
  }

  return payload;
}

export const api = {
  getPages() {
    return request('/pages');
  },
  getPosts(pageId) {
    return request(`/pages/${pageId}/posts`);
  },
  getComments(pageId, postId) {
    return request(`/posts/${postId}/comments?pageId=${pageId}`);
  },
  replyToComment(pageId, commentId, message) {
    return request(`/comments/${commentId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ message, pageId })
    });
  }
};
