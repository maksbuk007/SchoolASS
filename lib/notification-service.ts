// Функция для запроса разрешения на отправку уведомлений
export async function requestNotificationPermission(): Promise<boolean> {
  // Проверяем поддержку уведомлений в браузере
  if (!("Notification" in window)) {
    console.log("Этот браузер не поддерживает уведомления на рабочем столе")
    return false
  }

  // Запрашиваем разрешение
  let permission = Notification.permission

  // Если разрешение еще не запрашивалось
  if (permission !== "granted" && permission !== "denied") {
    permission = await Notification.requestPermission()
  }

  return permission === "granted"
}

// Функция для отправки нативного уведомления
export function sendNativeNotification(title: string, options?: NotificationOptions): void {
  // Проверяем поддержку и разрешение
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return
  }

  // Создаем и отправляем уведомление
  try {
    const notification = new Notification(title, options)

    // Добавляем обработчик клика по уведомлению
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } catch (error) {
    console.error("Ошибка при отправке уведомления:", error)
  }
}

// Функция для отправки уведомления с проверкой разрешения
export async function showNotification(title: string, body: string, icon?: string): Promise<void> {
  const hasPermission = await requestNotificationPermission()

  if (hasPermission) {
    sendNativeNotification(title, {
      body,
      icon: icon || "/favicon.ico",
      badge: "/favicon.ico",
      tag: "school-portal-notification",
      renotify: true,
    })
  }
}
