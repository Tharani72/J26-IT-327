import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

type AuthMode = 'login' | 'register'

export default function App() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [message, setMessage] = useState('Checking session...')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUserEmail(data.session?.user?.email ?? null)
      setMessage(data.session?.user ? 'You are signed in.' : 'Not signed in.')
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
      setMessage(session?.user ? 'You are signed in.' : 'Not signed in.')
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleAuth = async () => {
    setLoading(true)
    setMessage('Please wait...')

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      setMessage('Registration successful. Check your email if confirmation is enabled.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage('Login successful.')
    setLoading(false)
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Signed out successfully.')
  }

  return (
    <main style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '420px' }}>
      <h1>OmniSign SL</h1>
      <p>{message}</p>

      {userEmail ? (
        <>
          <p>
            Signed in as: <strong>{userEmail}</strong>
          </p>
          <button onClick={handleSignOut} style={buttonStyle}>
            Sign Out
          </button>
        </>
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={() => setMode('login')}
              style={{
                ...buttonStyle,
                marginRight: '8px',
                background: mode === 'login' ? '#2563eb' : '#d1d5db',
                color: mode === 'login' ? '#fff' : '#111',
              }}
            >
              Login
            </button>

            <button
              onClick={() => setMode('register')}
              style={{
                ...buttonStyle,
                background: mode === 'register' ? '#2563eb' : '#d1d5db',
                color: mode === 'register' ? '#fff' : '#111',
              }}
            >
              Register
            </button>
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <button onClick={handleAuth} style={buttonStyle} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </>
      )}
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '12px',
  marginBottom: '12px',
  border: '1px solid #ccc',
  borderRadius: '8px',
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  border: 'none',
  borderRadius: '8px',
  background: '#2563eb',
  color: '#fff',
  cursor: 'pointer',
}