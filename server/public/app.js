const state = {
  pages: [],
  posts: [],
  comments: [],
  selectedPageId: null,
  selectedPostId: null,
  loading: {
    pages: false,
    posts: false,
    comments: false
  }
};

const elements = {
  pagesContainer: document.getElementById('pages-container'),
  pagesRefreshBtn: document.getElementById('pages-refresh'),
  postsTitle: document.getElementById('posts-title'),
  postsBody: document.getElementById('posts-body'),
  postsRefreshBtn: document.getElementById('posts-refresh'),
  commentsTitle: document.getElementById('comments-title'),
  commentsBody: document.getElementById('comments-body'),
  commentsRefreshBtn: document.getElementById('comments-refresh'),
  errorBanner: document.getElementById('error-banner'),
  errorMessage: document.getElementById('error-message'),
  errorRetry: document.getElementById('error-retry'),
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toast-message'),
  toastClose: document.getElementById('toast-close')
};

const dateFormatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

let retryAction = null;
let toastTimer = null;

elements.errorRetry.addEventListener('click', () => {
  if (typeof retryAction === 'function') {
    retryAction();
  }
});

elements.pagesRefreshBtn.addEventListener('click', () => fetchPages({ preserveSelection: true }));
elements.postsRefreshBtn.addEventListener('click', () => {
  if (!state.selectedPageId) return;
  fetchPosts({ pageId: state.selectedPageId, preserveSelection: true });
});
elements.commentsRefreshBtn.addEventListener('click', () => {
  if (!state.selectedPageId || !state.selectedPostId) return;
  fetchComments({ pageId: state.selectedPageId, postId: state.selectedPostId });
});

elements.commentsBody.addEventListener('submit', async (event) => {
  if (!event.target.matches('.reply-form')) return;
  event.preventDefault();

  const form = event.target;
  const textarea = form.querySelector('textarea');
  const commentId = form.dataset.commentId;
  const message = textarea.value.trim();

  if (!state.selectedPageId || !state.selectedPostId) {
    showFormError(form, 'กรุณาเลือกเพจและโพสต์ก่อนตอบกลับ');
    return;
  }

  if (!message) {
    showFormError(form, 'กรุณาพิมพ์ข้อความตอบกลับ');
    return;
  }

  clearFormMessages(form);
  setFormLoading(form, true);

  try {
    await request(`/api/comments/${commentId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ pageId: state.selectedPageId, message })
    });

    textarea.value = '';
    showFormSuccess(form, 'ส่งแล้ว ✔');
    showToast('ตอบกลับสำเร็จ');
    await fetchComments({ pageId: state.selectedPageId, postId: state.selectedPostId });
  } catch (error) {
    showFormError(form, error.message || 'ตอบกลับไม่สำเร็จ');
  } finally {
    setFormLoading(form, false);
  }
});

elements.commentsBody.addEventListener('input', (event) => {
  if (!event.target.closest('.reply-form')) return;
  clearFormMessages(event.target.closest('.reply-form'));
});

elements.toastClose.addEventListener('click', hideToast);

async function request(path, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  };

  const response = await fetch(path, config);
  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage = payload?.error?.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์';
    const error = new Error(errorMessage);
    error.details = payload?.error;
    throw error;
  }

  return payload;
}

function setError(message, retry) {
  if (!message) {
    elements.errorBanner.classList.add('hidden');
    elements.errorMessage.textContent = '';
    retryAction = null;
    return;
  }

  elements.errorMessage.textContent = message;
  elements.errorBanner.classList.remove('hidden');
  retryAction = typeof retry === 'function' ? retry : null;
  elements.errorRetry.classList.toggle('hidden', !retryAction);
}

function showToast(message) {
  elements.toastMessage.textContent = message;
  elements.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 3000);
}

function hideToast() {
  elements.toast.classList.add('hidden');
  elements.toastMessage.textContent = '';
  clearTimeout(toastTimer);
}

function getSelectedPage() {
  return state.pages.find((page) => page.id === state.selectedPageId) || null;
}

function getSelectedPost() {
  return state.posts.find((post) => post.id === state.selectedPostId) || null;
}

function formatDateTime(value) {
  if (!value) return '-';
  try {
    return dateFormatter.format(new Date(value));
  } catch (error) {
    return value;
  }
}

function trimMessage(message = '', length = 140) {
  if (message.length <= length) return message;
  return `${message.slice(0, length).trim()}…`;
}

function escapeHTML(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderAvatar(user = {}) {
  const name = user.name || 'ผู้ใช้ Facebook';
  const pictureUrl = user.picture?.data?.url;
  if (pictureUrl) {
    return `<img src="${pictureUrl}" alt="${escapeHTML(name)}" referrerpolicy="no-referrer" />`;
  }

  const initial = name.charAt(0).toUpperCase();
  return `<div class="avatar" aria-hidden="true">${escapeHTML(initial)}</div>`;
}

function renderPages() {
  const { pages } = state;
  const container = elements.pagesContainer;
  elements.pagesRefreshBtn.disabled = state.loading.pages;
  elements.pagesRefreshBtn.textContent = state.loading.pages ? 'กำลังโหลด...' : 'รีเฟรช';

  if (state.loading.pages && pages.length === 0) {
    container.innerHTML = '<div class="empty-state">กำลังโหลดข้อมูลเพจ...</div>';
    return;
  }

  if (!pages.length) {
    container.innerHTML =
      '<div class="empty-state"><p>ยังไม่มีเพจที่อนุมัติสิทธิ์ให้เชื่อมต่อ</p><p class="muted">ตรวจสอบโทเคนของคุณ แล้วกดรีเฟรชอีกครั้ง</p></div>';
    return;
  }

  const items = pages
    .map(
      (page) => `
      <li class="sidebar__item ${page.id === state.selectedPageId ? 'is-active' : ''}">
        <button type="button" data-page-id="${page.id}">
          ${renderAvatar({ name: page.name, picture: { data: { url: page.picture } } })}
          <div>
            <p class="sidebar__item-title">${escapeHTML(page.name || 'Fan Page')}</p>
            <span class="sidebar__item-subtitle">Page ID: ${escapeHTML(page.id)}</span>
          </div>
        </button>
      </li>`
    )
    .join('');

  container.innerHTML = `<ul class="sidebar__list">${items}</ul>`;
  container.querySelectorAll('button[data-page-id]').forEach((button) => {
    button.addEventListener('click', () => handleSelectPage(button.dataset.pageId));
  });
}

function renderPosts() {
  const currentPage = getSelectedPage();
  elements.postsRefreshBtn.disabled = !currentPage || state.loading.posts;
  elements.postsRefreshBtn.textContent = state.loading.posts ? 'กำลังโหลด...' : 'รีเฟรชโพสต์';
  elements.postsTitle.textContent = currentPage ? currentPage.name : 'เลือกเพจก่อน';

  if (!currentPage) {
    elements.postsBody.innerHTML = '<div class="empty-state">เลือกเพจก่อนเพื่อดูโพสต์ล่าสุด</div>';
    return;
  }

  if (state.loading.posts && state.posts.length === 0) {
    elements.postsBody.innerHTML = '<div class="empty-state">กำลังโหลดโพสต์ล่าสุด...</div>';
    return;
  }

  if (!state.posts.length) {
    elements.postsBody.innerHTML = '<div class="empty-state">โพสต์ล่าสุดยังไม่มีคอมเมนต์</div>';
    return;
  }

  const items = state.posts
    .map(
      (post) => `
      <li class="post-card ${post.id === state.selectedPostId ? 'is-active' : ''}">
        <button type="button" data-post-id="${post.id}">
          <p class="post-card__message">
            ${escapeHTML(post.message ? trimMessage(post.message, 160) : 'โพสต์นี้ไม่มีข้อความ')}
          </p>
          <div class="post-card__meta">
            <span>${formatDateTime(post.created_time)}</span>
            ${
              post.permalink_url
                ? `<a href="${post.permalink_url}" target="_blank" rel="noreferrer">เปิดบน Facebook</a>`
                : ''
            }
          </div>
        </button>
      </li>`
    )
    .join('');

  elements.postsBody.innerHTML = `<ul class="post-list">${items}</ul>`;
  elements.postsBody.querySelectorAll('button[data-post-id]').forEach((button) => {
    button.addEventListener('click', () => handleSelectPost(button.dataset.postId));
  });
}

function renderComments() {
  const currentPost = getSelectedPost();
  elements.commentsRefreshBtn.disabled = !currentPost || state.loading.comments;
  elements.commentsRefreshBtn.textContent = state.loading.comments ? 'กำลังโหลด...' : 'รีเฟรชคอมเมนต์';
  elements.commentsTitle.textContent = currentPost ? 'รายละเอียดโพสต์' : 'เลือกโพสต์เพื่อดูคอมเมนต์';

  if (!currentPost) {
    elements.commentsBody.innerHTML = '<div class="empty-state">เลือกโพสต์จากตรงกลางเพื่อดูคอมเมนต์</div>';
    return;
  }

  let content = `
    <article class="post-highlight">
      <p class="post-highlight__message">${escapeHTML(currentPost.message || 'โพสต์นี้ไม่มีข้อความ')}</p>
      <span class="post-highlight__timestamp">${formatDateTime(currentPost.created_time)}</span>
    </article>
  `;

  if (state.loading.comments && state.comments.length === 0) {
    content += '<div class="empty-state">กำลังโหลดคอมเมนต์...</div>';
    elements.commentsBody.innerHTML = content;
    return;
  }

  if (!state.comments.length) {
    content += '<div class="empty-state">ยังไม่มีคอมเมนต์บนโพสต์นี้</div>';
    elements.commentsBody.innerHTML = content;
    return;
  }

  const items = state.comments
    .map(
      (comment) => `
      <li class="comment-card">
        <div class="comment-card__avatar">
          ${renderAvatar(comment.from)}
        </div>
        <div class="comment-card__body">
          <div class="comment-card__meta">
            <div>
              <p class="comment-card__name">${escapeHTML(comment.from?.name || 'ผู้ใช้ Facebook')}</p>
              <span class="comment-card__time">${formatDateTime(comment.created_time)}</span>
            </div>
            ${
              comment.permalink_url
                ? `<a href="${comment.permalink_url}" target="_blank" rel="noreferrer">เปิดโพสต์</a>`
                : ''
            }
          </div>
          <p class="comment-card__message">${escapeHTML(comment.message || '')}</p>
          <form class="reply-form" data-comment-id="${comment.id}">
            <textarea rows="2" placeholder="ตอบกลับคอมเมนต์นี้..."></textarea>
            <div class="reply-form__footer">
              <button type="submit">ตอบกลับ</button>
              <span class="success-text hidden" data-success></span>
              <span class="error-text hidden" data-error></span>
            </div>
          </form>
        </div>
      </li>`
    )
    .join('');

  content += `<ul class="comment-list">${items}</ul>`;
  elements.commentsBody.innerHTML = content;
}

function render() {
  renderPages();
  renderPosts();
  renderComments();
}

function handleSelectPage(pageId) {
  if (state.selectedPageId === pageId) return;
  state.selectedPageId = pageId;
  state.selectedPostId = null;
  state.posts = [];
  state.comments = [];
  render();
  fetchPosts({ pageId });
}

function handleSelectPost(postId) {
  if (state.selectedPostId === postId) return;
  state.selectedPostId = postId;
  state.comments = [];
  render();
  fetchComments({ pageId: state.selectedPageId, postId });
}

function setFormLoading(form, isLoading) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = isLoading;
  button.textContent = isLoading ? 'กำลังส่ง...' : 'ตอบกลับ';
}

function showFormError(form, message) {
  const errorEl = form.querySelector('[data-error]');
  const successEl = form.querySelector('[data-success]');
  if (successEl) {
    successEl.textContent = '';
    successEl.classList.add('hidden');
  }
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
}

function showFormSuccess(form, message) {
  const errorEl = form.querySelector('[data-error]');
  const successEl = form.querySelector('[data-success]');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  if (successEl) {
    successEl.textContent = message;
    successEl.classList.remove('hidden');
    setTimeout(() => {
      successEl.textContent = '';
      successEl.classList.add('hidden');
    }, 2000);
  }
}

function clearFormMessages(form) {
  const errorEl = form.querySelector('[data-error]');
  const successEl = form.querySelector('[data-success]');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  if (successEl) {
    successEl.textContent = '';
    successEl.classList.add('hidden');
  }
}

async function fetchPages({ preserveSelection = true } = {}) {
  state.loading.pages = true;
  setError(null);
  render();

  try {
    const data = await request('/api/pages');
    state.pages = data;

    if (!data.length) {
      state.selectedPageId = null;
      state.selectedPostId = null;
      state.posts = [];
      state.comments = [];
      render();
      return;
    }

    const preferred = preserveSelection ? state.selectedPageId : null;
    const nextPageId =
      preferred && data.some((page) => page.id === preferred) ? preferred : data[0].id;
    const pageChanged = state.selectedPageId !== nextPageId;
    state.selectedPageId = nextPageId;

    if (pageChanged) {
      state.selectedPostId = null;
      state.posts = [];
      state.comments = [];
    }

    render();
    await fetchPosts({ pageId: state.selectedPageId, preserveSelection });
  } catch (error) {
    setError(error.message || 'ไม่สามารถโหลดข้อมูลเพจได้', () =>
      fetchPages({ preserveSelection })
    );
  } finally {
    state.loading.pages = false;
    render();
  }
}

async function fetchPosts({ pageId, preserveSelection = false }) {
  if (!pageId) return;

  state.loading.posts = true;
  setError(null);
  render();

  try {
    const data = await request(`/api/pages/${pageId}/posts`);
    state.posts = data;

    if (!data.length) {
      state.selectedPostId = null;
      state.comments = [];
      render();
      return;
    }

    const preferred = preserveSelection ? state.selectedPostId : null;
    const nextPostId =
      preferred && data.some((post) => post.id === preferred) ? preferred : data[0].id;
    const postChanged = state.selectedPostId !== nextPostId;
    state.selectedPostId = nextPostId;

    if (postChanged) {
      state.comments = [];
    }

    render();
    await fetchComments({ pageId, postId: state.selectedPostId });
  } catch (error) {
    setError(error.message || 'ไม่สามารถโหลดโพสต์ได้', () =>
      fetchPosts({ pageId, preserveSelection })
    );
  } finally {
    state.loading.posts = false;
    render();
  }
}

async function fetchComments({ pageId, postId }) {
  if (!pageId || !postId) return;

  state.loading.comments = true;
  setError(null);
  render();

  try {
    const data = await request(`/api/posts/${postId}/comments?pageId=${pageId}`);
    state.comments = data;
    render();
  } catch (error) {
    setError(error.message || 'ไม่สามารถโหลดคอมเมนต์ได้', () =>
      fetchComments({ pageId, postId })
    );
  } finally {
    state.loading.comments = false;
    render();
  }
}

fetchPages({ preserveSelection: false });
