import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('chama-user')
    const savedToken = localStorage.getItem('chama-token')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const data = await loginUser(email, password)
    localStorage.setItem('chama-token', data.token)
    localStorage.setItem('chama-user', JSON.stringify(data))
    setUser(data)
    return data
  }

  async function signup(name, email, phone, password) {
    const data = await registerUser(name, email, phone, password)
    localStorage.setItem('chama-token', data.token)
    localStorage.setItem('chama-user', JSON.stringify(data))
    setUser(data)
    return data
  }

  function logout() {
    localStorage.removeItem('chama-token')
    localStorage.removeItem('chama-user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider')
  return ctx
}