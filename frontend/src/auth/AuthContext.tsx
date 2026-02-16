import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import ALLOWED_EMAILS from './allowedEmails'

const CLIENT_ID = '858486898487-gookhqo13cjajiifecuqe3ocuga395gq.apps.googleusercontent.com'

interface User {
  email: string
  name: string
  picture: string
}

interface AuthContextValue {
  user: User | null
  isAllowed: boolean
  login: () => void
  logout: () => void
  ready: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAllowed: false,
  login: () => {},
  logout: () => {},
  ready: false,
})

export function useAuth() {
  return useContext(AuthContext)
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

function checkAllowed(email: string): boolean {
  if (ALLOWED_EMAILS.includes('*')) return true
  return ALLOWED_EMAILS.some((e) => e.toLowerCase() === email.toLowerCase())
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  const handleCredentialResponse = useCallback((response: google.accounts.id.CredentialResponse) => {
    const payload = decodeJwtPayload(response.credential)
    const u: User = {
      email: payload.email as string,
      name: payload.name as string,
      picture: payload.picture as string,
    }
    setUser(u)
    sessionStorage.setItem('chr_user', JSON.stringify(u))
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem('chr_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch { /* ignore */ }
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: true,
      })
      setReady(true)
    }
    document.head.appendChild(script)

    return () => { document.head.removeChild(script) }
  }, [handleCredentialResponse])

  const login = useCallback(() => {
    if (ready) {
      google.accounts.id.prompt()
    }
  }, [ready])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem('chr_user')
    if (ready) {
      google.accounts.id.disableAutoSelect()
    }
  }, [ready])

  const isAllowed = user ? checkAllowed(user.email) : false

  return (
    <AuthContext.Provider value={{ user, isAllowed, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  )
}
