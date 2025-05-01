"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Save, X } from "lucide-react"
import { ref, push } from "firebase/database"

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

export default function AddUserPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
    avatar: "",
    status: "active" as "active" | "inactive",
    createdAt: new Date().toISOString(),
  })

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
      // In a real app, you would hash the password before storing it
      // For this demo, we'll store it as plain text
      const usersRef = ref(database, "users")
      await push(usersRef, formData)

      toast({
        title: "Амжилттай нэмэгдлээ",
        description: "Хэрэглэгч амжилттай нэмэгдлээ.",
      })

      router.push("/admin/users")
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Хэрэглэгч нэмэхэд алдаа гарлаа.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader title="Шинэ хэрэглэгч нэмэх" />
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
                        <Label htmlFor="password">Нууц үг</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
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
