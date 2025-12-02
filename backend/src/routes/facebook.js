import express from 'express';
import axios from 'axios';

const router = express.Router();
const FB_API_BASE = 'https://graph.facebook.com/v18.0';

// Exchange short-lived token for long-lived token
router.post('/exchange-token', async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    const response = await axios.get(`${FB_API_BASE}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        fb_exchange_token: accessToken
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(400).json({ 
      error: 'Failed to exchange token',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Get user's managed pages
router.get('/pages', async (req, res) => {
  try {
    const { accessToken } = req.query;
    
    const response = await axios.get(`${FB_API_BASE}/me/accounts`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,picture,access_token,category,fan_count'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Get pages error:', error.response?.data || error.message);
    res.status(400).json({ 
      error: 'Failed to get pages',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Get page posts with comments
router.get('/posts/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { accessToken, limit = 25, after } = req.query;
    
    const params = {
      access_token: accessToken,
      fields: 'id,message,created_time,full_picture,permalink_url,shares,reactions.summary(true),comments.summary(true).limit(0)',
      limit
    };
    
    if (after) {
      params.after = after;
    }
    
    const response = await axios.get(`${FB_API_BASE}/${pageId}/posts`, { params });
    
    res.json(response.data);
  } catch (error) {
    console.error('Get posts error:', error.response?.data || error.message);
    res.status(400).json({ 
      error: 'Failed to get posts',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Get comments for a specific post
router.get('/comments/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { accessToken, limit = 50, after } = req.query;
    
    const params = {
      access_token: accessToken,
      fields: 'id,message,created_time,from{id,name,picture},like_count,comment_count,attachment,parent,comments{id,message,created_time,from{id,name,picture},like_count}',
      filter: 'toplevel',
      limit
    };
    
    if (after) {
      params.after = after;
    }
    
    const response = await axios.get(`${FB_API_BASE}/${postId}/comments`, { params });
    
    res.json(response.data);
  } catch (error) {
    console.error('Get comments error:', error.response?.data || error.message);
    res.status(400).json({ 
      error: 'Failed to get comments',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Reply to a comment
router.post('/reply/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { accessToken, message } = req.body;
    
    const response = await axios.post(
      `${FB_API_BASE}/${commentId}/comments`,
      { message },
      {
        params: { access_token: accessToken }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Reply error:', error.response?.data || error.message);
    res.status(400).json({ 
      error: 'Failed to reply to comment',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Like/Unlike a comment
router.post('/like/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { accessToken } = req.body;
    
    const response = await axios.post(
      `${FB_API_BASE}/${commentId}/likes`,
      {},
      {
        params: { access_token: accessToken }
      }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Like error:', error.response?.data || error.message);
    res.status(400).json({ 
      error: 'Failed to like comment',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Delete a comment (only page's own comments)
router.delete('/comment/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { accessToken } = req.query;
    
    const response = await axios.delete(
      `${FB_API_BASE}/${commentId}`,
      {
        params: { access_token: accessToken }
      }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error.response?.data || error.message);
    res.status(400).json({ 
      error: 'Failed to delete comment',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Hide/Unhide a comment
router.post('/hide/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { accessToken, isHidden } = req.body;
    
    const response = await axios.post(
      `${FB_API_BASE}/${commentId}`,
      { is_hidden: isHidden },
      {
        params: { access_token: accessToken }
      }
    );
    
    res.json({ success: true, is_hidden: isHidden });
  } catch (error) {
    console.error('Hide error:', error.response?.data || error.message);
    res.status(400).json({ 
      error: 'Failed to hide/unhide comment',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

export default router;
