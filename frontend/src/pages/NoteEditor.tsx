import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { notesApi, aiApi } from '../api/api'
import {
  ArrowLeft,
  Sparkles,
  Wand2,
  Tag,
  Loader2,
  Save,
  Pin,
} from 'lucide-react'
import clsx from 'clsx'
import './NoteEditor.css'

interface Note {
  _id: string
  title: string
  content: string
  tags: string[]
  isPinned: boolean
  isArchived: boolean
  aiSummary?: string
}

export default function NoteEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new' || !id

  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isPinned, setIsPinned] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [preview, setPreview] = useState(false)

  const loadNote = useCallback(async () => {
    if (!id || id === 'new') return
    setLoading(true)
    try {
      const data = await notesApi.getOne(id) as Note
      setNote(data)
      setTitle(data.title)
      setContent(data.content)
      setTags(data.tags || [])
      setIsPinned(data.isPinned)
    } catch (_) {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    if (isNew) {
      setNote(null)
      setTitle('')
      setContent('')
      setTags([])
      setIsPinned(false)
      setLoading(false)
    } else {
      loadNote()
    }
  }, [id, isNew, loadNote])

  const saveNote = async () => {
    setSaving(true)
    try {
      if (isNew || !note) {
        const created = await notesApi.create({
          title: title || 'Untitled',
          content,
          tags,
          isPinned,
        }) as Note
        navigate(`/note/${created._id}`, { replace: true })
      } else {
        await notesApi.update(note._id, {
          title: title || 'Untitled',
          content,
          tags,
          isPinned,
        })
        loadNote()
      }
    } catch (_) {}
    setSaving(false)
  }

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    try {
      const result = await aiApi.generate(aiPrompt) as { title: string; content: string }
      setTitle(result.title)
      setContent(result.content)
      setAiPrompt('')
    } catch (_) {}
    setAiLoading(false)
  }

  const handleImprove = async () => {
    setAiLoading(true)
    try {
      const result = await aiApi.improve(title, content) as { title: string; content: string }
      setTitle(result.title)
      setContent(result.content)
    } catch (_) {}
    setAiLoading(false)
  }

  const handleSuggestTags = async () => {
    setAiLoading(true)
    try {
      const result = await aiApi.suggestTags(title, content) as { tags: string[] }
      const newTags = [...new Set([...tags, ...(result.tags || [])])]
      setTags(newTags.slice(0, 10))
    } catch (_) {}
    setAiLoading(false)
  }

  const addTag = (t: string) => {
    if (t && !tags.includes(t)) setTags([...tags, t])
  }

  const removeTag = (t: string) => {
    setTags(tags.filter((x) => x !== t))
  }

  if (loading) {
    return (
      <div className="editor-loading">
        <Loader2 size={32} className="spin" />
      </div>
    )
  }

  return (
    <div className="note-editor">
      <header className="editor-header">
        <button onClick={() => navigate('/')} className="btn-back">
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="editor-actions">
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={clsx('btn-icon', isPinned && 'active')}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={18} />
          </button>
          <button
            onClick={saveNote}
            disabled={saving}
            className="btn-save"
          >
            {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
            Save
          </button>
        </div>
      </header>

      <div className="editor-ai-bar">
        <div className="ai-generate">
          <Sparkles size={18} />
          <input
            type="text"
            placeholder="Describe what you want to write..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={aiLoading || !aiPrompt.trim()}
          >
            {aiLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        <div className="ai-buttons">
          <button
            onClick={handleImprove}
            disabled={aiLoading || (!title && !content)}
            title="Improve grammar & clarity"
          >
            <Wand2 size={16} />
            Improve
          </button>
          <button
            onClick={handleSuggestTags}
            disabled={aiLoading || (!title && !content)}
            title="Suggest tags"
          >
            <Tag size={16} />
            Suggest Tags
          </button>
          <button
            onClick={() => setPreview(!preview)}
            className={clsx(preview && 'active')}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="editor-main">
        <div className="editor-fields">
          <input
            type="text"
            className="editor-title"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="tags-row">
            {tags.map((t) => (
              <span key={t} className="tag-chip">
                {t}
                <button onClick={() => removeTag(t)}>×</button>
              </span>
            ))}
            <input
              type="text"
              placeholder="+ Add tag"
              className="tag-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  const val = (e.target as HTMLInputElement).value.trim()
                  if (val) addTag(val)
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
          </div>
          {preview ? (
            <div className="editor-preview">
              <ReactMarkdown>{content || '*No content yet*'}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              className="editor-content"
              placeholder="Start writing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck
            />
          )}
        </div>
      </div>
    </div>
  )
}
