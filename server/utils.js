/**
 * Utility functions for Facebook Comment Manager
 */

/**
 * Format time difference in Thai
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted time difference
 */
function formatTimeAgo(dateString) {
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
  
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Validate Facebook Access Token format
 * @param {string} token - Access token to validate
 * @returns {boolean} - Whether token format is valid
 */
function isValidAccessToken(token) {
  if (!token || typeof token !== 'string') return false;
  
  // Facebook access tokens typically start with EAA and are 100+ characters
  return token.length > 50 && /^[A-Za-z0-9_-]+$/.test(token);
}

/**
 * Validate Facebook Page ID format
 * @param {string} pageId - Page ID to validate
 * @returns {boolean} - Whether page ID format is valid
 */
function isValidPageId(pageId) {
  if (!pageId || typeof pageId !== 'string') return false;
  
  // Facebook Page IDs are numeric strings, typically 15-16 digits
  return /^\d{10,20}$/.test(pageId);
}

/**
 * Sanitize text for safe display
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
function sanitizeText(text) {
  if (!text) return '';
  return text.replace(/[<>]/g, '');
}

/**
 * Rate limiter middleware
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Maximum requests per window
 * @returns {Function} - Express middleware
 */
function createRateLimiter(windowMs = 60000, maxRequests = 100) {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const userRequests = requests.get(ip);
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.'
      });
    }
    
    recentRequests.push(now);
    requests.set(ip, recentRequests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      for (const [key, times] of requests.entries()) {
        const recent = times.filter(time => now - time < windowMs);
        if (recent.length === 0) {
          requests.delete(key);
        } else {
          requests.set(key, recent);
        }
      }
    }
    
    next();
  };
}

module.exports = {
  formatTimeAgo,
  isValidAccessToken,
  isValidPageId,
  sanitizeText,
  createRateLimiter
};
