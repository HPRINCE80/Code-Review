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
