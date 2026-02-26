import { useState, useEffect, useRef } from 'react'
import { supabaseClient } from './supabase.js'

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, visible }) {
  return (
    <div className={`toast ${visible ? 'show' : ''}`}>
      {message}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function ScriptCard({ script, onDelete, onCopy }) {
  return (
    <div className="card">
      <div className="card-title">{script.title}</div>
      <pre>{script.content}</pre>
      <div className="card-buttons">
        <button className="copy-btn" onClick={() => onCopy(script.content)}>
          ⎘ Copiar
        </button>
        <button className="delete" onClick={() => onDelete(script.id)}>
          🗑 Excluir
        </button>
      </div>
    </div>
  )
}

// ─── App principal ────────────────────────────────────────────────────────────
export default function App() {
  const [scripts, setScripts] = useState([])
  const [search, setSearch]   = useState('')
  const [title, setTitle]     = useState('')
  const [content, setContent] = useState('')
  const [toast, setToast]     = useState({ message: '', visible: false })
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState(null)
  const toastTimer            = useRef(null)
  const h1Ref                 = useRef(null)

  useEffect(() => {
    fetchScripts()
  }, [])

  // ─── Sparkle no h1 ──────────────────────────────────────────────────────────
  useEffect(() => {
    const h1 = h1Ref.current
    if (!h1) return

    const colors = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#facc15']

    const handleClick = (e) => {
      h1.classList.remove('clicked')
      void h1.offsetWidth
      h1.classList.add('clicked')
      setTimeout(() => h1.classList.remove('clicked'), 600)

      for (let i = 0; i < 18; i++) {
        const sp = document.createElement('span')
        sp.className = 'sparkle'
        const angle = Math.random() * 2 * Math.PI
        const dist  = 50 + Math.random() * 90
        sp.style.cssText = `
          left: ${e.clientX - 3}px;
          top:  ${e.clientY - 3}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          width:  ${4 + Math.random() * 6}px;
          height: ${4 + Math.random() * 6}px;
          box-shadow: 0 0 6px currentColor;
          --tx: ${Math.cos(angle) * dist}px;
          --ty: ${Math.sin(angle) * dist}px;
        `
        document.body.appendChild(sp)
        setTimeout(() => sp.remove(), 750)
      }
    }

    h1.addEventListener('click', handleClick)
    return () => h1.removeEventListener('click', handleClick)
  }, [])

  // ─── Toast helper ────────────────────────────────────────────────────────────
  function showToast(message) {
    clearTimeout(toastTimer.current)
    setToast({ message, visible: true })
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }))
    }, 2200)
  }

  // ─── Supabase: buscar ────────────────────────────────────────────────────────
  async function fetchScripts() {
    setLoading(true)
    setDbError(null)

    try {
      const { data, error } = await supabaseClient
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setScripts(data)
    } catch (err) {
      console.error('Erro ao buscar scripts:', err)
      setDbError('Não foi possível conectar ao banco de dados.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Supabase: adicionar ─────────────────────────────────────────────────────
  async function addScript() {
    if (!title || !content) return

    const { error } = await supabaseClient
      .from('scripts')
      .insert([{ title, content }])

    if (!error) {
      setTitle('')
      setContent('')
      fetchScripts()
      showToast('✓ Script adicionado!')
    } else {
      console.error('Erro ao adicionar:', error)
      showToast('❌ Erro ao adicionar script')
    }
  }

  // ─── Supabase: deletar ───────────────────────────────────────────────────────
  async function deleteScript(id) {
    const { error } = await supabaseClient
      .from('scripts')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchScripts()
      showToast('🗑 Script excluído')
    } else {
      console.error('Erro ao deletar:', error)
      showToast('❌ Erro ao excluir script')
    }
  }

  // ─── Copiar ──────────────────────────────────────────────────────────────────
  async function copyScript(text) {
    await navigator.clipboard.writeText(text)
    showToast('✓ Copiado!')
  }

  const filtered = scripts.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="container">

      <div className="header">
        <h1 ref={h1Ref}>Script Manager</h1>
        <p className="header-sub">Gerencie e organize seus scripts com facilidade</p>
      </div>

      <div className="top-bar">
        <input
          type="text"
          placeholder="🔍  Pesquisar scripts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="top-bar">
        <input
          type="text"
          placeholder="Título do Script"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Conteúdo do Script"
          value={content}
          rows={3}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={addScript}>＋ Adicionar</button>
      </div>

      <div className="section-label">
        Scripts salvos
        {!loading && <span className="count-badge">{filtered.length}</span>}
      </div>

      <div className="grid">
        {/* Estado de carregando */}
        {loading && (
          <div className="empty-state">
            <span className="icon">⏳</span>
            Carregando scripts...
          </div>
        )}

        {/* Estado de erro */}
        {!loading && dbError && (
          <div className="empty-state">
            <span className="icon">⚠️</span>
            {dbError}
            <br /><br />
            <button onClick={fetchScripts}>Tentar novamente</button>
          </div>
        )}

        {/* Estado vazio */}
        {!loading && !dbError && filtered.length === 0 && (
          <div className="empty-state">
            <span className="icon">📭</span>
            Nenhum script encontrado.<br />Adicione seu primeiro script acima!
          </div>
        )}

        {/* Lista de scripts */}
        {!loading && !dbError && filtered.map((script) => (
          <ScriptCard
            key={script.id}
            script={script}
            onDelete={deleteScript}
            onCopy={copyScript}
          />
        ))}
      </div>

      <Toast message={toast.message} visible={toast.visible} />

    </div>
  )
    }
        
