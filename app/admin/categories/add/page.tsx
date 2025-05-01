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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

import { database } from "@/lib/firebase"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"

export default function AddCategoryPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Save category to Firebase Realtime Database
      const categoriesRef = ref(database, "categories")
      await push(categoriesRef, formData)

      toast({
        title: "Амжилттай нэмэгдлээ",
        description: "Ангилал амжилттай нэмэгдлээ.",
      })

      router.push("/admin/categories")
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Ангилал нэмэхэд алдаа гарлаа.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader title="Шинэ ангилал нэмэх" />
        <main className="flex-1 p-6">
          <form onSubmit={handleSubmit}>
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ангилалын нэр</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Ангилалын нэр"
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
                        placeholder="Ангилалын тайлбар"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <Button type="submit" className="flex-1" disabled={isSubmitting}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/admin/categories">
                          <X className="mr-2 h-4 w-4" />
                          Цуцлах
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
