const aiService = require('../services/ai.service.js');

module.exports.reviewCode = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).send({ error: 'Code is required' });
  }

  try {
    const review = await aiService(code);
    return res.send({ review });
  } catch (error) {
    console.error('AI review error:', error);
    return res.status(500).send({ error: 'Failed to generate review' });
  }
};

module.exports.chatWithAI = async (req, res) => {
  const { message, code, language } = req.body;

  if (!message) {
    return res.status(400).send({ error: 'Message is required' });
  }

  try {
    const reply = await aiService.generateChatReply(message, code, language);
    return res.send({ reply });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).send({ error: 'Failed to get AI response' });
  }
};