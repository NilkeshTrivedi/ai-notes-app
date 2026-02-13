import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { notesApi, aiApi } from '../api/api'
import { Pin, MoreVertical, Archive, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import './Notes.css'

interface Note {
  _id: string
  title: string
  content: string
  tags: string[]
  isPinned: boolean
  isArchived: boolean
  aiSummary?: string
  updatedAt: string
}

export default function Notes() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q')
  const tag = searchParams.get('tag')
  const archived = searchParams.get('archived')
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const load = async () => {
      try {
        if (q) {
          const results = await aiApi.search(q) as Note[]
          setNotes(results)
        } else {
          const params: Record<string, string> = { archived: archived === 'true' ? 'true' : 'false' }
          if (tag) params.tag = tag
          const data = await notesApi.getAll(params) as Note[]
          setNotes(data)
        }
      } catch (_) {
        setNotes([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [q, tag, archived])

  const togglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const updated = await notesApi.update(note._id, { isPinned: !note.isPinned }) as Note
      setNotes((prev) =>
        prev.map((n) => (n._id === updated._id ? updated : n))
      )
    } catch (_) {}
    setMenuOpen(null)
  }

  const toggleArchive = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await notesApi.update(note._id, { isArchived: !note.isArchived })
      setNotes((prev) => prev.filter((n) => n._id !== note._id))
    } catch (_) {}
    setMenuOpen(null)
  }

  const deleteNote = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this note?')) return
    try {
      await notesApi.delete(note._id)
      setNotes((prev) => prev.filter((n) => n._id !== note._id))
    } catch (_) {}
    setMenuOpen(null)
  }

  return (
    <div className="notes-page">
      <div className="notes-header">
        <h2>
          {q ? `Search: ${q}` : tag ? `Tag: ${tag}` : archived === 'true' ? 'Archived Notes' : 'All Notes'}
        </h2>
        <Link to="/new" className="btn-new">
          + New Note
        </Link>
      </div>

      {loading ? (
        <div className="notes-loading">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="notes-empty">
          <p>No notes yet. Create your first note!</p>
          <Link to="/new" className="btn-new">Create Note</Link>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <Link
              key={note._id}
              to={`/note/${note._id}`}
              className={clsx('note-card', note.isPinned && 'pinned')}
            >
              <div className="note-card-header">
                <h3>{note.title || 'Untitled'}</h3>
                <div className="note-actions">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      togglePin(note, e)
                    }}
                    className={clsx('btn-icon', note.isPinned && 'active')}
                    title={note.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin size={16} />
                  </button>
                  <div className="dropdown">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setMenuOpen(menuOpen === note._id ? null : note._id)
                      }}
                      className="btn-icon"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {menuOpen === note._id && (
                      <>
                        <div
                          className="dropdown-backdrop"
                          onClick={(e) => {
                            e.preventDefault()
                            setMenuOpen(null)
                          }}
                        />
                        <div className="dropdown-menu">
                          <button onClick={(e) => toggleArchive(note, e)}>
                            <Archive size={14} />
                            {note.isArchived ? 'Unarchive' : 'Archive'}
                          </button>
                          <button
                            onClick={(e) => deleteNote(note, e)}
                            className="danger"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {note.aiSummary && (
                <p className="note-summary">{note.aiSummary}</p>
              )}
              <p className="note-preview">
                {note.content?.slice(0, 150) || 'No content'}
                {note.content && note.content.length > 150 ? '...' : ''}
              </p>
              {note.tags?.length > 0 && (
                <div className="note-tags">
                  {note.tags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
