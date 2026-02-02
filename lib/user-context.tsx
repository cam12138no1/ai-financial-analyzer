'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string      // 浏览器 ID
  name: string    // 用户输入的名称
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  setUserName: (name: string) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// 生成浏览器唯一 ID
function getBrowserId(): string {
  if (typeof window === 'undefined') return ''
  
  let browserId = localStorage.getItem('browser_id')
  if (!browserId) {
    browserId = `browser_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('browser_id', browserId)
  }
  return browserId
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 从 localStorage 加载用户信息
    const browserId = getBrowserId()
    const savedName = localStorage.getItem('user_name')
    
    if (savedName) {
      setUser({ id: browserId, name: savedName })
    }
    setIsLoading(false)
  }, [])

  const setUserName = (name: string) => {
    const browserId = getBrowserId()
    localStorage.setItem('user_name', name)
    setUser({ id: browserId, name })
  }

  const logout = () => {
    localStorage.removeItem('user_name')
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, isLoading, setUserName, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
