"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"
import { useNotifications } from "@/components/notifications/notification-provider"
import { useToast } from "@/hooks/use-toast"

export function NotificationPermissionButton() {
  const { requestPermission } = useNotifications()
  const { toast } = useToast()
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">("default")

  useEffect(() => {
    // Проверяем поддержку уведомлений
    if (!("Notification" in window)) {
      setPermissionState("unsupported")
      return
    }

    // Устанавливаем текущее состояние разрешения
    setPermissionState(Notification.permission)
  }, [])

  const handleRequestPermission = async () => {
    const granted = await requestPermission()

    if (granted) {
      setPermissionState("granted")
      toast({
        title: "Разрешение получено",
        description: "Теперь вы будете получать уведомления о новых событиях",
      })
    } else {
      setPermissionState(Notification.permission)
      if (Notification.permission === "denied") {
        toast({
          title: "Разрешение отклонено",
          description: "Вы не будете получать уведомления. Вы можете изменить это в настройках браузера.",
          variant: "destructive",
        })
      }
    }
  }

  if (permissionState === "unsupported") {
    return (
      <Button variant="outline" disabled>
        <BellOff className="mr-2 h-4 w-4" />
        Уведомления не поддерживаются
      </Button>
    )
  }

  if (permissionState === "granted") {
    return (
      <Button variant="outline" disabled>
        <Bell className="mr-2 h-4 w-4" />
        Уведомления включены
      </Button>
    )
  }

  return (
    <Button variant="outline" onClick={handleRequestPermission}>
      <Bell className="mr-2 h-4 w-4" />
      Включить уведомления
    </Button>
  )
}
