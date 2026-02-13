const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getEmbedding = async (text) => {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding error:', error.message);
    return null;
  }
};

const summarizeNote = async (title, content) => {
  if (!process.env.OPENAI_API_KEY) return '';
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a concise summarizer. Create a 1-2 sentence summary.' },
        { role: 'user', content: `Summarize this note:\n\nTitle: ${title}\n\nContent: ${content.slice(0, 3000)}` },
      ],
      max_tokens: 150,
    });
    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Summarize error:', error.message);
    return '';
  }
};

const suggestTags = async (title, content) => {
  if (!process.env.OPENAI_API_KEY) return [];
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Return only a JSON array of 3-5 relevant tags as single words or short phrases. No other text. Example: ["work","meeting","project-x"]' },
        { role: 'user', content: `Suggest tags for:\n\nTitle: ${title}\n\nContent: ${content.slice(0, 2000)}` },
      ],
      max_tokens: 100,
    });
    const text = response.choices[0]?.message?.content?.trim() || '[]';
    const parsed = JSON.parse(text.replace(/```json?\n?|\n?```/g, '').trim());
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Tags error:', error.message);
    return [];
  }
};

const generateNote = async (prompt) => {
  if (!process.env.OPENAI_API_KEY) {
    return { title: 'Untitled', content: 'Add your OPENAI_API_KEY to enable AI generation.' };
  }
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You help users create notes. Respond with a JSON object: { "title": "Note title", "content": "Note content in markdown" }. Make content detailed and useful.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
    });
    let text = response.choices[0]?.message?.content?.trim() || '{}';
    text = text.replace(/```json?\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(text);
    return {
      title: parsed.title || 'AI Generated Note',
      content: parsed.content || parsed.body || '',
    };
  } catch (error) {
    console.error('Generate error:', error.message);
    return { title: 'Error', content: 'Failed to generate note. Check your API key.' };
  }
};

const improveNote = async (title, content) => {
  if (!process.env.OPENAI_API_KEY) return { title, content };
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Improve the note: fix grammar, enhance clarity, add structure. Respond with JSON: { "title": "...", "content": "..." }. Keep the same meaning.' },
        { role: 'user', content: `Title: ${title}\n\nContent: ${content.slice(0, 4000)}` },
      ],
      max_tokens: 2000,
    });
    let text = response.choices[0]?.message?.content?.trim() || '{}';
    text = text.replace(/```json?\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(text);
    return {
      title: parsed.title || title,
      content: parsed.content || content,
    };
  } catch (error) {
    console.error('Improve error:', error.message);
    return { title, content };
  }
};

const askQuestion = async (question, notes) => {
  if (!process.env.OPENAI_API_KEY) {
    return 'Add your OPENAI_API_KEY to enable AI Q&A on your notes.';
  }
  const context = notes
    .slice(0, 10)
    .map((n) => `[${n.title}]\n${n.content}`)
    .join('\n\n---\n\n');
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Answer based only on the user\'s notes provided. If the answer is not in the notes, say so clearly. Be concise.' },
        { role: 'user', content: `Notes:\n\n${context}\n\n---\n\nQuestion: ${question}` },
      ],
      max_tokens: 500,
    });
    return response.choices[0]?.message?.content?.trim() || 'No answer generated.';
  } catch (error) {
    console.error('Q&A error:', error.message);
    return 'Failed to get answer. Check your API key.';
  }
};

const semanticSearch = (queryEmbedding, notes) => {
  const cosineSimilarity = (a, b) => {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  };
  return notes
    .filter((n) => n.aiEmbedding && n.aiEmbedding.length)
    .map((n) => ({ note: n, score: cosineSimilarity(queryEmbedding, n.aiEmbedding) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.note);
};

module.exports = {
  getEmbedding,
  summarizeNote,
  suggestTags,
  generateNote,
  improveNote,
  askQuestion,
  semanticSearch,
};
