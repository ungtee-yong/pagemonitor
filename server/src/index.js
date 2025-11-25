const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const facebook = require('./services/facebook');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/pages', async (req, res) => {
  try {
    const pages = await facebook.listPages();
    res.json(pages);
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/api/pages/:pageId/posts', async (req, res) => {
  const { pageId } = req.params;
  const limit = Number(req.query.limit) || 10;

  try {
    const posts = await facebook.getPosts(pageId, { limit });
    res.json(posts);
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/api/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const { pageId } = req.query;
  const limit = Number(req.query.limit) || 50;

  if (!pageId) {
    return res.status(400).json({ error: { message: 'Missing pageId query parameter.' } });
  }

  try {
    const comments = await facebook.getComments({ pageId, postId, limit });
    res.json(comments);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/comments/:commentId/replies', async (req, res) => {
  const { commentId } = req.params;
  const { message, pageId } = req.body;

  if (!pageId) {
    return res.status(400).json({ error: { message: 'Page ID is required to reply.' } });
  }

  if (!message) {
    return res.status(400).json({ error: { message: 'Reply message cannot be empty.' } });
  }

  try {
    const reply = await facebook.replyToComment({ pageId, commentId, message });
    res.status(201).json(reply);
  } catch (error) {
    handleError(res, error);
  }
});

const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

function handleError(res, error) {
  const status = error.status || error.response?.status || 500;
  const payload = {
    message: error.message || 'Unexpected server error'
  };

  if (error.type) payload.type = error.type;
  if (error.code) payload.code = error.code;
  if (error.fbError?.error_user_title) payload.userTitle = error.fbError.error_user_title;
  if (error.fbError?.error_user_msg) payload.userMessage = error.fbError.error_user_msg;

  res.status(status).json({ error: payload });
}
