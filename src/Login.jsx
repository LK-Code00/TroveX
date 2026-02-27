import { useState } from 'react'
import { supabaseClient } from './supabase.js'

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET

export default function Login() {
  const [mode, setMode]           = useState('login')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [isAdmin, setIsAdmin]     = useState(false)
  const [error, setError]         = useState(null)
  const [success, setSuccess]     = useState(null)
  const [loading, setLoading]     = useState(false)

  function switchMode(m) {
    setMode(m)
    setError(null)
    setSuccess(null)
    setEmail('')
    setPassword('')
    setAdminCode('')
    setIsAdmin(false)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
    if (error) setError('E-mail ou senha incorretos.')
    setLoading(false)
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (isAdmin && adminCode !== ADMIN_SECRET) {
      setError('Código de administrador inválido.')
      setLoading(false)
      return
    }

    const role = isAdmin ? 'admin' : 'user'

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { role } }
    })

    if (error) {
      setError('Erro ao criar conta. Verifique os dados.')
    } else {
      setSuccess('Conta criada com sucesso!')
      switchMode('login')
    }
    setLoading(false)
  }

  return (
    <div className="auth-bg">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="auth-card">
        <div className="auth-avatar">
          <img src="/icon.png" alt="TroveX" onError={(e) => { e.target.style.display='none' }} />
          <span className="auth-avatar-fallback">TX</span>
        </div>

        <h2 className="auth-title">TroveX</h2>
        <p className="auth-sub">
          {mode === 'login' ? 'Acesse seu cofre' : 'Crie sua conta'}
        </p>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')} type="button">Entrar</button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => switchMode('register')} type="button">Cadastrar</button>
        </div>

        <form className="auth-form" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          <div className="auth-field">
            <span className="auth-field-icon">✉</span>
            <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="auth-field">
            <span className="auth-field-icon">🔒</span>
            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {mode === 'register' && (
            <>
              <label className="auth-checkbox">
                <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
                <span>Registrar como Administrador</span>
              </label>

              {isAdmin && (
                <div className="auth-field">
                  <span className="auth-field-icon">👑</span>
                  <input type="password" placeholder="Código de administrador" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} required={isAdmin} />
                </div>
              )}
            </>
          )}

          {error   && <div className="auth-error">⚠️ {error}</div>}
          {success && <div className="auth-success">✓ {success}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'ENTRAR' : 'CADASTRAR'}
          </button>
        </form>
      </div>
    </div>
  )
    }
        
