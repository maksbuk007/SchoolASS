"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { Toaster } from "sonner"
import { toast } from "sonner"
import { Bell } from "lucide-react"
import { showNotification } from "@/lib/notification-service"

type Notification = {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  date: Date
  read: boolean
}

type NotificationContextType = {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "date" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  loadNotifications: () => Promise<void>
  requestPermission: () => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [lastCheck, setLastCheck] = useState<number>(0)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // Загружаем уведомления из localStorage при инициализации
  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications")
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications)
        // Преобразуем строки дат обратно в объекты Date
        const withDates = parsed.map((n: any) => ({
          ...n,
          date: new Date(n.date),
        }))
        setNotifications(withDates)
      } catch (e) {
        console.error("Ошибка при загрузке уведомлений:", e)
      }
    }

    // Загружаем уведомления с сервера
    loadNotifications()
  }, [])

  // Сохраняем уведомления в localStorage при изменении
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications))
  }, [notifications])

  // Количество непрочитанных уведомлений
  const unreadCount = notifications.filter((n) => !n.read).length

  // Запрос разрешения на отправку уведомлений
  const requestPermission = async () => {
    if (!("Notification" in window)) {
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  // Загрузка уведомлений с сервера
  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        // Получаем ID уже существующих уведомлений
        const existingIds = new Set(notifications.map((n) => n.id))

        // Преобразуем серверные уведомления в формат клиента
        const serverNotifications = data.data.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type as "info" | "success" | "warning" | "error",
          date: new Date(n.date),
          // Если уведомление уже существует, сохраняем его статус прочтения
          // иначе устанавливаем как непрочитанное
          read: existingIds.has(n.id) ? notifications.find((en) => en.id === n.id)?.read || false : false,
        }))

        // Объединяем с существующими уведомлениями, избегая дубликатов
        const newNotifications = [...notifications]

        // Проверяем, была ли уже выполнена первоначальная загрузка
        const isInitialLoad = !initialLoadDone

        // Массив для новых непрочитанных уведомлений
        const newUnreadNotifications: Notification[] = []

        serverNotifications.forEach((serverNotification) => {
          if (!existingIds.has(serverNotification.id)) {
            newNotifications.push(serverNotification)

            // Добавляем в массив новых непрочитанных уведомлений
            if (!serverNotification.read) {
              newUnreadNotifications.push(serverNotification)
            }
          }
        })

        // Сортируем по дате (новые вверху)
        newNotifications.sort((a, b) => b.date.getTime() - a.date.getTime())

        setNotifications(newNotifications)
        setLastCheck(Date.now())

        // Отмечаем, что первоначальная загрузка выполнена
        if (!initialLoadDone) {
          setInitialLoadDone(true)
        } else {
          // Если это не первая загрузка, отправляем нативные уведомления для новых непрочитанных
          if (newUnreadNotifications.length > 0 && Notification.permission === "granted") {
            // Если много новых уведомлений, группируем их
            if (newUnreadNotifications.length > 1) {
              showNotification("Новые уведомления", `У вас ${newUnreadNotifications.length} новых уведомлений`)
            } else {
              // Если одно уведомление, показываем его содержимое
              const notification = newUnreadNotifications[0]
              showNotification(notification.title, notification.message)
            }
          }
        }
      }
    } catch (error) {
      console.error("Ошибка при загрузке уведомлений:", error)
    }
  }

  // Добавление нового уведомления
  const addNotification = async (notification: Omit<Notification, "id" | "date" | "read">) => {
    try {
      // Отправляем уведомление на сервер
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        const newNotification: Notification = {
          ...result.data,
          date: new Date(result.data.date),
          read: false,
        }

        setNotifications((prev) => [newNotification, ...prev])

        // Показываем toast
        toast[notification.type || "info"](notification.title, {
          description: notification.message,
          icon: <Bell className="h-4 w-4" />,
        })

        // Отправляем нативное уведомление, если есть разрешение
        if (Notification.permission === "granted") {
          showNotification(notification.title, notification.message)
        }
      }
    } catch (error) {
      console.error("Ошибка при добавлении уведомления:", error)

      // Если не удалось добавить на сервер, добавляем локально
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        date: new Date(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev])

      // Показываем toast
      toast[notification.type || "info"](notification.title, {
        description: notification.message,
        icon: <Bell className="h-4 w-4" />,
      })
    }
  }

  // Отметить уведомление как прочитанное
  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  // Отметить все уведомления как прочитанные
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // Очистить все уведомления
  const clearNotifications = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        loadNotifications,
        requestPermission,
      }}
    >
      {children}
      <Toaster position="top-right" />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
