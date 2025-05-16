"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function SheetsConnectionTester() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    error?: string
    serviceAccount?: string
    spreadsheetId?: string
  } | null>(null)

  const testConnection = async () => {
    try {
      setLoading(true)
      setResult(null)

      const response = await fetch("/api/test-sheets-connection")
      const data = await response.json()

      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Произошла ошибка при выполнении запроса",
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Тестирование подключения к Google Sheets</CardTitle>
        <CardDescription>
          Проверьте, правильно ли настроены переменные окружения и доступ к Google Sheets API
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
            {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Успешно" : "Ошибка"}</AlertTitle>
            <AlertDescription>
              {result.message}
              {result.error && <div className="mt-2 text-sm font-mono bg-muted p-2 rounded">{result.error}</div>}
              {result.serviceAccount && (
                <div className="mt-2 text-sm">
                  Сервисный аккаунт: <span className="font-mono">{result.serviceAccount}</span>
                </div>
              )}
              {result.spreadsheetId && (
                <div className="mt-2 text-sm">
                  ID таблицы: <span className="font-mono">{result.spreadsheetId}</span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testConnection} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Проверка..." : "Проверить подключение"}
        </Button>
      </CardFooter>
    </Card>
  )
}
