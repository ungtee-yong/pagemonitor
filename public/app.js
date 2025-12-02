// API Base URL
const API_BASE = window.location.origin;

// Global state
let currentCommentId = null;
let allPosts = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    checkServerHealth();
    loadPageInfo();
    loadPosts();
    
    // Add refresh button event listener
    document.getElementById('refresh-btn').addEventListener('click', () => {
        loadPosts();
    });
});

// Check server health and configuration
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE}/api/health`);
        const data = await response.json();
        
        if (data.status === 'not_configured') {
            showStatus('warning', 'กรุณาตั้งค่า Facebook Page ID และ Access Token ในไฟล์ .env');
        }
    } catch (error) {
        showStatus('error', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
}

// Load page information
async function loadPageInfo() {
    try {
        const response = await fetch(`${API_BASE}/api/page-info`);
        const data = await response.json();
        
        if (data.success && data.page) {
            const pageInfoEl = document.getElementById('page-info');
            pageInfoEl.innerHTML = `
                <strong>${data.page.name}</strong>
                ${data.page.fan_count ? ` • ${formatNumber(data.page.fan_count)} แฟนเพจ` : ''}
            `;
        }
    } catch (error) {
        console.error('Error loading page info:', error);
    }
}

// Load posts with comments
async function loadPosts() {
    const loadingEl = document.getElementById('loading');
    const postsContainer = document.getElementById('posts-container');
    
    loadingEl.classList.add('active');
    postsContainer.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE}/api/posts`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to load posts');
        }
        
        allPosts = data.posts || [];
        
        // Update stats
        const totalComments = allPosts.reduce((sum, post) => {
            return sum + (post.comments?.data?.length || 0);
        }, 0);
        
        document.getElementById('total-posts').textContent = allPosts.length;
        document.getElementById('total-comments').textContent = totalComments;
        
        // Render posts
        if (allPosts.length === 0) {
            postsContainer.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <h3>ไม่พบโพสต์ที่มีคอมเมนต์</h3>
                    <p>ลองรีเฟรชอีกครั้งหรือตรวจสอบการตั้งค่า</p>
                </div>
            `;
        } else {
            allPosts.forEach(post => {
                postsContainer.appendChild(createPostCard(post));
            });
        }
        
        showStatus('success', `โหลดข้อมูลสำเร็จ! พบ ${allPosts.length} โพสต์และ ${totalComments} คอมเมนต์`);
        
    } catch (error) {
        console.error('Error loading posts:', error);
        showStatus('error', `เกิดข้อผิดพลาด: ${error.message}`);
        postsContainer.innerHTML = `
            <div class="empty-state">
                <h3>ไม่สามารถโหลดข้อมูลได้</h3>
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        loadingEl.classList.remove('active');
    }
}

// Create post card HTML
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    const comments = post.comments?.data || [];
    const postMessage = post.message || 'โพสต์รูปภาพ';
    
    card.innerHTML = `
        ${post.full_picture ? `
            <img src="${post.full_picture}" alt="Post image" class="post-image">
        ` : ''}
        
        <div class="post-header">
            <div class="post-message">${escapeHtml(postMessage)}</div>
            <div class="post-meta">
                <span class="post-time">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${formatDate(post.created_time)}
                </span>
                <span class="comment-count">${comments.length} คอมเมนต์</span>
            </div>
        </div>
        
        ${post.permalink_url ? `
            <div class="post-link">
                <a href="${post.permalink_url}" target="_blank" rel="noopener noreferrer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    ดูโพสต์ใน Facebook
                </a>
            </div>
        ` : ''}
        
        <div class="comments-section">
            ${comments.map(comment => createCommentHTML(comment)).join('')}
        </div>
    `;
    
    return card;
}

// Create comment HTML
function createCommentHTML(comment) {
    const author = comment.from || { name: 'Unknown User' };
    const avatarUrl = author.picture?.data?.url || 'https://via.placeholder.com/40';
    
    return `
        <div class="comment">
            <img src="${avatarUrl}" alt="${escapeHtml(author.name)}" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(author.name)}</span>
                    <span class="comment-time">${formatDate(comment.created_time)}</span>
                </div>
                <div class="comment-message">${escapeHtml(comment.message || '')}</div>
                ${comment.attachment ? `
                    <div class="comment-attachment">
                        ${comment.attachment.type === 'photo' && comment.attachment.media?.image?.src ? `
                            <img src="${comment.attachment.media.image.src}" alt="Attachment" onclick="window.open('${comment.attachment.media.image.src}', '_blank')">
                        ` : ''}
                    </div>
                ` : ''}
                <div class="comment-actions">
                    <button class="reply-btn" onclick="openReplyModal('${comment.id}', '${escapeHtml(author.name)}', '${escapeHtml(comment.message || '')}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 14 4 9 9 4"></polyline>
                            <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                        </svg>
                        ตอบกลับ
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Open reply modal
function openReplyModal(commentId, authorName, message) {
    currentCommentId = commentId;
    
    const modal = document.getElementById('reply-modal');
    const contentEl = document.getElementById('reply-comment-content');
    const textareaEl = document.getElementById('reply-message');
    
    contentEl.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 8px;">ตอบกลับคอมเมนต์ของ ${authorName}</div>
        <div style="color: var(--text-secondary); font-size: 14px;">${message}</div>
    `;
    
    textareaEl.value = '';
    modal.classList.add('active');
    textareaEl.focus();
}

// Close reply modal
function closeReplyModal() {
    const modal = document.getElementById('reply-modal');
    modal.classList.remove('active');
    currentCommentId = null;
}

// Send reply
async function sendReply() {
    const messageEl = document.getElementById('reply-message');
    const message = messageEl.value.trim();
    
    if (!message) {
        alert('กรุณาพิมพ์ข้อความตอบกลับ');
        return;
    }
    
    if (!currentCommentId) {
        alert('เกิดข้อผิดพลาด: ไม่พบ Comment ID');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/comments/${currentCommentId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to send reply');
        }
        
        showStatus('success', 'ส่งคำตอบสำเร็จ!');
        closeReplyModal();
        
        // Reload posts to show the new reply
        setTimeout(() => {
            loadPosts();
        }, 1000);
        
    } catch (error) {
        console.error('Error sending reply:', error);
        showStatus('error', `ไม่สามารถส่งคำตอบได้: ${error.message}`);
    }
}

// Show status message
function showStatus(type, message) {
    const statusEl = document.getElementById('status-message');
    statusEl.className = `status-message ${type}`;
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 5000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('th-TH', options);
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal when clicking outside
document.getElementById('reply-modal').addEventListener('click', (e) => {
    if (e.target.id === 'reply-modal') {
        closeReplyModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeReplyModal();
    }
});

// Send reply on Ctrl/Cmd + Enter
document.getElementById('reply-message').addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        sendReply();
    }
});
