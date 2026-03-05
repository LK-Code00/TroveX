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
      <button className="hamburger-btn" onClick={() => setOpen(true)}>
        <span /><span /><span />
      </button>

      {open && <div className="drawer-overlay" onClick={() => setOpen(false)} />}

      <div className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-avatar-wrap" onClick={() => fileInputRef.current.click()}>
            {photo
              ? <img src={photo} alt="avatar" className="drawer-avatar-img" />
              : <div className="drawer-avatar-big">{initials}</div>
            }
            <div className="drawer-avatar-overlay">{uploading ? '...' : '📷'}</div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*"
            style={{ display: 'none' }} onChange={handlePhotoChange} />

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
  try { new URL(text.trim()); return true } catch { return false }
}

// ─── Image Uploader ───────────────────────────────────────────────────────────
function ImageUploader({ value, onChange }) {
  const [urlInput, setUrlInput] = useState(value || '')

  function handleConfirm() {
    if (urlInput.trim()) onChange(urlInput.trim())
  }

  function handleRemove() {
    onChange('')
    setUrlInput('')
  }

  if (value) return (
    <div className="img-uploader-preview">
      <img src={value} alt="preview" onError={e => e.target.style.opacity=0.3} />
      <button className="img-uploader-remove" onClick={handleRemove}>✕ Remover</button>
    </div>
  )

  return (
    <div className="img-uploader-url">
      <input
        className="auth-input"
        placeholder="Cole a URL da imagem (opcional)..."
        value={urlInput}
        onChange={e => setUrlInput(e.target.value)}
      />
      {urlInput.trim() && (
        <button type="button" className="modal-btn-save" onClick={handleConfirm}>
          Confirmar imagem
        </button>
      )}
    </div>
  )
}

// ─── Tela de Detalhe ──────────────────────────────────────────────────────────
function ScriptDetail({ script, onBack, onDelete, onCopy, onEdit, isAdmin, currentUserId }) {
  const isLink  = isValidUrl(script.content)
  const isOwner = script.created_by === currentUserId

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="detail-back" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Voltar
        </button>
        {isAdmin && isOwner && (
          <button className="detail-edit-btn" onClick={() => onEdit(script)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editar
          </button>
        )}
      </div>

      {/* Imagem de capa */}
      {script.image_url && (
        <div className="detail-cover">
          <img src={script.image_url} alt={script.title} />
        </div>
      )}

      <div className="detail-card">
        <div className="detail-type-badge">{isLink ? 'Link' : 'Script'}</div>
        <h2 className="detail-title">{script.title}</h2>
        <p className="detail-date">
          {new Date(script.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      {script.description && (
        <div className="detail-card">
          <div className="detail-section-label">Descrição</div>
          <p className="detail-description">{script.description}</p>
        </div>
      )}

      <div className="detail-card">
        <div className="detail-section-label">Conteúdo</div>
        <pre className="detail-pre">{script.content}</pre>
      </div>

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

// ─── Modal de Edição ──────────────────────────────────────────────────────────
function EditModal({ script, onSave, onClose }) {
  const [title, setTitle]       = useState(script.title)
  const [content, setContent]   = useState(script.content)
  const [description, setDescription] = useState(script.description || '')
  const [imageUrl, setImageUrl] = useState(script.image_url || '')
  const [saving, setSaving]     = useState(false)

  async function handleSave() {
    if (!title || !content) return
    setSaving(true)
    await onSave(script.id, { title, content, description, image_url: imageUrl })
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Editar</h3>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <label className="modal-label">Título</label>
          <input className="auth-input" value={title}
            onChange={e => setTitle(e.target.value)} placeholder="Título" />

          <label className="modal-label">Descrição</label>
          <textarea className="auth-input modal-textarea" value={description}
            onChange={e => setDescription(e.target.value)} placeholder="Descrição (opcional)" rows={2} />

          <label className="modal-label">Conteúdo ou link</label>
          <textarea className="auth-input modal-textarea" value={content}
            onChange={e => setContent(e.target.value)} placeholder="Conteúdo ou link" rows={3} />

          <label className="modal-label">Imagem (opcional)</label>
          <ImageUploader value={imageUrl} onChange={setImageUrl} />
        </div>

        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="modal-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Card da lista ────────────────────────────────────────────────────────────
function ScriptCard({ script, onClick }) {
  const isLink = isValidUrl(script.content)

  return (
    <div className="card" onClick={onClick}>
      {script.image_url && (
        <div className="card-image">
          <img src={script.image_url} alt={script.title}
            onError={e => e.target.parentElement.style.display='none'} />
        </div>
      )}
      <div className="card-body">
        <div className="card-type-tag">{isLink ? 'Link' : 'Script'}</div>
        <div className="card-title">{script.title}</div>
        {script.description && (
          <p className="card-description">{script.description}</p>
        )}
        <div className="card-hint">Toque para ver detalhes →</div>
      </div>
    </div>
  )
}

// ─── App principal ────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession]           = useState(undefined)
  const [scripts, setScripts]           = useState([])
  const [search, setSearch]             = useState('')
  const [title, setTitle]               = useState('')
  const [content, setContent]           = useState('')
  const [description, setDescription]   = useState('')
  const [imageUrl, setImageUrl]         = useState('')
  const [toast, setToast]               = useState({ message: '', visible: false })
  const [loading, setLoading]           = useState(true)
  const [dbError, setDbError]           = useState(null)
  const [selectedScript, setSelectedScript] = useState(null)
  const [editingScript, setEditingScript]   = useState(null)
  const [addFormOpen, setAddFormOpen]       = useState(false)
  const toastTimer = useRef(null)
  const h1Ref      = useRef(null)

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setSession(null)
      } else {
        setSession(session)
      }
    })

    const handleVisibility = async () => {
      if (document.visibilityState === 'visible') {
        const { data } = await supabaseClient.auth.getSession()
        if (!data.session) {
          await supabaseClient.auth.signOut()
        } else {
          await supabaseClient.auth.refreshSession()
          setSession(data.session)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const handleOnline = () => fetchScripts()
    window.addEventListener('online', handleOnline)

    return () => {
      listener.subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  useEffect(() => { if (session) fetchScripts() }, [session])

  useEffect(() => {
    const h1 = h1Ref.current
    if (!h1) return
    const colors = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#facc15']
    const handleClick = (e) => {
      h1.classList.remove('clicked'); void h1.offsetWidth; h1.classList.add('clicked')
      setTimeout(() => h1.classList.remove('clicked'), 600)
      for (let i = 0; i < 18; i++) {
        const sp = document.createElement('span')
        sp.className = 'sparkle'
        const angle = Math.random() * 2 * Math.PI
        const dist  = 50 + Math.random() * 90
        sp.style.cssText = `
          left:${e.clientX-3}px;top:${e.clientY-3}px;
          background:${colors[Math.floor(Math.random()*colors.length)]};
          width:${4+Math.random()*6}px;height:${4+Math.random()*6}px;
          box-shadow:0 0 6px currentColor;
          --tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;`
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
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200)
  }

  const userRole      = session?.user?.user_metadata?.role ?? 'user'
  const isAdmin       = userRole === 'admin'
  const currentUserId = session?.user?.id

  async function handleLogout() {
    try {
      await supabaseClient.auth.signOut()
    } catch {
      setSession(null)
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Tem certeza? Essa ação não pode ser desfeita.')) return
    const { error } = await supabaseClient.rpc('delete_user')
    if (error) showToast('Erro ao excluir conta')
    else { await supabaseClient.auth.signOut(); showToast('Conta excluída') }
  }



  async function addScript() {
    if (!isAdmin || !title || !content) return
    const { error } = await supabaseClient.from('scripts')
      .insert([{ title, content, description, image_url: imageUrl, created_by: currentUserId }])
    if (!error) {
      setTitle(''); setContent(''); setDescription(''); setImageUrl('')
      setAddFormOpen(false)
      fetchScripts(); showToast('Script adicionado!')
    } else {
      showToast('Erro ao adicionar script')
    }
  }
async function fetchScripts() {
  setLoading(true)
  setDbError(null)

  try {
    const { data: { session: currentSession } } = await supabaseClient.auth.getSession()

    if (!currentSession) {
      await supabaseClient.auth.signOut()
      return
    }

    const { data, error } = await supabaseClient
      .from('scripts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      if (error.message?.includes('JWT') || error.code === 'PGRST301') {
        await supabaseClient.auth.signOut()
        return
      }
      throw error
    }

    const scriptsData = data || []
    setScripts(scriptsData)

    if (selectedScript) {
      const stillExists = scriptsData.find(s => s.id === selectedScript.id)
      if (!stillExists) {
        setSelectedScript(null)
      }
    }

  } catch (err) {
    setDbError(err?.message || JSON.stringify(err) || 'Erro desconhecido')
  } finally {
    setLoading(false)
  }
}
  async function updateScript(id, data) {
    const { error } = await supabaseClient.from('scripts').update(data).eq('id', id)
    if (!error) {
      fetchScripts(); showToast('Script atualizado!')
      if (selectedScript?.id === id) setSelectedScript(prev => ({ ...prev, ...data }))
    } else showToast('Erro ao atualizar script')
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

  const filtered = scripts.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  if (session === undefined) return (
    <div className="login-wrapper">
      <div className="login-card"><p className="login-sub">Carregando...</p></div>
    </div>
  )

  if (!session) return <Login />

  // Tela de detalhe
  if (selectedScript) return (
    <>
      <ScriptDetail
        script={selectedScript}
        onBack={() => setSelectedScript(null)}
        onDelete={deleteScript}
        onCopy={copyScript}
        onEdit={setEditingScript}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
      />
      {editingScript && (
        <EditModal
          script={editingScript}
          onSave={updateScript}
          onClose={() => setEditingScript(null)}
        />
      )}
      <Toast message={toast.message} visible={toast.visible} />
    </>
  )

  // Tela principal
  return (
    <div className="container">
      <ProfileMenu session={session} isAdmin={isAdmin}
        onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />

      <div className="header">
        <h1 ref={h1Ref}>TroveX</h1>
        <p className="header-sub">Seu cofre pessoal de links e scripts</p>
      </div>

      <div className="top-bar">
        <input type="text" placeholder="🔍  Pesquisar..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isAdmin && (
        <div className="add-form-wrapper">
          {!addFormOpen ? (
            <button className="add-form-toggle" onClick={() => setAddFormOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Adicionar script ou link
            </button>
          ) : (
            <div className="add-form-expanded">
              <div className="add-form-header">
                <span className="add-form-title">Novo item</span>
                <button className="drawer-close" onClick={() => setAddFormOpen(false)}>✕</button>
              </div>
              <input type="text" placeholder="Título"
                value={title} onChange={e => setTitle(e.target.value)} />
              <textarea placeholder="Descrição (opcional)" value={description}
                rows={2} onChange={e => setDescription(e.target.value)} />
              <textarea placeholder="Conteúdo ou link" value={content}
                rows={3} onChange={e => setContent(e.target.value)} />
              <ImageUploader value={imageUrl} onChange={setImageUrl} />
              <button onClick={addScript}>＋ Adicionar</button>
            </div>
          )}
        </div>
      )}

      <div className="section-label">
        Scripts salvos
        {!loading && <span className="count-badge">{filtered.length}</span>}
      </div>

      <div className="grid">
        {loading && <div className="empty-state"><span className="icon">⏳</span>Carregando scripts...</div>}
        {!loading && dbError && (
          <div className="empty-state">
            <span className="icon">⚠️</span>{dbError}<br /><br />
            <button onClick={fetchScripts}>Tentar novamente</button>
          </div>
        )}
        {!loading && !dbError && filtered.length === 0 && (
          <div className="empty-state">
            <span className="icon">📭</span>Nenhum script encontrado.
            {isAdmin && <><br />Adicione seu primeiro script acima!</>}
          </div>
        )}
        {!loading && !dbError && filtered.map(script => (
          <ScriptCard key={script.id} script={script}
            onClick={() => setSelectedScript(script)} />
        ))}
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  )
}
