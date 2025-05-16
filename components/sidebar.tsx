"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-provider"
import { History, Home, ShieldAlert, Users, BookOpen, Settings, Bell } from "lucide-react"

const studentNavItems = [
  {
    title: "Текущие оценки",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "История оценок",
    href: "/dashboard/history",
    icon: History,
  },
  {
    title: "Архив оценок",
    href: "/dashboard/archive",
    icon: BookOpen,
  },
]

const adminNavItems = [
  ...studentNavItems,
  {
    title: "Список учеников",
    href: "/dashboard/students",
    icon: Users,
  },
  {
    title: "Управление оценками",
    href: "/dashboard/admin",
    icon: ShieldAlert,
  },
  {
    title: "Управление уведомлениями",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Настройки",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = user?.role === "admin" ? adminNavItems : studentNavItems

  return (
    <div className="hidden border-r bg-background lg:block w-64">
      <div className="h-full py-6 pl-4 pr-2">
        <div className="space-y-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Навигация</h2>
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "bg-accent text-accent-foreground"
                      : "transparent",
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
          {user?.role === "student" && (
            <div className="px-3 py-2">
              <div className="mb-2 px-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Информация</h2>
              </div>
              <div className="space-y-1 px-3">
                <p className="text-sm text-muted-foreground">Класс: {user.class}</p>
                <p className="text-sm text-muted-foreground">Ученик: {user.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
