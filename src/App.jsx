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

// ─── Profile Drawer ───────────────────────────────────────────────────────────
function ProfileMenu({ session, isAdmin, onLogout, onDeleteAccount }) {
  const [open, setOpen]       = useState(false)
  const [photo, setPhoto]     = useState(session.user.user_metadata?.avatar_url || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef          = useRef(null)
  const initials              = session.user.email.slice(0, 2).toUpperCase()

  async function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target.result
      const { error } = await supabaseClient.auth.updateUser({
        data: { ...session.user.user_metadata, avatar_url: base64 }
      })
      if (!error) setPhoto(base64)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      {/* Botão hamburguer */}
      <button className="hamburger-btn" onClick={() => setOpen(true)}>
        <span /><span /><span />
      </button>

      {open && <div className="drawer-overlay" onClick={() => setOpen(false)} />}

      <div className={`drawer ${open ? 'open' : ''}`}>

        {/* Header com foto */}
        <div className="drawer-header">
          <div className="drawer-avatar-wrap" onClick={() => fileInputRef.current.click()}>
            {photo
              ? <img src={photo} alt="avatar" className="drawer-avatar-img" />
              : <div className="drawer-avatar-big">{initials}</div>
            }
            <div className="drawer-avatar-overlay">
              {uploading ? '...' : '📷'}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />

          <div className="drawer-user-info">
            <div className="drawer-email">{session.user.email}</div>
            <div className="drawer-role">
              <span className="drawer-role-dot" />
              {isAdmin ? 'Administrador' : 'Usuário Padrão'}
            </div>
            <div className="drawer-photo-hint">Toque na foto para alterar</div>
          </div>

          <button className="drawer-close" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="drawer-divider" />
        <div className="drawer-section-label">CONTA</div>

        <div className="drawer-actions">
          <button className="drawer-item" onClick={() => { onLogout(); setOpen(false) }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sair da conta</span>
          </button>

          <button className="drawer-item danger" onClick={() => { onDeleteAccount(); setOpen(false) }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            <span>Excluir conta</span>
          </button>
        </div>

        <div className="drawer-footer">
          <span>TroveX</span>
          <span>{isAdmin ? 'Admin' : 'Standard'}</span>
        </div>
      </div>
    </>
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

// ─── Tela de Detalhe do Script ────────────────────────────────────────────────
function ScriptDetail({ script, onBack, onDelete, onCopy, isAdmin, currentUserId }) {
  const isLink  = isValidUrl(script.content)
  const isOwner = script.created_by === currentUserId

  return (
    <div className="detail-page">

      {/* Header com botão voltar */}
      <div className="detail-header">
        <button className="detail-back" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Voltar
        </button>
      </div>

      {/* Título */}
      <div className="detail-card">
        <div className="detail-type-badge">
          {isLink ? 'Link' : 'Script'}
        </div>
        <h2 className="detail-title">{script.title}</h2>
        <p className="detail-date">
          {new Date(script.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      {/* Descrição */}
      {script.description && (
        <div className="detail-card">
          <div className="detail-section-label">Descrição</div>
          <p className="detail-description">{script.description}</p>
        </div>
      )}

      {/* Conteúdo */}
      <div className="detail-card">
        <div className="detail-section-label">Conteúdo</div>
        <pre className="detail-pre">{script.content}</pre>
      </div>

      {/* Ações */}
      <div className="detail-actions">
        <button className="detail-btn-copy" onClick={() => onCopy(script.content)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copiar conteúdo
        </button>

        {isLink && (
          <button className="detail-btn-link" onClick={() => window.open(script.content.trim(), '_blank')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Abrir link
          </button>
        )}

        {isAdmin && isOwner && (
          <button className="detail-btn-delete" onClick={() => { onDelete(script.id); onBack() }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
            Excluir
          </button>
        )}
      </div>

    </div>
  )
}

// ─── Card da lista ────────────────────────────────────────────────────────────
function ScriptCard({ script, onClick }) {
  const isLink = isValidUrl(script.content)

  return (
    <div className="card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card-type-tag">{isLink ? 'Link' : 'Script'}</div>
      <div className="card-title">{script.title}</div>
      {script.description && (
        <p className="card-description">{script.description}</p>
      )}
      <pre className="card-preview">{script.content}</pre>
      <div className="card-hint">Toque para ver detalhes →</div>
    </div>
  )
}

// ─── App principal ────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession]       = useState(undefined)
  const [scripts, setScripts]       = useState([])
  const [search, setSearch]         = useState('')
  const [title, setTitle]           = useState('')
  const [content, setContent]       = useState('')
  const [description, setDescription] = useState('')
  const [toast, setToast]           = useState({ message: '', visible: false })
  const [loading, setLoading]       = useState(true)
  const [dbError, setDbError]       = useState(null)
  const [selectedScript, setSelectedScript] = useState(null)
  const toastTimer                  = useRef(null)
  const h1Ref                       = useRef(null)

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
    if (error) showToast('Erro ao excluir conta')
    else { await supabaseClient.auth.signOut(); showToast('Conta excluída') }
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
      .from('scripts')
      .insert([{ title, content, description, created_by: currentUserId }])
    if (!error) {
      setTitle(''); setContent(''); setDescription('')
      fetchScripts()
      showToast('Script adicionado!')
    } else {
      showToast('Erro ao adicionar script')
    }
  }

  async function deleteScript(id) {
    const { error } = await supabaseClient.from('scripts').delete().eq('id', id)
    if (!error) { fetchScripts(); showToast('Script excluído') }
    else showToast('Erro ao excluir script')
  }

  async function copyScript(text) {
    await navigator.clipboard.writeText(text)
    showToast('Copiado!')
  }

  const filtered = scripts.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  if (session === undefined) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <p className="login-sub">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) return <Login />

  // ─── Tela de detalhe ────────────────────────────────────────────────────────
  if (selectedScript) {
    return (
      <>
        <ScriptDetail
          script={selectedScript}
          onBack={() => setSelectedScript(null)}
          onDelete={deleteScript}
          onCopy={copyScript}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
        />
        <Toast message={toast.message} visible={toast.visible} />
      </>
    )
  }

  // ─── Tela principal ──────────────────────────────────────────────────────────
  return (
    <div className="container">
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
            placeholder="Descrição (opcional)"
            value={description}
            rows={2}
            onChange={(e) => setDescription(e.target.value)}
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
            onClick={() => setSelectedScript(script)}
          />
        ))}
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  )
               }
              
