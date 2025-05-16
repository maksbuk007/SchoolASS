"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { NotificationCenter } from "@/components/notifications/notification-center"

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <MobileNav />
          <Link href="/dashboard" className="mr-6 hidden items-center space-x-2 lg:flex">
            <span className="font-bold">Школьный портал</span>
          </Link>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {user && <span className="hidden md:inline-block text-sm mr-2">{user.name}</span>}
          <NotificationCenter />
          <ModeToggle />
          <Button variant="outline" size="sm" onClick={logout}>
            Выйти
          </Button>
        </div>
      </div>
    </header>
  )
}
