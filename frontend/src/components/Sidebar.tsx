import { NavLink, useNavigate } from 'react-router-dom'
import { Plus, StickyNote, Archive, Tag, Sparkles, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { notesApi, aiApi } from '../api/api'
import clsx from 'clsx'
import './Sidebar.css'

export default function Sidebar() {
  const navigate = useNavigate()
  const [tags, setTags] = useState<string[]>([])
  const [aiOpen, setAiOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    notesApi.getTags().then((t) => setTags(t as string[])).catch(() => {})
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleAsk = async () => {
    if (!aiQuestion.trim()) return
    setLoading(true)
    setAiAnswer('')
    try {
      const res = await aiApi.ask(aiQuestion) as { answer: string }
      setAiAnswer(res.answer)
    } catch (_) {
      setAiAnswer('Failed to get answer.')
    }
    setLoading(false)
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => clsx('nav-link', isActive && 'active')}>
          <StickyNote size={20} />
          <span>All Notes</span>
        </NavLink>
        <NavLink to="/new" className={({ isActive }) => clsx('nav-link', 'nav-new', isActive && 'active')}>
          <Plus size={20} />
          <span>New Note</span>
        </NavLink>
        <NavLink to="/?archived=true" className={({ isActive }) => clsx('nav-link', isActive && 'active')}>
          <Archive size={20} />
          <span>Archived</span>
        </NavLink>
      </nav>

      <div className="sidebar-section">
        <div className="sidebar-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Smart search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={loading} className="btn-search">
            Search
          </button>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="sidebar-section">
          <h3 className="section-title">
            <Tag size={16} />
            Tags
          </h3>
          <div className="tag-list">
            {tags.map((tag) => (
              <NavLink
                key={tag}
                to={`/?tag=${encodeURIComponent(tag)}`}
                className={({ isActive }) => clsx('tag-link', isActive && 'active')}
              >
                {tag}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      <div className="sidebar-section">
        <button className="section-toggle" onClick={() => setAiOpen(!aiOpen)}>
          <Sparkles size={16} />
          <span>AI Assistant</span>
        </button>
        {aiOpen && (
          <div className="ai-panel">
            <p className="ai-hint">Ask questions about your notes</p>
            <textarea
              placeholder="e.g., What did I note about project X?"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              rows={2}
            />
            <button onClick={handleAsk} disabled={loading || !aiQuestion.trim()}>
              {loading ? 'Thinking...' : 'Ask AI'}
            </button>
            {aiAnswer && (
              <div className="ai-answer">
                {aiAnswer}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
