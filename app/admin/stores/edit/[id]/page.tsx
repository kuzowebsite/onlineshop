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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import ImageUpload from "@/components/image-upload"

import { database } from "@/lib/firebase"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"

interface EditStorePageProps {
  params: {
    id: string
  }
}

export default function EditStorePage({ params }: EditStorePageProps) {
  const router = useRouter()
  const storeId = params.id
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    productCount: 0,
    averageDiscount: 0,
    websiteUrl: "",
  })

  useEffect(() => {
    const fetchStore = async () => {
      setIsLoading(true)
      try {
        const dbRef = ref(database)
        const snapshot = await get(child(dbRef, `stores/${storeId}`))

        if (snapshot.exists()) {
          setFormData(snapshot.val())
        } else {
          toast({
            title: "Алдаа гарлаа",
            description: "Дэлгүүр олдсонгүй.",
            variant: "destructive",
          })
          router.push("/admin/stores")
          return
        }
      } catch (error) {
        console.error("Error fetching store:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Өгөгдөл ачаалахад алдаа гарлаа.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStore()
  }, [storeId, router])

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

    try {
      // Update store in Firebase Realtime Database
      const storeRef = ref(database, `stores/${storeId}`)
      await update(storeRef, formData)

      toast({
        title: "Амжилттай хадгаллаа",
        description: "Дэлгүүрийн мэдээлэл амжилттай шинэчлэгдлээ.",
      })

      router.push("/admin/stores")
    } catch (error) {
      console.error("Error updating store:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Дэлгүүрийн мэдээллийг шинэчлэхэд алдаа гарлаа.",
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
          <AdminHeader title="Дэлгүүр засах" />
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
        <AdminHeader title="Дэлгүүр засах" />
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
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
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
