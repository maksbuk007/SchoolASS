"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { SheetsConnectionTester } from "@/components/sheets-connection-tester"
import { SheetsStatusChecker } from "@/components/sheets-status-checker"
import { DebugConnection } from "@/components/debug-connection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { NotificationPermissionButton } from "@/components/notification-permission-button"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [cleaningConflicts, setCleaningConflicts] = useState(false)
  const [cleanupResult, setCleanupResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    if (user && user.role !== "admin") {
      // Редирект на главную, если не админ
      router.push("/dashboard")
    }
  }, [user, router])

  const handleCleanupConflicts = async () => {
    try {
      setCleaningConflicts(true)
      setCleanupResult(null)

      const response = await fetch("/api/cleanup-conflicts")
      const data = await response.json()

      setCleanupResult({
        success: data.success,
        message:
          data.message || (data.success ? "Конфликтующие листы успешно удалены" : "Конфликтующие листы не найдены"),
      })

      if (data.success) {
        toast({
          title: "Успешно",
          description: "Конфликтующие листы были удалены",
        })
      }
    } catch (error) {
      setCleanupResult({
        success: false,
        message: "Произошла ошибка при очистке конфликтующих листов",
      })

      toast({
        title: "Ошибка",
        description: "Не удалось очистить конфликтующие листы",
        variant: "destructive",
      })
    } finally {
      setCleaningConflicts(false)
    }
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Настройки</h2>
        <p className="text-muted-foreground">Управление настройками и интеграциями системы</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Очистка конфликтующих листов
            </CardTitle>
            <CardDescription>Удаление листов с конфликтами, созданных Google Sheets</CardDescription>
          </CardHeader>
          <CardContent>
            {cleanupResult && (
              <Alert variant={cleanupResult.success ? "default" : "warning"} className="mb-4">
                {cleanupResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle>{cleanupResult.success ? "Успешно" : "Информация"}</AlertTitle>
                <AlertDescription>{cleanupResult.message}</AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground mb-4">
              При одновременном редактировании таблицы несколькими пользователями Google Sheets может создавать
              конфликтующие копии листов с суффиксом "_conflict". Эта функция позволяет удалить такие листы.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCleanupConflicts} disabled={cleaningConflicts}>
              {cleaningConflicts && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cleaningConflicts ? "Очистка..." : "Очистить конфликтующие листы"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Настройки уведомлений</CardTitle>
            <CardDescription>Управление уведомлениями на устройстве</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Включите уведомления на рабочем столе, чтобы получать оповещения о новых событиях даже когда браузер
              свернут.
            </p>
          </CardContent>
          <CardFooter>
            <NotificationPermissionButton />
          </CardFooter>
        </Card>

        <SheetsStatusChecker />
        <SheetsConnectionTester />
        <DebugConnection />
      </div>
    </div>
  )
}
