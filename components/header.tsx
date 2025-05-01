"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, Search, ShoppingBag, Store } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useSiteSettings } from "@/components/site-provider"

export default function Header() {
  // Проверка на клиентский рендеринг
  const [isBrowser, setIsBrowser] = useState(false)
  const { settings } = useSiteSettings()

  // This effect ensures we only render the component after it's mounted on the client
  useEffect(() => {
    setIsBrowser(true)
  }, [])

  // Базовый заголовок для серверного рендеринга или до загрузки данных
  const baseHeader = (
    <header className="border-b sticky top-0 z-50 bg-background">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl text-rose-600">
            Хямдрал Агрегатор
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Нүүр
            </Link>
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Бүтээгдэхүүн
            </Link>
            <Link href="/stores" className="text-sm font-medium transition-colors hover:text-primary">
              Дэлгүүр
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="search"
              placeholder="Хайх..."
              className="rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Хайх</span>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Цэс нээх</span>
          </Button>
        </div>
      </div>
    </header>
  )

  // Don't render anything until mounted on the client
  if (!isBrowser) {
    return baseHeader
  }

  return (
    <header className="border-b sticky top-0 z-50 bg-background">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl text-rose-600 flex items-center gap-2">
            {settings?.siteLogo && (
              <div className="relative h-8 w-8">
                <Image
                  src={settings.siteLogo || "/placeholder.svg"}
                  alt={settings.siteName || "Хямдрал Агрегатор"}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            {settings?.siteName || "Хямдрал Агрегатор"}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Нүүр
            </Link>
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Бүтээгдэхүүн
            </Link>
            <Link href="/stores" className="text-sm font-medium transition-colors hover:text-primary">
              Дэлгүүр
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="search"
              placeholder="Хайх..."
              className="rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Хайх</span>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Цэс нээх</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="mb-4">
                <SheetTitle>{settings?.siteName || "Хямдрал Агрегатор"}</SheetTitle>
                <SheetDescription>
                  {settings?.siteDescription || "Бүх дэлгүүрүүдийн хямдралыг нэг дороос"}
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-4">
                <Link href="/" className="flex items-center gap-2 text-sm font-medium">
                  <div className="rounded-full bg-rose-100 p-1">
                    <ShoppingBag className="h-4 w-4 text-rose-600" />
                  </div>
                  Нүүр
                </Link>
                <Link href="/products" className="flex items-center gap-2 text-sm font-medium">
                  <div className="rounded-full bg-rose-100 p-1">
                    <ShoppingBag className="h-4 w-4 text-rose-600" />
                  </div>
                  Бүтээгдэхүүн
                </Link>
                <Link href="/stores" className="flex items-center gap-2 text-sm font-medium">
                  <div className="rounded-full bg-rose-100 p-1">
                    <Store className="h-4 w-4 text-rose-600" />
                  </div>
                  Дэлгүүр
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
