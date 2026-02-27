import { useState } from 'react'
import { supabaseClient } from './supabase.js'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-mail ou senha incorretos.')
    }

    setLoading(false)
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <div className="login-icon">🔐</div>
        <h1 className="login-title">TroveX</h1>
        <p className="login-sub">Seu cofre pessoal de links e scripts</p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-field">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error">⚠️ {error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar →'}
          </button>
        </form>

      </div>
    </div>
  )
}
