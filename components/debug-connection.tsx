"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Bug } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function DebugConnection() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    error?: string
    serviceAccount?: string
    spreadsheetId?: string
    envStatus?: {
      email: boolean
      privateKey: boolean
      spreadsheetId: boolean
    }
  } | null>(null)

  const testConnection = async () => {
    try {
      setLoading(true)
      setResult(null)

      // Тестируем подключение через API
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
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Отладка подключения к Google Sheets
        </CardTitle>
        <CardDescription>Расширенная проверка подключения и переменных окружения</CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
            {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Успешно" : "Ошибка"}</AlertTitle>
            <AlertDescription>
              {result.message}
              {result.error && (
                <Accordion type="single" collapsible className="mt-2">
                  <AccordionItem value="error">
                    <AccordionTrigger className="text-sm">Подробности ошибки</AccordionTrigger>
                    <AccordionContent>
                      <div className="mt-2 text-sm font-mono bg-muted p-2 rounded overflow-auto max-h-[200px]">
                        {result.error}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              <div className="mt-4 text-sm">
                <h4 className="font-semibold mb-1">Проверка переменных окружения:</h4>
                <ul className="space-y-1 list-disc pl-5">
                  <li>
                    Email сервисного аккаунта:{" "}
                    {result.envStatus?.email ? (
                      <span className="text-green-600 dark:text-green-400">Настроен</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">Отсутствует</span>
                    )}
                  </li>
                  <li>
                    ID таблицы:{" "}
                    {result.envStatus?.spreadsheetId ? (
                      <span className="text-green-600 dark:text-green-400">Настроен</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">Отсутствует</span>
                    )}
                  </li>
                  <li>
                    Приватный ключ:{" "}
                    {result.envStatus?.privateKey ? (
                      <span className="text-green-600 dark:text-green-400">Настроен</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">Отсутствует или некорректный</span>
                    )}
                  </li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testConnection} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Проверка..." : "Запустить отладку"}
        </Button>
      </CardFooter>
    </Card>
  )
}
