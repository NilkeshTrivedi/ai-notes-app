const Note = require('../models/Note');
const {
  suggestTags,
  generateNote,
  improveNote,
  askQuestion,
  getEmbedding,
  semanticSearch,
} = require('../utils/aiServices');

exports.suggestTags = async (req, res) => {
  try {
    const { title, content } = req.body;
    const tags = await suggestTags(title || '', content || '');
    res.json({ tags });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateNote = async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await generateNote(prompt || 'Create a useful note.');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.improveNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const result = await improveNote(title || '', content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    const notes = await Note.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();
    const answer = await askQuestion(question || '', notes);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.semanticSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json([]);
    }
    const notes = await Note.find({ user: req.user._id }).lean();
    const queryEmbedding = await getEmbedding(q);
    if (!queryEmbedding) {
      const lower = q.toLowerCase();
      const filtered = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(lower) ||
          n.content.toLowerCase().includes(lower) ||
          (n.aiSummary && n.aiSummary.toLowerCase().includes(lower))
      );
      return res.json(filtered.slice(0, 10));
    }
    const results = semanticSearch(queryEmbedding, notes).slice(0, 10);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
