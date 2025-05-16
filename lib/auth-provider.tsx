"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { findUser, getUserById, type User as UserType } from "@/lib/users"
import { NotificationProvider } from "@/components/notifications/notification-provider"

type AuthContextType = {
  user: UserType | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for stored user on mount
    const storedUserId = localStorage.getItem("userId")
    if (storedUserId) {
      const foundUser = getUserById(storedUserId)
      if (foundUser) {
        setUser(foundUser)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Protect routes
    if (!isLoading) {
      const publicPaths = ["/", "/login"]
      const isPublicPath = publicPaths.includes(pathname)

      if (!user && !isPublicPath) {
        router.push("/")
      }

      if (user && isPublicPath) {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Authenticate user
    const foundUser = findUser(username, password)

    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("userId", foundUser.id)
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("userId")
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      <NotificationProvider>{children}</NotificationProvider>
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
