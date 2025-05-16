"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { subjects, calculateAverage } from "@/lib/data"
import { TrendingUp, TrendingDown, Award, AlertTriangle } from "lucide-react"

type ExtendedStatisticsProps = {
  gradesData: any
  classAverages?: Record<string, number> // Средние баллы по классу для каждого предмета
}

export function ExtendedStatistics({ gradesData, classAverages }: ExtendedStatisticsProps) {
  if (!gradesData || !gradesData.subjects) {
    return null
  }

  // Находим предметы с наивысшим и наинизшим средним баллом
  const subjectAverages = subjects
    .map((subject) => {
      const subjectData = gradesData.subjects[subject.id]
      if (!subjectData) return { id: subject.id, name: subject.name, average: 0 }

      const grades = subjectData.current || []
      const average = calculateAverage(grades)

      return {
        id: subject.id,
        name: subject.name,
        average,
      }
    })
    .filter((subject) => subject.average > 0) // Убираем предметы без оценок

  // Сортируем по среднему баллу
  const sortedSubjects = [...subjectAverages].sort((a, b) => b.average - a.average)

  // Лучшие и худшие предметы
  const bestSubjects = sortedSubjects.slice(0, 3)
  const worstSubjects = [...sortedSubjects].sort((a, b) => a.average - b.average).slice(0, 3)

  // Общий средний балл
  const allGrades = Object.values(gradesData.subjects).flatMap((subject: any) => subject.current || [])
  const overallAverage = calculateAverage(allGrades)

  // Сравнение с классом (если данные доступны)
  const comparisonWithClass = classAverages
    ? subjects
        .map((subject) => {
          const subjectData = gradesData.subjects[subject.id]
          if (!subjectData) return null

          const grades = subjectData.current || []
          const average = calculateAverage(grades)
          const classAverage = classAverages[subject.id] || 0

          if (average === 0 || classAverage === 0) return null

          const difference = average - classAverage

          return {
            id: subject.id,
            name: subject.name,
            average,
            classAverage,
            difference,
            isAbove: difference > 0,
          }
        })
        .filter(Boolean)
    : []

  // Сортируем по разнице с классом
  const sortedComparison = [...comparisonWithClass]
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
    .slice(0, 5)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Лучшие результаты
          </CardTitle>
          <CardDescription>Предметы с наивысшим средним баллом</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {bestSubjects.length > 0 ? (
              bestSubjects.map((subject) => (
                <li key={subject.id} className="flex justify-between items-center">
                  <span>{subject.name}</span>
                  <Badge variant="outline" className="text-green-600">
                    {subject.average.toFixed(2)}
                  </Badge>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">Нет данных для отображения</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Требуют внимания
          </CardTitle>
          <CardDescription>Предметы с наинизшим средним баллом</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {worstSubjects.length > 0 ? (
              worstSubjects.map((subject) => (
                <li key={subject.id} className="flex justify-between items-center">
                  <span>{subject.name}</span>
                  <Badge variant="outline" className={subject.average < 4 ? "text-red-600" : "text-yellow-600"}>
                    {subject.average.toFixed(2)}
                  </Badge>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">Нет данных для отображения</li>
            )}
          </ul>
        </CardContent>
      </Card>

      {classAverages && sortedComparison.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Сравнение с классом</CardTitle>
            <CardDescription>Ваши результаты по сравнению со средним баллом класса</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {sortedComparison.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <span>{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span>
                      {item.average.toFixed(2)} vs {item.classAverage.toFixed(2)}
                    </span>
                    <Badge variant="outline" className={item.isAbove ? "text-green-600" : "text-red-600"}>
                      {item.isAbove ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(item.difference).toFixed(2)}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
