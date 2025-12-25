"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, UserRole } from "./types"

interface AuthContextType {
  user: User | null
  setUser: (user: User) => void
  setUserRole: (role: UserRole) => void
  isAuthenticated: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Failed to parse saved user:', e)
        localStorage.removeItem('user')
      }
    }
  }, [])

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const setUserRole = (role: UserRole) => {
    // This is for backward compatibility with quick login buttons
    // For actual login, use setUser() directly
    setUser({
      id: 'temp',
      email: `${role.toLowerCase()}@temp.com`,
      nama: role,
      role,
      createdAt: new Date(),
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, setUser, setUserRole, isAuthenticated: !!user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
