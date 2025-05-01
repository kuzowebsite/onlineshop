"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useFirebase } from "@/components/firebase-provider"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, database, user, register } = useFirebase()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // First, authenticate with Firebase
      const userCredential = await login(formData.email, formData.password)

      // Then check if the user is an admin
      if (database && userCredential.user) {
        try {
          // Динамически импортируем необходимые функции Firebase
          const { ref, get, child, set } = await import("firebase/database")

          const dbRef = ref(database)
          const snapshot = await get(child(dbRef, `users/${userCredential.user.uid}`))

          if (snapshot.exists()) {
            const userData = snapshot.val()

            if (userData.role === "admin") {
              toast({
                title: "Амжилттай нэвтэрлээ",
                description: "Админ эрхээр амжилттай нэвтэрлээ.",
              })
              router.push("/admin")
            } else {
              // Not an admin, sign them out
              setError("Танд админ эрх байхгүй байна.")
              setIsLoading(false)
            }
          } else {
            // Пользователь существует в Auth, но не в базе данных
            // Создаем запись в базе данных
            const userRef = ref(database, `users/${userCredential.user.uid}`)
            await set(userRef, {
              name: userCredential.user.displayName || "Admin User",
              email: userCredential.user.email,
              role: "admin", // Предоставляем права администратора
              status: "active",
              createdAt: new Date().toISOString(),
            })

            toast({
              title: "Амжилттай нэвтэрлээ",
              description: "Админ эрхээр амжилттай нэвтэрлээ.",
            })
            router.push("/admin")
          }
        } catch (dbError) {
          console.error("Database error:", dbError)
          setError("Өгөгдлийн сантай ажиллахад алдаа гарлаа.")
          setIsLoading(false)
        }
      } else {
        setError("Нэвтрэх үед алдаа гарлаа.")
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Login error:", error)

      let errorMessage = "Имэйл эсвэл нууц үг буруу байна."

      if (error.code) {
        switch (error.code) {
          case "auth/invalid-credential":
            errorMessage = "Имэйл эсвэл нууц үг буруу байна."
            setShowCreateAdmin(true)
            break
          case "auth/user-not-found":
            errorMessage = "Ийм имэйл хаягтай хэрэглэгч бүртгэлгүй байна."
            setShowCreateAdmin(true)
            break
          case "auth/wrong-password":
            errorMessage = "Нууц үг буруу байна."
            break
          case "auth/user-disabled":
            errorMessage = "Энэ хэрэглэгчийн бүртгэл хаагдсан байна."
            break
          case "auth/too-many-requests":
            errorMessage = "Хэт олон удаа оролдлоо. Түр хүлээгээд дахин оролдоно уу."
            break
          case "auth/network-request-failed":
            errorMessage = "Сүлжээний алдаа гарлаа. Интернэт холболтоо шалгана уу."
            break
        }
      }

      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const createAdminAccount = async () => {
    if (!formData.email || !formData.password || formData.password.length < 6) {
      setError("Имэйл оруулна уу. Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Регистрируем нового пользователя
      const userCredential = await register(formData.email, formData.password)

      // Создаем запись в базе данных с правами администратора
      if (database && userCredential.user) {
        try {
          // Динамически импортируем необходимые функции Firebase
          const { ref, set } = await import("firebase/database")

          const userRef = ref(database, `users/${userCredential.user.uid}`)
          await set(userRef, {
            name: "Admin User",
            email: formData.email,
            role: "admin",
            status: "active",
            createdAt: new Date().toISOString(),
          })

          toast({
            title: "Админ бүртгэл үүсгэгдлээ",
            description: "Админ бүртгэл амжилттай үүсгэгдлээ. Одоо нэвтэрч болно.",
          })

          // Автоматически входим
          await login(formData.email, formData.password)
          router.push("/admin")
        } catch (dbError) {
          console.error("Database error:", dbError)
          setError("Өгөгдлийн сантай ажиллахад алдаа гарлаа.")
          setIsLoading(false)
        }
      }
    } catch (error: any) {
      console.error("Create admin error:", error)

      let errorMessage = "Админ бүртгэл үүсгэхэд алдаа гарлаа."

      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "Энэ имэйл хаяг өмнө нь бүртгэгдсэн байна."
            break
          case "auth/invalid-email":
            errorMessage = "Имэйл хаяг буруу форматтай байна."
            break
          case "auth/weak-password":
            errorMessage = "Нууц үг хэт сул байна. Илүү хүчтэй нууц үг оруулна уу."
            break
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Админ нэвтрэх</CardTitle>
          <CardDescription className="text-center">Хямдрал Агрегатор сайтын удирдлагын хэсэгт нэвтрэх</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Имэйл</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="pl-9"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Нууц үг</Label>
                <Button variant="link" className="p-0 h-auto text-xs" type="button">
                  Нууц үг мартсан?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Нэвтэрч байна..." : "Нэвтрэх"}
            </Button>

            {showCreateAdmin && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={createAdminAccount}
                disabled={isLoading}
              >
                {isLoading ? "Үүсгэж байна..." : "Админ бүртгэл үүсгэх"}
              </Button>
            )}
          </CardFooter>
        </form>
        <div className="p-4 text-center text-sm">
          <Link href="/" className="text-rose-600 hover:underline">
            Нүүр хуудас руу буцах
          </Link>
        </div>
      </Card>
    </div>
  )
}
