"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { subjects } from "@/lib/data"

type GradesLineChartProps = {
  gradesData: any
}

// Массив цветов для графиков - более яркие для лучшей видимости в темном режиме
const CHART_COLORS = [
  "#3b82f6", // синий
  "#10b981", // зеленый
  "#f59e0b", // оранжевый
  "#8b5cf6", // фиолетовый
  "#ec4899", // розовый
  "#06b6d4", // голубой
  "#f43f5e", // красный
  "#84cc16", // лаймовый
]

export function GradesLineChart({ gradesData }: GradesLineChartProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  // Получаем названия предметов из их ID
  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId)
    return subject ? subject.name : subjectId
  }

  // Подготовка данных для графика
  const prepareChartData = () => {
    if (!gradesData || !gradesData.subjects) return []

    // Всегда включаем все четверти, даже если нет оценок
    // Добавляем четвертую четверть (2025-Q4)
    const allQuarters = [
      { id: "2025-Q1", name: "1 четверть" },
      { id: "2025-Q2", name: "2 четверть" },
      { id: "2025-Q3", name: "3 четверть" },
      { id: "2025-Q4", name: "4 четверть" },
    ]

    const chartData = allQuarters.map((quarter) => {
      const quarterData: any = {
        name: quarter.name,
        quarterId: quarter.id,
      }

      // Если выбран конкретный предмет, добавляем только его
      if (selectedSubject) {
        const subjectData = gradesData.subjects[selectedSubject]
        if (subjectData) {
          // Для 4-й четверти используем данные из quarters["2025-Q4"] или current
          const grades =
            quarter.id === "2025-Q4"
              ? subjectData.quarters["2025-Q4"] || subjectData.current || []
              : subjectData.quarters[quarter.id] || []

          // Вычисляем средний балл только если есть оценки
          if (grades.length > 0) {
            const sum = grades.reduce((acc: number, grade: any) => acc + grade.value, 0)
            quarterData[selectedSubject] = Number((sum / grades.length).toFixed(2))
          } else {
            // Если нет оценок, ставим null чтобы не прерывать линию на графике
            quarterData[selectedSubject] = null
          }
        }
      } else {
        // Если предмет не выбран, добавляем средний балл по всем предметам
        let totalSum = 0
        let totalCount = 0

        Object.keys(gradesData.subjects).forEach((subjectId) => {
          const subjectData = gradesData.subjects[subjectId]
          // Для 4-й четверти используем данные из quarters["2025-Q4"] или current
          const grades =
            quarter.id === "2025-Q4"
              ? subjectData.quarters["2025-Q4"] || subjectData.current || []
              : subjectData.quarters[quarter.id] || []

          totalSum += grades.reduce((acc: number, grade: any) => acc + grade.value, 0)
          totalCount += grades.length
        })

        if (totalCount > 0) {
          quarterData["average"] = Number((totalSum / totalCount).toFixed(2))
        } else {
          // Если нет оценок, ставим null чтобы не прерывать линию на графике
          quarterData["average"] = null
        }
      }

      return quarterData
    })

    return chartData
  }

  const chartData = prepareChartData()

  // Получаем список предметов
  const subjectOptions = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Динамика успеваемости по четвертям</CardTitle>
        <CardDescription>График изменения среднего балла</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="subject-select">Предмет</Label>
          <Select
            value={selectedSubject || "all"}
            onValueChange={(value) => setSelectedSubject(value === "all" ? null : value)}
          >
            <SelectTrigger id="subject-select">
              <SelectValue placeholder="Все предметы (средний балл)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все предметы (средний балл)</SelectItem>
              {subjectOptions.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: "var(--foreground)" }} axisLine={{ stroke: "var(--border)" }} />
                <YAxis domain={[0, 10]} tick={{ fill: "var(--foreground)" }} axisLine={{ stroke: "var(--border)" }} />
                <Tooltip
                  formatter={(value, name) => {
                    if (value === null) return ["Нет данных", ""]
                    // Преобразуем ID предмета в название для отображения в подсказке
                    const displayName = name === "average" ? "Средний балл" : getSubjectName(name.toString())
                    return [value, displayName]
                  }}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <Legend
                  formatter={(value) => {
                    // Преобразуем ID предмета в название для легенды
                    return value === "average" ? "Средний балл" : getSubjectName(value)
                  }}
                  wrapperStyle={{ color: "var(--foreground)" }}
                />
                {selectedSubject ? (
                  <Line
                    type="monotone"
                    dataKey={selectedSubject}
                    stroke={CHART_COLORS[0]}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    connectNulls={true}
                  />
                ) : (
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke={CHART_COLORS[0]}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    connectNulls={true}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Нет данных для отображения
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
