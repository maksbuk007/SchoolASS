"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-provider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { History, Home, ShieldAlert, Users, BookOpen, Settings, Bell } from "lucide-react"
import { useNotifications } from "@/components/notifications/notification-provider"
import { Badge } from "@/components/ui/badge"

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

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()
  const { unreadCount } = useNotifications()

  const navItems = user?.role === "admin" ? adminNavItems : studentNavItems

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Открыть меню</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7 py-4">
          <h2 className="text-lg font-semibold mb-2">Меню навигации</h2>
          <p className="text-sm text-muted-foreground mb-4">Выберите раздел для перехода</p>
          <Link href="/dashboard" className="flex items-center" onClick={() => setOpen(false)}>
            <span className="font-bold">Школьный портал</span>
          </Link>
        </div>
        <div className="mt-8 px-7">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-accent text-accent-foreground"
                    : "transparent",
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}

            <div className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <Bell className="mr-2 h-4 w-4" />
              <span>Уведомления</span>
              {unreadCount > 0 && (
                <Badge className="ml-auto px-1 min-w-[1.25rem]" variant="destructive">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </div>
          {user?.role === "student" && (
            <div className="mt-6 border-t pt-4">
              <div className="space-y-1 px-3">
                <p className="text-sm text-muted-foreground">Класс: {user.class}</p>
                <p className="text-sm text-muted-foreground">Ученик: {user.name}</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
