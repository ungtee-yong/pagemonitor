const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Facebook Graph API Base URL
const FB_GRAPH_URL = 'https://graph.facebook.com/v18.0';
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

// Helper function to make Facebook API requests
async function facebookAPIRequest(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${FB_GRAPH_URL}${endpoint}`,
      params: {
        access_token: ACCESS_TOKEN
      }
    };

    if (data && method !== 'GET') {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Facebook API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Get posts with comments
app.get('/api/posts', async (req, res) => {
  try {
    const limit = req.query.limit || 25;
    
    // Fetch posts from the page
    const posts = await facebookAPIRequest(
      `/${PAGE_ID}/posts?fields=id,message,created_time,full_picture,permalink_url,comments.limit(100){id,message,created_time,from{id,name,picture},attachment,can_reply_privately}&limit=${limit}`
    );

    // Filter posts that have comments
    const postsWithComments = posts.data.filter(post => post.comments && post.comments.data.length > 0);

    res.json({
      success: true,
      posts: postsWithComments,
      count: postsWithComments.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// Get comments for a specific post
app.get('/api/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const limit = req.query.limit || 100;
    
    const comments = await facebookAPIRequest(
      `/${postId}/comments?fields=id,message,created_time,from{id,name,picture},attachment,can_reply_privately&limit=${limit}&order=reverse_chronological`
    );

    res.json({
      success: true,
      comments: comments.data,
      paging: comments.paging
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// Reply to a comment
app.post('/api/comments/:commentId/reply', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const result = await facebookAPIRequest(
      `/${commentId}/comments`,
      'POST',
      { message: message.trim() }
    );

    res.json({
      success: true,
      commentId: result.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// Get page information
app.get('/api/page-info', async (req, res) => {
  try {
    const pageInfo = await facebookAPIRequest(
      `/${PAGE_ID}?fields=id,name,picture,fan_count,followers_count`
    );

    res.json({
      success: true,
      page: pageInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const isConfigured = !!(PAGE_ID && ACCESS_TOKEN && PAGE_ID !== 'your_page_id_here');
  
  res.json({
    success: true,
    status: isConfigured ? 'ready' : 'not_configured',
    message: isConfigured 
      ? 'Server is running and configured' 
      : 'Please configure FACEBOOK_PAGE_ID and FACEBOOK_ACCESS_TOKEN in .env file'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API configured: ${!!(PAGE_ID && ACCESS_TOKEN && PAGE_ID !== 'your_page_id_here')}`);
});
