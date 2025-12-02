const express = require('express');
const { getPagePosts, getPostComments, replyToComment } = require('./facebookClient');

const router = express.Router();

router.get('/posts', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit ?? '10', 10);
    const posts = await getPagePosts({ limit });
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

router.get('/posts/:postId/comments', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit ?? '25', 10);
    const { after } = req.query;
    const data = await getPostComments(req.params.postId, { limit, after });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/comments/:commentId/reply', async (req, res, next) => {
  try {
    const { message } = req.body;
    const reply = await replyToComment(req.params.commentId, message);
    res.status(201).json(reply);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
