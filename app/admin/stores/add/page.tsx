"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import ImageUpload from "@/components/image-upload"

import { useFirebase } from "@/components/firebase-provider"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"

export default function AddStorePage() {
  const router = useRouter()
  const { database, isInitialized } = useFirebase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    productCount: 0,
    averageDiscount: 0,
    websiteUrl: "",
  })

  // Check if Firebase is initialized
  useEffect(() => {
    if (!isInitialized) {
      toast({
        title: "Ачааллаж байна",
        description: "Өгөгдлийн сантай холбогдож байна, түр хүлээнэ үү.",
      })
    }
  }, [isInitialized])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "productCount" || name === "averageDiscount" ? Number(value) : value,
    }))
  }

  const handleImageChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      logo: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Check if database is initialized
    if (!database) {
      toast({
        title: "Алдаа гарлаа",
        description: "Өгөгдлийн сантай холбогдоогүй байна. Дахин оролдоно уу.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Dynamically import Firebase functions to ensure they're loaded
      const { ref, push } = await import("firebase/database")

      // Save store to Firebase Realtime Database
      const storesRef = ref(database, "stores")
      await push(storesRef, formData)

      toast({
        title: "Амжилттай нэмэгдлээ",
        description: "Дэлгүүр амжилттай нэмэгдлээ.",
      })

      router.push("/admin/stores")
    } catch (error) {
      console.error("Error adding store:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Дэлгүүр нэмэхэд алдаа гарлаа.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader title="Шинэ дэлгүүр нэмэх" />
        <main className="flex-1 p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Дэлгүүрийн нэр</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Дэлгүүрийн нэр"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Тайлбар</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Дэлгүүрийн тайлбар"
                          value={formData.description}
                          onChange={handleChange}
                          rows={5}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="websiteUrl">Вэб сайт</Label>
                        <Input
                          id="websiteUrl"
                          name="websiteUrl"
                          placeholder="https://"
                          value={formData.websiteUrl}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Статистик</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productCount">Бүтээгдэхүүний тоо</Label>
                        <Input
                          id="productCount"
                          name="productCount"
                          type="number"
                          placeholder="0"
                          value={formData.productCount || ""}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="averageDiscount">Дундаж хямдрал (%)</Label>
                        <Input
                          id="averageDiscount"
                          name="averageDiscount"
                          type="number"
                          placeholder="0"
                          value={formData.averageDiscount || ""}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="w-full md:w-[300px] space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Лого</h3>
                    <ImageUpload
                      value={formData.logo}
                      onChange={handleImageChange}
                      label="Лого"
                      placeholder="Лого оруулах"
                    />
                  </CardContent>
                </Card>

                <div className="flex items-center gap-2">
                  <Button type="submit" className="flex-1" disabled={isSubmitting || !isInitialized}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/admin/stores">
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
