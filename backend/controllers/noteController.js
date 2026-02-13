const Note = require('../models/Note');
const {
  getEmbedding,
  summarizeNote,
  suggestTags,
} = require('../utils/aiServices');

exports.getNotes = async (req, res) => {
  try {
    const { q, tag, pinned, archived } = req.query;
    const filter = { user: req.user._id };

    if (archived === 'true') filter.isArchived = true;
    else if (archived !== 'all') filter.isArchived = false;

    if (pinned === 'true') filter.isPinned = true;
    if (tag) filter.tags = tag;

    let notes = await Note.find(filter).sort({ isPinned: -1, updatedAt: -1 });

    if (q && q.trim()) {
      const lower = q.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(lower) ||
          n.content.toLowerCase().includes(lower) ||
          (n.aiSummary && n.aiSummary.toLowerCase().includes(lower)) ||
          n.tags.some((t) => t.toLowerCase().includes(lower))
      );
    }

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, content, tags, isPinned, color } = req.body;
    const note = await Note.create({
      user: req.user._id,
      title: title || 'Untitled',
      content: content || '',
      tags: tags || [],
      isPinned: !!isPinned,
      color: color || '#ffffff',
    });

    if (content && (title || content).trim()) {
      const [summary, embedding] = await Promise.all([
        summarizeNote(note.title, note.content),
        getEmbedding(`${note.title} ${note.content}`),
      ]);
      note.aiSummary = summary;
      if (embedding) note.aiEmbedding = embedding;
      await note.save();
    }

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    let note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const { title, content, tags, isPinned, isArchived, color } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (isArchived !== undefined) note.isArchived = isArchived;
    if (color !== undefined) note.color = color;

    const contentChanged = req.body.content !== undefined || req.body.title !== undefined;
    if (contentChanged && (note.title || note.content).trim()) {
      const [summary, embedding] = await Promise.all([
        summarizeNote(note.title, note.content),
        getEmbedding(`${note.title} ${note.content}`),
      ]);
      note.aiSummary = summary;
      if (embedding) note.aiEmbedding = embedding;
    }

    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTags = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id, isArchived: false });
    const tagSet = new Set();
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    res.json([...tagSet].filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
