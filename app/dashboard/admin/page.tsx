"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useSearchParams, useRouter } from "next/navigation"
import { getStudentData, subjects, quarters, updateGrade, addGrade, deleteGrade } from "@/lib/data"
import { getUserByIdSync } from "@/lib/users"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Plus, Trash2, ArrowLeft, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentId = searchParams.get("studentId") || "student1" // По умолчанию первый ученик

  const [loading, setLoading] = useState(true)
  const [gradesData, setGradesData] = useState<any>(null)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("current")
  const [editGradeData, setEditGradeData] = useState<{
    index: number
    value: number
    date: string
  } | null>(null)
  const [newGradeData, setNewGradeData] = useState({
    value: 8,
    date: new Date().toISOString().split("T")[0],
  })
  const [deleteGradeIndex, setDeleteGradeIndex] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Массив возможных оценок (от 1 до 10)
  const possibleGrades = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        if (user.role !== "admin") {
          // Редирект на главную, если не админ
          router.push("/dashboard")
          return
        }

        try {
          setLoading(true)
          setError(null)
          const student = getUserByIdSync(studentId)
          const result = await getStudentData(studentId)

          setSelectedStudent(student)
          setGradesData(result.data) // Обновлено: теперь используем result.data
          setLastUpdate(result.lastUpdate || "") // Добавлено: сохраняем дату обновления

          if (subjects.length > 0) {
            setSelectedSubject(subjects[0].id)
          }
        } catch (error) {
          console.error("Ошибка при загрузке данных:", error)
          setError("Не удалось загрузить данные из Google Sheets. Используются локальные данные.")

          // Загружаем данные о студенте даже при ошибке
          const student = getUserByIdSync(studentId)
          setSelectedStudent(student)

          if (subjects.length > 0) {
            setSelectedSubject(subjects[0].id)
          }
        } finally {
          setLoading(false)
        }
      }
    }

    loadData()
  }, [user, studentId, router])

  const handleUpdateGrade = async () => {
    if (!editGradeData || !selectedSubject || isSubmitting) return

    try {
      setIsSubmitting(true)
      const quarter = selectedPeriod !== "current" ? selectedPeriod : undefined
      const success = await updateGrade(
        studentId,
        selectedSubject,
        editGradeData.index,
        editGradeData.value,
        quarter,
        editGradeData.date, // Передаем дату для обновления
      )

      if (success) {
        // Обновляем данные
        const result = await getStudentData(studentId)
        setGradesData(result.data) // Обновлено: теперь используем result.data
        setLastUpdate(result.lastUpdate || "") // Добавлено: обновляем дату
        setEditGradeData(null)

        toast({
          title: "Оценка обновлена",
          description: "Оценка была успешно изменена",
        })
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить оценку",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Ошибка при обновлении оценки:", error)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении оценки",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddGrade = async () => {
    if (!selectedSubject || isSubmitting) return

    try {
      setIsSubmitting(true)
      const quarter = selectedPeriod !== "current" ? selectedPeriod : undefined
      const success = await addGrade(
        studentId,
        selectedSubject,
        newGradeData.value,
        new Date(newGradeData.date).toISOString(), // Используем выбранную дату
        quarter,
      )

      if (success) {
        // Обновляем данные
        const result = await getStudentData(studentId)
        setGradesData(result.data) // Обновлено: теперь используем result.data
        setLastUpdate(result.lastUpdate || "") // Добавлено: обновляем дату

        // Сбрасываем форму
        setNewGradeData({
          value: 8,
          date: new Date().toISOString().split("T")[0],
        })

        toast({
          title: "Оценка добавлена",
          description: "Новая оценка была успешно добавлена",
        })
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось добавить оценку",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Ошибка при добавлении оценки:", error)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при добавлении оценки",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteGrade = async () => {
    if (deleteGradeIndex === null || !selectedSubject || isSubmitting) return

    try {
      setIsSubmitting(true)
      const quarter = selectedPeriod !== "current" ? selectedPeriod : undefined
      const success = await deleteGrade(studentId, selectedSubject, deleteGradeIndex, quarter)

      if (success) {
        // Обновляем данные
        const result = await getStudentData(studentId)
        setGradesData(result.data) // Обновлено: теперь используем result.data
        setLastUpdate(result.lastUpdate || "") // Добавлено: обновляем дату
        setDeleteGradeIndex(null)

        toast({
          title: "Оценка удалена",
          description: "Оценка была успешно удалена",
        })
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить оценку",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Ошибка при удалении оценки:", error)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении оценки",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentGrades = () => {
    if (!gradesData || !selectedSubject) return []

    const subjectData = gradesData.subjects[selectedSubject]
    if (!subjectData) return []

    if (selectedPeriod === "current") {
      return subjectData.current || []
    } else {
      return subjectData.quarters[selectedPeriod] || []
    }
  }

  const getSubjectName = (id: string) => {
    const subject = subjects.find((s) => s.id === id)
    return subject ? subject.name : id
  }

  const getPeriodName = (id: string) => {
    const period = quarters.find((q) => q.id === id)
    return period ? period.name : id
  }

  const handleBackToList = () => {
    router.push("/dashboard/students")
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBackToList} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Управление оценками</h2>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-muted-foreground">Администратор: {user?.name}</p>
          {lastUpdate && <p className="text-xs text-muted-foreground">Обновлено: {lastUpdate}</p>}
          {selectedStudent && (
            <p className="font-medium">
              Ученик: {selectedStudent.name}, {selectedStudent.class} класс
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
          <CardTitle>Редактирование оценок</CardTitle>
          <CardDescription>Добавление, изменение и удаление оценок ученика</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Предмет</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Выберите предмет" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Учебный период</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger id="period">
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {getSubjectName(selectedSubject)} - {getPeriodName(selectedPeriod)}
            </h3>

            <Dialog>
              <DialogTrigger asChild>
                <Button disabled={isSubmitting}>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить оценку
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить новую оценку</DialogTitle>
                  <DialogDescription>Введите оценку и дату для добавления</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-grade">Оценка</Label>
                    <Select
                      value={newGradeData.value.toString()}
                      onValueChange={(value) =>
                        setNewGradeData({
                          ...newGradeData,
                          value: Number.parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger id="new-grade">
                        <SelectValue placeholder="Выберите оценку" />
                      </SelectTrigger>
                      <SelectContent>
                        {possibleGrades.map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-date">Дата</Label>
                    <Input
                      id="new-date"
                      type="date"
                      value={newGradeData.date}
                      onChange={(e) =>
                        setNewGradeData({
                          ...newGradeData,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddGrade} disabled={isSubmitting}>
                    {isSubmitting ? "Добавление..." : "Добавить"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Оценка</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentGrades().length > 0 ? (
                  getCurrentGrades().map((grade: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{grade.value}</TableCell>
                      <TableCell>{new Date(grade.date).toLocaleDateString("ru-RU")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  setEditGradeData({
                                    index,
                                    value: grade.value,
                                    date: new Date(grade.date).toISOString().split("T")[0],
                                  })
                                }
                                disabled={isSubmitting}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Изменить оценку</DialogTitle>
                                <DialogDescription>Выберите новое значение оценки и дату</DialogDescription>
                              </DialogHeader>
                              <div className="py-4 space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-grade">Оценка</Label>
                                  <Select
                                    value={editGradeData?.value.toString()}
                                    onValueChange={(value) =>
                                      setEditGradeData({
                                        ...editGradeData!,
                                        value: Number.parseInt(value),
                                      })
                                    }
                                  >
                                    <SelectTrigger id="edit-grade">
                                      <SelectValue placeholder="Выберите оценку" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {possibleGrades.map((grade) => (
                                        <SelectItem key={grade} value={grade.toString()}>
                                          {grade}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-date">Дата</Label>
                                  <Input
                                    id="edit-date"
                                    type="date"
                                    value={editGradeData?.date}
                                    onChange={(e) =>
                                      setEditGradeData({
                                        ...editGradeData!,
                                        date: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleUpdateGrade} disabled={isSubmitting}>
                                  {isSubmitting ? "Сохранение..." : "Сохранить"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500"
                                onClick={() => setDeleteGradeIndex(index)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить оценку?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Вы уверены, что хотите удалить эту оценку? Это действие нельзя отменить.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteGrade} disabled={isSubmitting}>
                                  {isSubmitting ? "Удаление..." : "Удалить"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      Нет оценок за выбранный период
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
