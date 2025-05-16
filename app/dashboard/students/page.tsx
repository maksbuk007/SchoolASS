"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type User, getAllStudents, getAllClasses } from "@/lib/users"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, UserCog } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function StudentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [students, setStudents] = useState<User[]>([])
  const [filteredStudents, setFilteredStudents] = useState<User[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

          // Получаем список всех учеников
          const allStudents = await getAllStudents()
          setStudents(allStudents)
          setFilteredStudents(allStudents)

          // Получаем список всех классов
          const allClasses = await getAllClasses()
          setClasses(allClasses)
        } catch (err) {
          console.error("Ошибка при загрузке данных:", err)
          setError("Не удалось загрузить список учеников. Используются локальные данные.")

          // Используем синхронные версии функций в случае ошибки
          const { getAllStudentsSync, getAllClassesSync } = require("@/lib/users")
          const allStudents = getAllStudentsSync()
          setStudents(allStudents)
          setFilteredStudents(allStudents)

          const allClasses = getAllClassesSync()
          setClasses(allClasses)
        } finally {
          setLoading(false)
        }
      }
    }

    loadData()
  }, [user, router])

  useEffect(() => {
    // Фильтрация учеников по классу и поисковому запросу
    let filtered = students

    if (selectedClass !== "all") {
      filtered = filtered.filter((student) => student.class === selectedClass)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (student) => student.name.toLowerCase().includes(query) || student.username.toLowerCase().includes(query),
      )
    }

    setFilteredStudents(filtered)
  }, [selectedClass, searchQuery, students])

  const handleClassChange = (value: string) => {
    setSelectedClass(value)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleStudentSelect = (studentId: string) => {
    router.push(`/dashboard/admin?studentId=${studentId}`)
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Список учеников</h2>
        <p className="text-muted-foreground">Администратор: {user?.name}</p>
      </div>

      {error && (
        <Alert variant="warning">
          <AlertTitle>Внимание</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Управление учениками</CardTitle>
          <CardDescription>Просмотр и редактирование данных учеников</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск по имени или логину..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Tabs
              defaultValue="all"
              value={selectedClass}
              onValueChange={handleClassChange}
              className="w-full sm:w-[200px]"
            >
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  Все
                </TabsTrigger>
                {classes.map((cls) => (
                  <TabsTrigger key={cls} value={cls} className="flex-1">
                    {cls} класс
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Логин</TableHead>
                  <TableHead>Класс</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>{student.class} класс</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleStudentSelect(student.id)}>
                          <UserCog className="mr-2 h-4 w-4" />
                          Управление
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Ученики не найдены
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
