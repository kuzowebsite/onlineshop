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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import ImageUpload from "@/components/image-upload"

import { database } from "@/lib/firebase"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"

interface EditProductPageProps {
  params: {
    id: string
  }
}

interface Store {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter()
  const productId = params.id
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stores, setStores] = useState<Store[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    originalPrice: 0,
    discountPrice: 0,
    discountPercent: 0,
    category: "",
    store: "",
    originalUrl: "",
    image: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const dbRef = ref(database)

        // Fetch product data
        const productSnapshot = await get(child(dbRef, `products/${productId}`))

        if (productSnapshot.exists()) {
          setFormData(productSnapshot.val())
        } else {
          toast({
            title: "Алдаа гарлаа",
            description: "Бүтээгдэхүүн олдсонгүй.",
            variant: "destructive",
          })
          router.push("/admin/products")
          return
        }

        // Fetch stores
        const storesSnapshot = await get(child(dbRef, "stores"))
        if (storesSnapshot.exists()) {
          const storesData = storesSnapshot.val()
          const storesArray: Store[] = []

          // Convert object to array
          for (const key in storesData) {
            storesArray.push({
              id: key,
              name: storesData[key].name,
            })
          }

          setStores(storesArray)
        } else {
          setStores([])
        }

        // Fetch categories
        const categoriesSnapshot = await get(child(dbRef, "categories"))
        if (categoriesSnapshot.exists()) {
          const categoriesData = categoriesSnapshot.val()
          const categoriesArray: Category[] = []

          // Convert object to array
          for (const key in categoriesData) {
            categoriesArray.push({
              id: key,
              name: categoriesData[key].name,
            })
          }

          setCategories(categoriesArray)
        } else {
          setCategories([])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Өгөгдөл ачаалахад алдаа гарлаа.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [productId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "originalPrice" || name === "discountPrice" || name === "discountPercent" ? Number(value) : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      image: value,
    }))
  }

  const calculateDiscountPercent = () => {
    if (formData.originalPrice > 0 && formData.discountPrice > 0) {
      const discountPercent = Math.round(
        ((formData.originalPrice - formData.discountPrice) / formData.originalPrice) * 100,
      )
      setFormData((prev) => ({
        ...prev,
        discountPercent,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Update product in Firebase Realtime Database
      const productRef = ref(database, `products/${productId}`)
      await update(productRef, formData)

      toast({
        title: "Амжилттай хадгаллаа",
        description: "Бүтээгдэхүүний мэдээлэл амжилттай шинэчлэгдлээ.",
      })

      router.push("/admin/products")
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Бүтээгдэхүүний мэдээллийг шинэчлэхэд алдаа гарлаа.",
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
          <AdminHeader title="Бүтээгдэхүүн засах" />
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
        <AdminHeader title="Бүтээгдэхүүн засах" />
        <main className="flex-1 p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Бүтээгдэхүүний нэр</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Бүтээгдэхүүний нэр"
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
                          placeholder="Бүтээгдэхүүний тайлбар"
                          value={formData.description}
                          onChange={handleChange}
                          rows={5}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Үнэ & Хямдрал</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Үндсэн үнэ (₮)</Label>
                        <Input
                          id="originalPrice"
                          name="originalPrice"
                          type="number"
                          placeholder="0"
                          value={formData.originalPrice || ""}
                          onChange={handleChange}
                          onBlur={calculateDiscountPercent}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discountPrice">Хямдралтай үнэ (₮)</Label>
                        <Input
                          id="discountPrice"
                          name="discountPrice"
                          type="number"
                          placeholder="0"
                          value={formData.discountPrice || ""}
                          onChange={handleChange}
                          onBlur={calculateDiscountPercent}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discountPercent">Хямдрал (%)</Label>
                        <Input
                          id="discountPercent"
                          name="discountPercent"
                          type="number"
                          placeholder="0"
                          value={formData.discountPercent || ""}
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
                    <h3 className="text-lg font-medium mb-4">Ангилал & Дэлгүүр</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Ангилал</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleSelectChange("category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ангилал сонгох" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="store">Дэлгүүр</Label>
                        <Select value={formData.store} onValueChange={(value) => handleSelectChange("store", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Дэлгүүр сонгох" />
                          </SelectTrigger>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem key={store.id} value={store.name}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="originalUrl">Дэлгүүрийн холбоос</Label>
                        <Input
                          id="originalUrl"
                          name="originalUrl"
                          placeholder="https://"
                          value={formData.originalUrl}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Зураг</h3>
                    <ImageUpload value={formData.image} onChange={handleImageChange} />
                  </CardContent>
                </Card>

                <div className="flex items-center gap-2">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/admin/products">
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
