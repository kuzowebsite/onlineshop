"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ExternalLink, Percent, ShoppingBag, MapPin, Mail, Phone } from "lucide-react"
import { ref, get, child } from "firebase/database"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import Header from "@/components/header"
import { useFirebase } from "@/components/firebase-provider"

interface Store {
  id: string
  name: string
  description: string
  logo: string
  productCount: number
  averageDiscount: number
  websiteUrl: string
  address?: string
  email?: string
  phone?: string
  foundedYear?: number
}

interface Product {
  id: string
  name: string
  description: string
  originalPrice: number
  discountPrice: number
  discountPercent: number
  image: string
  category: string
  store: string
  originalUrl: string
}

interface StoreDetailProps {
  params: {
    id: string
  }
}

export default function StoreDetail({ params }: StoreDetailProps) {
  const { database, isInitialized } = useFirebase()
  const [store, setStore] = useState<Store | null>(null)
  const [storeProducts, setStoreProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isInitialized || !database) return

    const fetchStoreData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const dbRef = ref(database)

        // Получаем данные о магазине
        const storeSnapshot = await get(child(dbRef, `stores/${params.id}`))

        if (storeSnapshot.exists()) {
          const storeData = {
            id: params.id,
            ...storeSnapshot.val(),
          }
          setStore(storeData)

          // Получаем все продукты
          const productsSnapshot = await get(child(dbRef, "products"))

          if (productsSnapshot.exists()) {
            const productsData = productsSnapshot.val()
            const storeProductsArray: Product[] = []

            // Фильтруем продукты этого магазина
            for (const key in productsData) {
              if (productsData[key].store === storeData.name) {
                storeProductsArray.push({
                  id: key,
                  ...productsData[key],
                })
              }
            }

            setStoreProducts(storeProductsArray)
          }
        } else {
          setError("Дэлгүүр олдсонгүй")
        }
      } catch (err) {
        console.error("Error fetching store:", err)
        setError("Дэлгүүр ачаалахад алдаа гарлаа")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStoreData()
  }, [database, isInitialized, params.id])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        {isLoading ? (
          <div className="space-y-8">
            {/* Store Header Skeleton */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Skeleton className="h-40 w-40 rounded-lg" />
              <div className="flex-1 space-y-4 text-center md:text-left">
                <Skeleton className="h-8 w-3/4 mx-auto md:mx-0" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div>
              <Skeleton className="h-10 w-full max-w-md mb-4" />
              <Skeleton className="h-64 w-full rounded-md" />
            </div>

            {/* Products Skeleton */}
            <div>
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((item) => (
                  <Skeleton key={item} className="h-80 rounded-md" />
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-rose-600 text-lg mb-4">{error}</div>
            <Button onClick={() => window.location.reload()}>Дахин оролдох</Button>
          </div>
        ) : store ? (
          <>
            {/* Store Header */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-8">
              <div className="relative h-40 w-40 bg-gray-50 rounded-lg overflow-hidden">
                <Image
                  src={store.logo || "/placeholder.svg?height=200&width=200&query=store%20logo"}
                  alt={store.name}
                  fill
                  className="object-contain p-4"
                />
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h1 className="text-3xl font-bold">{store.name}</h1>
                <p className="text-gray-600">{store.description}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="h-5 w-5 text-rose-600" />
                    <span>
                      <strong>{store.productCount}</strong> бүтээгдэхүүн
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Percent className="h-5 w-5 text-rose-600" />
                    <span>
                      <strong>{store.averageDiscount}%</strong> дундаж хямдрал
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Button asChild>
                    <Link href={store.websiteUrl} target="_blank" rel="noopener noreferrer">
                      Дэлгүүрийн сайт
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/products?store=${store.id}`}>Бүх бүтээгдэхүүн үзэх</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Store Details */}
            <Tabs defaultValue="about" className="mb-12">
              <TabsList>
                <TabsTrigger value="about">Дэлгүүрийн тухай</TabsTrigger>
                <TabsTrigger value="contact">Холбоо барих</TabsTrigger>
                <TabsTrigger value="stats">Статистик</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="p-4 border rounded-md mt-2">
                <div className="prose max-w-none">
                  <h3>Дэлгүүрийн тухай</h3>
                  <p>{store.description}</p>
                  {store.foundedYear && <p>Үүсгэсэн он: {store.foundedYear}</p>}
                  <p>
                    {store.name} дэлгүүр нь нийт {store.productCount} бүтээгдэхүүнтэй бөгөөд дундаж хямдрал нь{" "}
                    {store.averageDiscount}% байна.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="contact" className="p-4 border rounded-md mt-2">
                <div className="space-y-4">
                  {store.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-rose-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Хаяг</h4>
                        <p className="text-gray-600">{store.address}</p>
                      </div>
                    </div>
                  )}
                  {store.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-rose-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Имэйл</h4>
                        <p className="text-gray-600">{store.email}</p>
                      </div>
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-rose-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Утас</h4>
                        <p className="text-gray-600">{store.phone}</p>
                      </div>
                    </div>
                  )}
                  {!store.address && !store.email && !store.phone && (
                    <p className="text-gray-500">Холбоо барих мэдээлэл байхгүй байна.</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="stats" className="p-4 border rounded-md mt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-rose-50 rounded-lg p-4 text-center">
                    <h4 className="text-lg font-medium text-rose-600 mb-1">Бүтээгдэхүүний тоо</h4>
                    <p className="text-3xl font-bold">{store.productCount}</p>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-4 text-center">
                    <h4 className="text-lg font-medium text-rose-600 mb-1">Дундаж хямдрал</h4>
                    <p className="text-3xl font-bold">{store.averageDiscount}%</p>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-4 text-center">
                    <h4 className="text-lg font-medium text-rose-600 mb-1">Хамгийн их хямдрал</h4>
                    <p className="text-3xl font-bold">
                      {storeProducts.length > 0 ? Math.max(...storeProducts.map((p) => p.discountPercent)) : 0}%
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Store Products */}
            {storeProducts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Хямдралтай бүтээгдэхүүнүүд</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {storeProducts.slice(0, 8).map((product) => (
                    <Card key={product.id} className="overflow-hidden group">
                      <div className="relative h-48 bg-gray-100">
                        <Image
                          src={product.image || "/placeholder.svg?height=200&width=200&query=product"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 bg-rose-600 text-white px-2 py-1 rounded-md text-sm font-medium flex items-center">
                          <Percent className="h-3 w-3 mr-1" />
                          {product.discountPercent}%
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-1">
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                        <h3 className="font-medium text-base mb-2 line-clamp-1">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-600">{product.discountPrice.toLocaleString()}₮</span>
                            <span className="text-gray-500 line-through text-xs">
                              {product.originalPrice.toLocaleString()}₮
                            </span>
                          </div>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/products/${product.id}`}>Үзэх</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {storeProducts.length > 8 && (
                  <div className="mt-8 text-center">
                    <Button asChild>
                      <Link href={`/products?store=${store.id}`}>Бүх бүтээгдэхүүн үзэх</Link>
                    </Button>
                  </div>
                )}
              </section>
            )}
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10 px-4 mt-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Хямдрал Агрегатор</h3>
              <p className="mb-4">Бүх дэлгүүрүүдийн хямдралыг нэг дороос</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Холбоосууд</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Нүүр
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white transition-colors">
                    Бүтээгдэхүүн
                  </Link>
                </li>
                <li>
                  <Link href="/stores" className="hover:text-white transition-colors">
                    Дэлгүүр
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Холбоо барих</h4>
              <p className="mb-2">Улаанбаатар хот, Монгол улс</p>
              <p className="mb-2">Имэйл: info@khamdralaggregator.mn</p>
              <p>Утас: +976 8800 8800</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>© {new Date().getFullYear()} Хямдрал Агрегатор. Бүх эрх хуулиар хамгаалагдсан.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
