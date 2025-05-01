"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Save, X } from "lucide-react"
import { ref, get, update, child } from "firebase/database"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import ImageUpload from "@/components/image-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { database } from "@/lib/firebase"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter()
  const userId = params.id
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
    avatar: "",
    status: "active" as "active" | "inactive",
    createdAt: "",
  })
  const [changePassword, setChangePassword] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      try {
        const dbRef = ref(database)
        const snapshot = await get(child(dbRef, `users/${userId}`))

        if (snapshot.exists()) {
          const userData = snapshot.val()
          setFormData({
            ...userData,
            password: "", // Don't show the password in the form
          })
        } else {
          toast({
            title: "Алдаа гарлаа",
            description: "Хэрэглэгч олдсонгүй.",
            variant: "destructive",
          })
          router.push("/admin/users")
          return
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Өгөгдөл ачаалахад алдаа гарлаа.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      status: checked ? "active" : "inactive",
    }))
  }

  const handleImageChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      avatar: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const userRef = ref(database, `users/${userId}`)

      // Create an update object without password if not changing it
      const updateData = { ...formData }

      if (!changePassword || !formData.password) {
        delete updateData.password
      }

      await update(userRef, updateData)

      toast({
        title: "Амжилттай хадгаллаа",
        description: "Хэрэглэгчийн мэдээлэл амжилттай шинэчлэгдлээ.",
      })

      router.push("/admin/users")
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Хэрэглэгчийн мэдээллийг шинэчлэхэд алдаа гарлаа.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <div className="flex flex-col">
          <AdminHeader title="Хэрэглэгч засах" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
              <span className="mt-2">Ачааллаж байна...</span>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader title="Хэрэглэгч засах" />
        <main className="flex-1 p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Хэрэглэгчийн нэр</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Хэрэглэгчийн нэр"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Имэйл хаяг</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="example@mail.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="changePassword">Нууц үг солих</Label>
                          <Switch id="changePassword" checked={changePassword} onCheckedChange={setChangePassword} />
                        </div>
                        {changePassword && (
                          <div className="pt-2">
                            <Label htmlFor="password">Шинэ нууц үг</Label>
                            <Input
                              id="password"
                              name="password"
                              type="password"
                              placeholder="••••••••"
                              value={formData.password}
                              onChange={handleChange}
                              required={changePassword}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Эрх & Төлөв</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Хэрэглэгчийн эрх</Label>
                        <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Эрх сонгох" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Админ</SelectItem>
                            <SelectItem value="user">Энгийн хэрэглэгч</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="status">Идэвхтэй эсэх</Label>
                        <Switch
                          id="status"
                          checked={formData.status === "active"}
                          onCheckedChange={handleSwitchChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="w-full md:w-[300px] space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Профайл зураг</h3>
                    <ImageUpload
                      value={formData.avatar}
                      onChange={handleImageChange}
                      label="Зураг"
                      placeholder="Зураг оруулах"
                    />
                  </CardContent>
                </Card>

                <div className="flex items-center gap-2">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/admin/users">
                      <X className="mr-2 h-4 w-4" />
                      Цуцлах
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
