"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { NotificationSender } from "@/components/admin/notification-sender"

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== "admin") {
      // Редирект на главную, если не админ
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Управление уведомлениями</h2>
        <p className="text-muted-foreground">Отправка уведомлений всем пользователям системы</p>
      </div>

      <div className="grid gap-6">
        <NotificationSender />
      </div>
    </div>
  )
}
