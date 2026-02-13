const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  content: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isPinned: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: '#ffffff',
  },
  aiSummary: {
    type: String,
    default: '',
  },
  aiEmbedding: {
    type: [Number],
    default: null,
  },
}, {
  timestamps: true,
});

noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ user: 1, title: 'text', content: 'text' });
noteSchema.index({ user: 1, tags: 1 });

module.exports = mongoose.model('Note', noteSchema);
