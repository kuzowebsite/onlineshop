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

import { database } from "@/lib/firebase"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"

interface EditCategoryPageProps {
  params: {
    id: string
  }
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter()
  const categoryId = params.id
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoading(true)
      try {
        const dbRef = ref(database)
        const snapshot = await get(child(dbRef, `categories/${categoryId}`))

        if (snapshot.exists()) {
          setFormData(snapshot.val())
        } else {
          toast({
            title: "Алдаа гарлаа",
            description: "Ангилал олдсонгүй.",
            variant: "destructive",
          })
          router.push("/admin/categories")
          return
        }
      } catch (error) {
        console.error("Error fetching category:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Өгөгдөл ачаалахад алдаа гарлаа.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategory()
  }, [categoryId, router])

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
      // Update category in Firebase Realtime Database
      const categoryRef = ref(database, `categories/${categoryId}`)
      await update(categoryRef, formData)

      toast({
        title: "Амжилттай хадгаллаа",
        description: "Ангилалын мэдээлэл амжилттай шинэчлэгдлээ.",
      })

      router.push("/admin/categories")
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Ангилалын мэдээллийг шинэчлэхэд алдаа гарлаа.",
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
          <AdminHeader title="Ангилал засах" />
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
        <AdminHeader title="Ангилал засах" />
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
