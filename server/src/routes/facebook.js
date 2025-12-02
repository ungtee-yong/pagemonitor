const express = require('express');
const router = express.Router();
const facebookService = require('../services/facebookService');

router.get('/posts', async (req, res) => {
  try {
    const { limit, after, since, until } = req.query;
    const payload = await facebookService.getPosts({
      limit: limit ? Number(limit) : undefined,
      after,
      since,
      until,
    });
    res.json(payload);
  } catch (error) {
    console.error('[facebook:getPosts]', error);
    res.status(error.status || 500).json({
      message: 'ไม่สามารถดึงโพสต์ได้',
      detail: error.message,
    });
  }
});

router.post('/comments/:commentId/reply', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { message } = req.body;
    const response = await facebookService.replyToComment(commentId, message);
    res.json(response);
  } catch (error) {
    console.error('[facebook:reply]', error);
    res.status(error.status || 500).json({
      message: 'ตอบกลับคอมเมนต์ไม่สำเร็จ',
      detail: error.message,
    });
  }
});

module.exports = router;
