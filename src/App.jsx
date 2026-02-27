import { useState, useEffect, useRef } from 'react'
import { supabaseClient } from './supabase.js'
import Login from './Login.jsx'

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, visible }) {
  return (
    <div className={`toast ${visible ? 'show' : ''}`}>
      {message}
    </div>
  )
}

// ─── Verifica se o conteúdo é um URL válido ───────────────────────────────────
function isValidUrl(text) {
  try {
    new URL(text.trim())
    return true
  } catch {
    return false
  }
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function ScriptCard({ script, onDelete, onCopy, isAdmin, currentUserId }) {
  const isLink    = isValidUrl(script.content)
  const isOwner   = script.created_by === currentUserId
  const canDelete = isAdmin && isOwner

  return (
    <div className="card">
      <div className="card-title">{script.title}</div>
      <pre>{script.content}</pre>
      <div className="card-buttons">
        <button className="copy-btn" onClick={() => onCopy(script.content)}>
          ⎘ Copiar
        </button>
        {isLink && (
          <button
            className="link-btn"
            onClick={() => window.open(script.content.trim(), '_blank')}
          >
            🔗 Abrir
          </button>
        )}
        {canDelete && (
          <button className="delete" onClick={() => onDelete(script.id)}>
            🗑 Excluir
          </button>
        )}
      </div>
    </div>
  )
}

// ─── App principal ────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession]   = useState(undefined) // undefined = carregando, null = não logado
  const [scripts, setScripts]   = useState([])
  const [search, setSearch]     = useState('')
  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [toast, setToast]       = useState({ message: '', visible: false })
  const [loading, setLoading]   = useState(true)
  const [dbError, setDbError]   = useState(null)
  const toastTimer              = useRef(null)
  const h1Ref                   = useRef(null)

  // ─── Escuta mudanças de autenticação ─────────────────────────────────────────
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // ─── Busca scripts quando loga ───────────────────────────────────────────────
  useEffect(() => {
    if (session) fetchScripts()
  }, [session])

  // ─── Sparkle no h1 ───────────────────────────────────────────────────────────
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
        const sp    = document.createElement('span')
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
  }, [session])

  // ─── Toast helper ─────────────────────────────────────────────────────────────
  function showToast(message) {
    clearTimeout(toastTimer.current)
    setToast({ message, visible: true })
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }))
    }, 2200)
  }

  // ─── Permissões ───────────────────────────────────────────────────────────────
  const userRole    = session?.user?.user_metadata?.role ?? 'user'
  const isAdmin     = userRole === 'admin'
  const currentUserId = session?.user?.id

  // ─── Logout ───────────────────────────────────────────────────────────────────
  async function handleLogout() {
    await supabaseClient.auth.signOut()
  }

  // ─── Supabase: buscar ─────────────────────────────────────────────────────────
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

  // ─── Supabase: adicionar ──────────────────────────────────────────────────────
  async function addScript() {
    if (!isAdmin || !title || !content) return

    const { error } = await supabaseClient
      .from('scripts')
      .insert([{ title, content, created_by: currentUserId }])

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

  // ─── Supabase: deletar ────────────────────────────────────────────────────────
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

  // ─── Copiar ───────────────────────────────────────────────────────────────────
  async function copyScript(text) {
    await navigator.clipboard.writeText(text)
    showToast('✓ Copiado!')
  }

  const filtered = scripts.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  // ─── Estados de carregamento inicial ─────────────────────────────────────────
  if (session === undefined) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-icon">⏳</div>
          <p className="login-sub">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) return <Login />

  // ─── Render principal ─────────────────────────────────────────────────────────
  return (
    <div className="container">

      <div className="header">
        <h1 ref={h1Ref}>TroveX</h1>
        <p className="header-sub">Seu cofre pessoal de links e scripts</p>
        <div className="user-bar">
          <span className="user-role-badge">
            {isAdmin ? '👑 Admin' : '👤 Usuário'}
          </span>
          <span className="user-email">{session.user.email}</span>
          <button className="logout-btn" onClick={handleLogout}>Sair</button>
        </div>
      </div>

      <div className="top-bar">
        <input
          type="text"
          placeholder="🔍  Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Formulário só para admins */}
      {isAdmin && (
        <div className="top-bar">
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Conteúdo ou link"
            value={content}
            rows={3}
            onChange={(e) => setContent(e.target.value)}
          />
          <button onClick={addScript}>＋ Adicionar</button>
        </div>
      )}

      <div className="section-label">
        Scripts salvos
        {!loading && <span className="count-badge">{filtered.length}</span>}
      </div>

      <div className="grid">
        {loading && (
          <div className="empty-state">
            <span className="icon">⏳</span>
            Carregando scripts...
          </div>
        )}

        {!loading && dbError && (
          <div className="empty-state">
            <span className="icon">⚠️</span>
            {dbError}
            <br /><br />
            <button onClick={fetchScripts}>Tentar novamente</button>
          </div>
        )}

        {!loading && !dbError && filtered.length === 0 && (
          <div className="empty-state">
            <span className="icon">📭</span>
            Nenhum script encontrado.
            {isAdmin && <><br />Adicione seu primeiro script acima!</>}
          </div>
        )}

        {!loading && !dbError && filtered.map((script) => (
          <ScriptCard
            key={script.id}
            script={script}
            onDelete={deleteScript}
            onCopy={copyScript}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      <Toast message={toast.message} visible={toast.visible} />

    </div>
  )
      }
