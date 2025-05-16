"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { getAllStudents } from "@/lib/users"

export function SheetsInitializer() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{
    success: number
    failed: number
    total: number
    errors: { id: string; error: string }[]
  } | null>(null)

  const initializeSheets = async () => {
    try {
      setLoading(true)
      setResults(null)

      const students = getAllStudents()
      const total = students.length
      let success = 0
      let failed = 0
      const errors: { id: string; error: string }[] = []

      for (let i = 0; i < students.length; i++) {
        const student = students[i]
        try {
          const response = await fetch("/api/init-student-sheet", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ studentId: student.id }),
          })

          const data = await response.json()

          if (data.success) {
            success++
          } else {
            failed++
            errors.push({ id: student.id, error: data.error || "Неизвестная ошибка" })
          }
        } catch (error) {
          failed++
          errors.push({
            id: student.id,
            error: error instanceof Error ? error.message : "Неизвестная ошибка",
          })
        }

        // Обновляем прогресс
        setProgress(Math.round(((i + 1) / total) * 100))
      }

      setResults({ success, failed, total, errors })
    } catch (error) {
      console.error("Ошибка при инициализации таблиц:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Инициализация таблиц Google Sheets</CardTitle>
        <CardDescription>Создание и настройка таблиц для всех учеников в системе</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-2 mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">Прогресс: {progress}%</p>
          </div>
        )}

        {results && (
          <Alert variant={results.failed === 0 ? "default" : "destructive"} className="mb-4">
            {results.failed === 0 ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>{results.failed === 0 ? "Успешно" : "Частично успешно"}</AlertTitle>
            <AlertDescription>
              <p>
                Всего учеников: {results.total}
                <br />
                Успешно: {results.success}
                <br />С ошибками: {results.failed}
              </p>

              {results.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Ошибки:</p>
                  <ul className="text-sm list-disc pl-5 mt-1">
                    {results.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>
                        ID: {error.id} - {error.error}
                      </li>
                    ))}
                    {results.errors.length > 5 && <li>И еще {results.errors.length - 5} ошибок...</li>}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p>Эта операция создаст отдельные листы в Google Sheets для каждого ученика в системе.</p>
          <p className="mt-2">Внимание: Если листы уже существуют, они не будут перезаписаны.</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={initializeSheets} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Инициализация..." : "Инициализировать таблицы"}
        </Button>
      </CardFooter>
    </Card>
  )
}
