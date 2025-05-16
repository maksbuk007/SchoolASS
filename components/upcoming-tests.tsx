"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Calendar, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getUpcomingTestsData, type UpcomingTest } from "@/lib/data"

export function UpcomingTests() {
  const [loading, setLoading] = useState(true)
  const [tests, setTests] = useState<UpcomingTest[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTests = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Загрузка данных о предстоящих тестах...")
        const testsData = await getUpcomingTestsData()
        console.log("Загружены данные о предстоящих тестах:", testsData)

        setTests(testsData)
      } catch (err) {
        console.error("Ошибка при загрузке данных о тестах:", err)
        setError("Не удалось загрузить данные о предстоящих событиях")
      } finally {
        setLoading(false)
      }
    }

    loadTests()
  }, [])

  // Форматирование даты
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)
    } catch (e) {
      console.error("Ошибка при форматировании даты:", e, dateStr)
      return dateStr
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Предстоящие события
        </CardTitle>
        <CardDescription>Контрольные, тесты и другие важные события</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : tests.length > 0 ? (
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={index} className="flex items-start space-x-4 border-b pb-3 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{test.subjectName}</h4>
                    <Badge variant="outline">{formatDate(test.date)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-6">Нет предстоящих событий</p>
        )}
      </CardContent>
    </Card>
  )
}
