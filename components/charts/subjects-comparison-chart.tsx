"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { quarters, subjects, calculateAverage } from "@/lib/data"

type SubjectsComparisonChartProps = {
  gradesData: any
}

export function SubjectsComparisonChart({ gradesData }: SubjectsComparisonChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("current")

  // Подготовка данных для графика
  const prepareChartData = () => {
    if (!gradesData || !gradesData.subjects) return []

    return subjects
      .map((subject) => {
        const subjectData = gradesData.subjects[subject.id]
        if (!subjectData) return null

        // Для 4-й четверти используем данные из quarters["2025-Q4"] или current
        const grades =
          selectedPeriod === "2025-Q4"
            ? subjectData.quarters["2025-Q4"] || subjectData.current || []
            : selectedPeriod === "current"
              ? subjectData.current
              : subjectData.quarters[selectedPeriod] || []

        // Вычисляем средний балл только если есть оценки
        if (grades.length === 0) return null

        const average = calculateAverage(grades)

        return {
          name: subject.name,
          average: average || 0,
        }
      })
      .filter(Boolean) // Убираем null значения
      .sort((a, b) => b.average - a.average) // Сортируем по убыванию среднего балла
  }

  const chartData = prepareChartData()

  // Функция для определения цвета бара в зависимости от среднего балла
  // Используем более яркие цвета для лучшей видимости в темном режиме
  const getBarColor = (average: number) => {
    if (average >= 9) return "#10b981" // яркий зеленый
    if (average >= 7) return "#3b82f6" // яркий синий
    if (average >= 5) return "#8b5cf6" // яркий фиолетовый
    if (average >= 3) return "#f59e0b" // яркий оранжевый
    return "#f43f5e" // яркий красный
  }

  // Добавляем 4-ю четверть в список периодов
  const allQuarters = [...quarters, { id: "2025-Q4", name: "4 четверть (из архива)" }]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Сравнение успеваемости по предметам</CardTitle>
        <CardDescription>Средний балл по каждому предмету</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="period-select-bar">Период</Label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger id="period-select-bar">
              <SelectValue placeholder="Выберите период" />
            </SelectTrigger>
            <SelectContent>
              {allQuarters.map((quarter) => (
                <SelectItem key={quarter.id} value={quarter.id}>
                  {quarter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-[400px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  domain={[0, 10]}
                  tick={{ fill: "var(--foreground)" }}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  tick={{ fill: "var(--foreground)" }}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <Tooltip
                  formatter={(value) => [`${value}`, "Средний балл"]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <Legend wrapperStyle={{ color: "var(--foreground)" }} />
                <Bar
                  dataKey="average"
                  name="Средний балл"
                  radius={[0, 4, 4, 0]}
                  // @ts-ignore - игнорируем ошибку типа для custom fill
                  fill={(entry: any) => getBarColor(entry.average)}
                />
              </BarChart>
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
