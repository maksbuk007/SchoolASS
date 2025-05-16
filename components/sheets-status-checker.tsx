"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Database } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

export function SheetsStatusChecker() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    error?: string
    spreadsheetInfo?: {
      title: string
      sheets: string[]
    }
  } | null>(null)

  // Автоматически проверяем статус при загрузке компонента
  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      setLoading(true)
      setChecking(true)
      setResult(null)

      const response = await fetch("/api/check-sheets-status")
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
      setChecking(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Статус подключения к Google Sheets
        </CardTitle>
        <CardDescription>Проверка доступности таблицы и загрузки данных</CardDescription>
      </CardHeader>
      <CardContent>
        {checking && !result && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Проверка подключения...</span>
          </div>
        )}

        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
            {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Подключено" : "Ошибка подключения"}</AlertTitle>
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

              {result.success && result.spreadsheetInfo && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Информация о таблице:</h4>
                  <p className="mb-1">
                    <span className="font-medium">Название:</span> {result.spreadsheetInfo.title}
                  </p>
                  <div>
                    <span className="font-medium">Листы:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.spreadsheetInfo.sheets.map((sheet, index) => (
                        <Badge key={index} variant="outline">
                          {sheet}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkStatus} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Проверка..." : "Обновить статус"}
        </Button>
      </CardFooter>
    </Card>
  )
}
