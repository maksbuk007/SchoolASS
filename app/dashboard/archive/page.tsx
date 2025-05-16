"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { subjects } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ArchiveGrades {
  studentId: string
  subjects: {
    [subjectId: string]: {
      Q1: number
      Q2: number
      Q3: number
      Q4: number
      year: number
    }
  }
}

export default function ArchivePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [archiveData, setArchiveData] = useState<ArchiveGrades | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadArchiveData = async () => {
      if (user) {
        try {
          setLoading(true)
          setError(null)

          const response = await fetch(`/api/archive-grades?studentId=${user.id}`)
          const result = await response.json()

          if (result.success && result.data) {
            setArchiveData(result.data)
          } else {
            setError(result.message || "Не удалось загрузить архивные данные")
          }
        } catch (error) {
          console.error("Ошибка при загрузке архивных данных:", error)
          setError("Не удалось загрузить архивные данные")
        } finally {
          setLoading(false)
        }
      }
    }

    loadArchiveData()
  }, [user])

  // Определение цвета для оценки (10-балльная система)
  const getGradeColor = (value: number) => {
    if (value === 0) return "text-muted-foreground"
    if (value >= 9) return "text-green-600 dark:text-green-500"
    if (value >= 7) return "text-green-500 dark:text-green-400"
    if (value >= 5) return "text-blue-500 dark:text-blue-400"
    if (value >= 3) return "text-yellow-500 dark:text-yellow-400"
    if (value >= 2) return "text-orange-500 dark:text-orange-400"
    return "text-red-500 dark:text-red-400"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Архив оценок</h2>
        <div className="flex flex-col items-end">
          <p className="text-muted-foreground">Учебный год 2023-2024</p>
          {user?.role === "student" && (
            <p className="text-sm font-medium">
              {user.name}, {user.class} класс
            </p>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Архив оценок за прошлый учебный год</CardTitle>
          <CardDescription>Просмотр оценок за все четверти прошлого учебного года</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Предмет</TableHead>
                  <TableHead className="text-center">I четверть</TableHead>
                  <TableHead className="text-center">II четверть</TableHead>
                  <TableHead className="text-center">III четверть</TableHead>
                  <TableHead className="text-center">IV четверть</TableHead>
                  <TableHead className="text-right">Годовая</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => {
                  const subjectGrades = archiveData?.subjects[subject.id] || { Q1: 0, Q2: 0, Q3: 0, Q4: 0, year: 0 }

                  return (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell className="text-center">
                        {subjectGrades.Q1 > 0 ? (
                          <Badge variant="outline" className={getGradeColor(subjectGrades.Q1)}>
                            {subjectGrades.Q1}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {subjectGrades.Q2 > 0 ? (
                          <Badge variant="outline" className={getGradeColor(subjectGrades.Q2)}>
                            {subjectGrades.Q2}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {subjectGrades.Q3 > 0 ? (
                          <Badge variant="outline" className={getGradeColor(subjectGrades.Q3)}>
                            {subjectGrades.Q3}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {subjectGrades.Q4 > 0 ? (
                          <Badge variant="outline" className={getGradeColor(subjectGrades.Q4)}>
                            {subjectGrades.Q4}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${getGradeColor(subjectGrades.year)}`}>
                        {subjectGrades.year > 0 ? subjectGrades.year : "—"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
