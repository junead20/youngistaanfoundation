const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');
const authMiddleware = require('../middleware/auth');

// GET /api/community - Get posts
router.get('/', async (req, res) => {
  try {
    const { tag } = req.query;
    let query = tag ? { tags: { $in: [tag] } } : {};
    const posts = await CommunityPost.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, posts });
  } catch (err) {
    res.json({ success: true, posts: [] });
  }
});

// POST /api/community - Create post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, tags, nickname } = req.body;
    const authorId = req.user.userId;
    const post = await CommunityPost.create({ authorId, authorNickname: nickname || 'Anonymous', content, tags: tags || [] });
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/community/:id/upvote - Upvote a post
router.post('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.upvotedBy.includes(userId)) {
      post.upvotedBy = post.upvotedBy.filter(id => id !== userId);
      post.upvotes = Math.max(0, post.upvotes - 1);
    } else {
      post.upvotedBy.push(userId);
      post.upvotes += 1;
    }
    await post.save();
    res.json({ success: true, upvotes: post.upvotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
