"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ClassPerformanceProps = {
  studentId: string
}

export function ClassPerformance({ studentId }: ClassPerformanceProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [classData, setClassData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("table")

  useEffect(() => {
    const fetchClassPerformance = async () => {
      try {
        setLoading(true)
        setError(null)

        // Получаем данные об успеваемости класса
        const response = await fetch("/api/class-performance")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setClassData(data.data)
        } else {
          setError(data.error || "Не удалось загрузить данные об успеваемости класса")
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных об успеваемости класса:", error)
        setError("Произошла ошибка при загрузке данных об успеваемости класса")
      } finally {
        setLoading(false)
      }
    }

    fetchClassPerformance()
  }, [studentId])

  // Подготовка данных для графика средних баллов по четвертям
  const prepareQuarterAveragesChart = () => {
    if (!classData || !classData.quarterAverages) return []

    // Включаем все четыре четверти
    const allQuarters = [
      { id: "2025-Q1", name: "1 четверть" },
      { id: "2025-Q2", name: "2 четверть" },
      { id: "2025-Q3", name: "3 четверть" },
      { id: "2025-Q4", name: "4 четверть" },
    ]

    return allQuarters.map((quarter) => ({
      name: quarter.name,
      average: classData.quarterAverages[quarter.id] || 0,
      studentAverage: classData.studentQuarterAverages?.[studentId]?.[quarter.id] || 0,
    }))
  }

  // Подготовка данных для графика распределения учеников по баллам
  const prepareDistributionChart = () => {
    if (!classData || !classData.distribution) return []

    return Object.entries(classData.distribution).map(([range, count]) => ({
      range,
      count,
    }))
  }

  // Подготовка данных для таблицы рейтинга учеников
  const prepareRankingTable = () => {
    if (!classData || !classData.studentRankings) return []

    return classData.studentRankings
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Успеваемость класса</CardTitle>
          <CardDescription>Сравнение с другими учениками</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const quarterAveragesData = prepareQuarterAveragesChart()
  const distributionData = prepareDistributionChart()
  const rankingData = prepareRankingTable()

  // Определяем позицию текущего ученика в рейтинге
  const studentRank = rankingData.findIndex((student: any) => student.id === studentId) + 1

  // Определяем цвет для ранга
  const getRankColor = (rank: number) => {
    if (rank <= 3) return "text-yellow-500 dark:text-yellow-400"
    if (rank <= 10) return "text-blue-500 dark:text-blue-400"
    return "text-muted-foreground"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Успеваемость класса</CardTitle>
        <CardDescription>
          Сравнение с другими учениками
          {studentRank > 0 && (
            <span className={`ml-2 font-medium ${getRankColor(studentRank)}`}>
              (Ваш рейтинг: {studentRank} из {rankingData.length})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="table">Таблица</TabsTrigger>
            <TabsTrigger value="quarters">По четвертям</TabsTrigger>
            <TabsTrigger value="distribution">Распределение</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Место</TableHead>
                    <TableHead>Ученик</TableHead>
                    <TableHead className="text-right">Средний балл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankingData.map((student: any, index: number) => (
                    <TableRow key={student.id} className={student.id === studentId ? "bg-muted/50" : ""}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-right font-medium">{student.average.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="quarters">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quarterAveragesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--foreground)" }} axisLine={{ stroke: "var(--border)" }} />
                  <YAxis domain={[0, 10]} tick={{ fill: "var(--foreground)" }} axisLine={{ stroke: "var(--border)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "var(--foreground)" }} />
                  <Line
                    type="monotone"
                    dataKey="average"
                    name="Средний балл класса"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="studentAverage"
                    name="Ваш средний балл"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="distribution">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="range" tick={{ fill: "var(--foreground)" }} axisLine={{ stroke: "var(--border)" }} />
                  <YAxis tick={{ fill: "var(--foreground)" }} axisLine={{ stroke: "var(--border)" }} />
                  <Tooltip
                    formatter={(value) => [`${value} учеников`, "Количество"]}
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "var(--foreground)" }} />
                  <Bar dataKey="count" name="Количество учеников" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
