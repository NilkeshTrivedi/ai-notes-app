const express = require('express');
const router = express.Router();
const {
  suggestTags,
  generateNote,
  improveNote,
  askQuestion,
  semanticSearch,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/suggest-tags', suggestTags);
router.post('/generate', generateNote);
router.post('/improve', improveNote);
router.post('/ask', askQuestion);
router.get('/search', semanticSearch);

module.exports = router;
