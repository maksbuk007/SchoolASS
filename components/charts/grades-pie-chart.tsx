"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { quarters, subjects } from "@/lib/data"

type GradesPieChartProps = {
  gradesData: any
}

export function GradesPieChart({ gradesData }: GradesPieChartProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("current")

  // Цвета для разных оценок - более яркие и контрастные
  const COLORS = [
    "#f43f5e", // 1 - красный
    "#fb7185", // 2 - светло-красный
    "#f59e0b", // 3 - оранжевый
    "#fbbf24", // 4 - светло-оранжевый
    "#84cc16", // 5 - лаймовый
    "#65a30d", // 6 - зеленый
    "#06b6d4", // 7 - голубой
    "#0ea5e9", // 8 - синий
    "#8b5cf6", // 9 - фиолетовый
    "#7c3aed", // 10 - темно-фиолетовый
  ]

  // Подготовка данных для графика
  const prepareChartData = () => {
    if (!gradesData || !gradesData.subjects) return []

    // Счетчик для каждой оценки (1-10)
    const gradeCount = Array(10).fill(0)

    // Если выбран конкретный предмет
    if (selectedSubject) {
      const subjectData = gradesData.subjects[selectedSubject]
      if (subjectData) {
        const grades = selectedPeriod === "current" ? subjectData.current : subjectData.quarters[selectedPeriod] || []

        // Подсчитываем количество каждой оценки
        grades.forEach((grade: any) => {
          if (grade.value >= 1 && grade.value <= 10) {
            gradeCount[grade.value - 1]++
          }
        })
      }
    } else {
      // Если предмет не выбран, считаем по всем предметам
      Object.keys(gradesData.subjects).forEach((subjectId) => {
        const subjectData = gradesData.subjects[subjectId]
        const grades = selectedPeriod === "current" ? subjectData.current : subjectData.quarters[selectedPeriod] || []

        grades.forEach((grade: any) => {
          if (grade.value >= 1 && grade.value <= 10) {
            gradeCount[grade.value - 1]++
          }
        })
      })
    }

    // Формируем данные для графика
    return gradeCount
      .map((count, index) => ({
        name: `${index + 1}`,
        value: count,
      }))
      .filter((item) => item.value > 0) // Убираем оценки, которых нет
  }

  const chartData = prepareChartData()

  // Получаем список предметов
  const subjectOptions = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
  }))

  // Функция для получения названия предмета по ID
  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId)
    return subject ? subject.name : subjectId
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Распределение оценок</CardTitle>
        <CardDescription>Количество оценок каждого балла</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="subject-select-pie">Предмет</Label>
            <Select value={selectedSubject || ""} onValueChange={(value) => setSelectedSubject(value || null)}>
              <SelectTrigger id="subject-select-pie">
                <SelectValue placeholder="Все предметы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все предметы</SelectItem>
                {subjectOptions.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="period-select">Период</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger id="period-select">
                <SelectValue placeholder="Выберите период" />
              </SelectTrigger>
              <SelectContent>
                {quarters.map((quarter) => (
                  <SelectItem key={quarter.id} value={quarter.id}>
                    {quarter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[Number.parseInt(entry.name) - 1]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} оценок`, "Количество"]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />
                <Legend />
              </PieChart>
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
