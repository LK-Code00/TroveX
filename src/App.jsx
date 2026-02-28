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

// ─── Profile Menu ─────────────────────────────────────────────────────────────
function ProfileMenu({ session, isAdmin, onLogout, onDeleteAccount }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const initials = session.user.email.slice(0, 2).toUpperCase()

  return (
    <div className="profile-wrapper" ref={menuRef}>
      <button className="profile-avatar" onClick={() => setOpen(!open)}>
        {initials}
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="profile-info">
            <div className="profile-info-email">{session.user.email}</div>
            <div className="profile-info-role">
              {isAdmin ? '👑 Administrador' : '👤 Usuário Padrão'}
            </div>
          </div>

          <div className="profile-divider" />

          <button className="profile-item" onClick={() => { onLogout(); setOpen(false) }}>
            🚪 Sair
          </button>

          <button className="profile-item danger" onClick={() => { onDeleteAccount(); setOpen(false) }}>
            🗑 Excluir conta
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Verifica URL válida ───────────────────────────────────────────────────────
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
  const isLink  = isValidUrl(script.content)
  const isOwner = script.created_by === currentUserId

  return (
    <div className="card">
      <div className="card-title">{script.title}</div>
      <pre>{script.content}</pre>
      <div className="card-buttons">
        <button className="copy-btn" onClick={() => onCopy(script.content)}>
          ⎘ Copiar
        </button>
        {isLink && (
          <button className="link-btn" onClick={() => window.open(script.content.trim(), '_blank')}>
            🔗 Abrir
          </button>
        )}
        {isAdmin && isOwner && (
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
  const [session, setSession]   = useState(undefined)
  const [scripts, setScripts]   = useState([])
  const [search, setSearch]     = useState('')
  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [toast, setToast]       = useState({ message: '', visible: false })
  const [loading, setLoading]   = useState(true)
  const [dbError, setDbError]   = useState(null)
  const toastTimer              = useRef(null)
  const h1Ref                   = useRef(null)

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) fetchScripts()
  }, [session])

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
          left: ${e.clientX - 3}px; top: ${e.clientY - 3}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          width: ${4 + Math.random() * 6}px; height: ${4 + Math.random() * 6}px;
          box-shadow: 0 0 6px currentColor;
          --tx: ${Math.cos(angle) * dist}px; --ty: ${Math.sin(angle) * dist}px;
        `
        document.body.appendChild(sp)
        setTimeout(() => sp.remove(), 750)
      }
    }
    h1.addEventListener('click', handleClick)
    return () => h1.removeEventListener('click', handleClick)
  }, [session])

  function showToast(message) {
    clearTimeout(toastTimer.current)
    setToast({ message, visible: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2200)
  }

  const userRole      = session?.user?.user_metadata?.role ?? 'user'
  const isAdmin       = userRole === 'admin'
  const currentUserId = session?.user?.id

  async function handleLogout() {
    await supabaseClient.auth.signOut()
  }

  async function handleDeleteAccount() {
    const confirm = window.confirm('Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.')
    if (!confirm) return
    const { error } = await supabaseClient.rpc('delete_user')
    if (error) {
      showToast('❌ Erro ao excluir conta')
    } else {
      await supabaseClient.auth.signOut()
      showToast('✓ Conta excluída')
    }
  }

  async function fetchScripts() {
    setLoading(true)
    setDbError(null)
    try {
      const { data, error } = await supabaseClient
        .from('scripts').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setScripts(data)
    } catch (err) {
      console.error('Erro ao buscar scripts:', err)
      setDbError('Não foi possível conectar ao banco de dados.')
    } finally {
      setLoading(false)
    }
  }

  async function addScript() {
    if (!isAdmin || !title || !content) return
    const { error } = await supabaseClient
      .from('scripts').insert([{ title, content, created_by: currentUserId }])
    if (!error) {
      setTitle(''); setContent('')
      fetchScripts()
      showToast('✓ Script adicionado!')
    } else {
      showToast('❌ Erro ao adicionar script')
    }
  }

  async function deleteScript(id) {
    const { error } = await supabaseClient.from('scripts').delete().eq('id', id)
    if (!error) { fetchScripts(); showToast('🗑 Script excluído') }
    else showToast('❌ Erro ao excluir script')
  }

  async function copyScript(text) {
    await navigator.clipboard.writeText(text)
    showToast('✓ Copiado!')
  }

  const filtered = scripts.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

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

  return (
    <div className="container">

      {/* Menu de perfil no canto superior direito */}
      <ProfileMenu
        session={session}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />

      <div className="header">
        <h1 ref={h1Ref}>TroveX</h1>
        <p className="header-sub">Seu cofre pessoal de links e scripts</p>
      </div>

      <div className="top-bar">
        <input
          type="text"
          placeholder="🔍  Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
            {dbError}<br /><br />
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
  
