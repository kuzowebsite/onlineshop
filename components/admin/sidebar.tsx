"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, LogOut, Package, Settings, Store, Tag, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") {
      return true
    }
    if (path !== "/admin" && pathname.startsWith(path)) {
      return true
    }
    return false
  }

  return (
    <div className="hidden border-r bg-gray-100/40 lg:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Store className="h-6 w-6 text-rose-600" />
            <span className="">Хямдрал Админ</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive("/admin") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:text-gray-900",
              )}
            >
              <Home className="h-4 w-4" />
              Хянах самбар
            </Link>
            <Link
              href="/admin/products"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive("/admin/products") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:text-gray-900",
              )}
            >
              <Package className="h-4 w-4" />
              Бүтээгдэхүүнүүд
            </Link>
            <Link
              href="/admin/categories"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive("/admin/categories") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:text-gray-900",
              )}
            >
              <Tag className="h-4 w-4" />
              Ангилалууд
            </Link>
            <Link
              href="/admin/stores"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive("/admin/stores") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:text-gray-900",
              )}
            >
              <Store className="h-4 w-4" />
              Дэлгүүрүүд
            </Link>
            <Link
              href="/admin/users"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive("/admin/users") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:text-gray-900",
              )}
            >
              <Users className="h-4 w-4" />
              Хэрэглэгчид
            </Link>
            <Link
              href="/admin/analytics"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive("/admin/analytics") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:text-gray-900",
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Статистик
            </Link>
            <Link
              href="/admin/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive("/admin/settings") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:text-gray-900",
              )}
            >
              <Settings className="h-4 w-4" />
              Тохиргоо
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/">
              <LogOut className="mr-2 h-4 w-4" />
              Гарах
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
