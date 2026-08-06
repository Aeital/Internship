import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  emp_id: number
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'STAFF'
  sub?: string
  exp?: number
}

interface AuthUser {
  emp_id: number
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'STAFF'
  token: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)
function normalizeRole(role: string): 'ADMIN' | 'HR' | 'MANAGER' | 'STAFF' {
  return (role || '').toUpperCase() as 'ADMIN' | 'HR' | 'MANAGER' | 'STAFF'
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('ems_token')
    if (token) {
      try {
        const payload = jwtDecode<JwtPayload>(token)
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          setUser({ emp_id: payload.emp_id, role: payload.role, token })
        } else {
          localStorage.removeItem('ems_token')
        }
      } catch {
        localStorage.removeItem('ems_token')
      }
    }
  }, [])

  const login = (token: string) => {
    const payload = jwtDecode<JwtPayload>(token)
    localStorage.setItem('ems_token', token)
    setUser({ emp_id: payload.emp_id, role: payload.role, token })
  }

  const logout = () => {
    localStorage.removeItem('ems_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
