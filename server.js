const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const FACEBOOK_GRAPH_API = 'https://graph.facebook.com/v18.0';
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

// Helper function to make Facebook API requests
async function makeFacebookRequest(endpoint, params = {}) {
  try {
    const response = await axios.get(`${FACEBOOK_GRAPH_API}${endpoint}`, {
      params: {
        access_token: ACCESS_TOKEN,
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error('Facebook API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Get all posts from the page
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await makeFacebookRequest(`/${PAGE_ID}/posts`, {
      fields: 'id,message,created_time,permalink_url',
      limit: 50
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch posts',
      details: error.response?.data || error.message 
    });
  }
});

// Get comments for a specific post
app.get('/api/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await makeFacebookRequest(`/${postId}/comments`, {
      fields: 'id,message,created_time,from{id,name,picture},can_comment,comment_count,like_count',
      limit: 100,
      order: 'chronological'
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch comments',
      details: error.response?.data || error.message 
    });
  }
});

// Get all posts with their comments
app.get('/api/posts-with-comments', async (req, res) => {
  try {
    // Get all posts
    const postsData = await makeFacebookRequest(`/${PAGE_ID}/posts`, {
      fields: 'id,message,created_time,permalink_url,comments.summary(true)',
      limit: 50
    });

    const posts = postsData.data || [];
    
    // Filter posts that have comments
    const postsWithComments = posts.filter(post => 
      post.comments && post.comments.summary && post.comments.summary.total_count > 0
    );

    // Fetch detailed comments for each post
    const postsWithDetailedComments = await Promise.all(
      postsWithComments.map(async (post) => {
        try {
          const commentsData = await makeFacebookRequest(`/${post.id}/comments`, {
            fields: 'id,message,created_time,from{id,name,picture},can_comment,comment_count,like_count',
            limit: 100,
            order: 'chronological'
          });
          
          return {
            ...post,
            comments: commentsData.data || []
          };
        } catch (error) {
          console.error(`Error fetching comments for post ${post.id}:`, error.message);
          return {
            ...post,
            comments: []
          };
        }
      })
    );

    res.json({ data: postsWithDetailedComments });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch posts with comments',
      details: error.response?.data || error.message 
    });
  }
});

// Reply to a comment
app.post('/api/comments/:commentId/replies', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await axios.post(
      `${FACEBOOK_GRAPH_API}/${commentId}/comments`,
      {
        message: message.trim(),
        access_token: ACCESS_TOKEN
      }
    );

    res.json({ 
      success: true, 
      reply: response.data 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to post reply',
      details: error.response?.data || error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Facebook Comments Manager API is running',
    pageId: PAGE_ID ? 'configured' : 'not configured'
  });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Make sure your Facebook Page ID and Access Token are configured in .env`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`Serving React app from client/build`);
  }
});
