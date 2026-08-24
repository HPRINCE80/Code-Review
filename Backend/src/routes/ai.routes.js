const express = require('express');
const router = express.Router();
const aiController = require('../controller/ai.controller'); // ✅ at → ai

router.post('/review', aiController.reviewCode);
router.post('/chat', aiController.chatWithAI);

module.exports = router;