import React, { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/api'

interface User {
  _id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      authApi.me()
        .then((data: { _id: string; name: string; email: string }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password) as { token: string; _id: string; name: string; email: string }
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser({ _id: data._id, name: data.name, email: data.email })
  }

  const register = async (name: string, email: string, password: string) => {
    const data = await authApi.register(name, email, password) as { token: string; _id: string; name: string; email: string }
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser({ _id: data._id, name: data.name, email: data.email })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
