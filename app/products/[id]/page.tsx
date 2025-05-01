"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ExternalLink, Percent, Store, Tag, Truck } from "lucide-react"
import { ref, get, child } from "firebase/database"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

import Header from "@/components/header"
import { useFirebase } from "@/components/firebase-provider"

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

interface ProductDetailProps {
  params: {
    id: string
  }
}

export default function ProductDetail({ params }: ProductDetailProps) {
  const { database, isInitialized } = useFirebase()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isInitialized || !database) return

    const fetchProductData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const dbRef = ref(database)

        // Получаем данные о текущем продукте
        const productSnapshot = await get(child(dbRef, `products/${params.id}`))

        if (productSnapshot.exists()) {
          const productData = {
            id: params.id,
            ...productSnapshot.val(),
          }
          setProduct(productData)

          // Получаем все продукты для отображения связанных
          const allProductsSnapshot = await get(child(dbRef, "products"))

          if (allProductsSnapshot.exists()) {
            const productsData = allProductsSnapshot.val()
            const productsArray: Product[] = []

            // Преобразуем объект в массив
            for (const key in productsData) {
              if (key !== params.id) {
                // Исключаем текущий продукт
                productsArray.push({
                  id: key,
                  ...productsData[key],
                })
              }
            }

            // Фильтруем связанные продукты (например, той же категории)
            const related = productsArray.filter((p) => p.category === productData.category).slice(0, 4) // Берем только 4 продукта

            setRelatedProducts(related)
          }
        } else {
          setError("Бүтээгдэхүүн олдсонгүй")
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Бүтээгдэхүүн ачаалахад алдаа гарлаа")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductData()
  }, [database, isInitialized, params.id])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Product Images Skeleton */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-100">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))}
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div className="space-y-6">
              <div>
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <div className="flex items-center gap-4 mb-6">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-1/2" />
              </div>

              <Skeleton className="h-24 w-full" />

              <div className="pt-4">
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-rose-600 text-lg mb-4">{error}</div>
            <Button onClick={() => window.location.reload()}>Дахин оролдох</Button>
          </div>
        ) : product ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-100">
                  <Image
                    src={product.image || "/placeholder.svg?height=500&width=500&query=product"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-rose-600 text-white px-2 py-1 rounded-md text-sm font-medium flex items-center">
                    <Percent className="h-3 w-3 mr-1" />
                    {product.discountPercent}%
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-md overflow-hidden border cursor-pointer bg-gray-100"
                    >
                      <Image
                        src={product.image || "/placeholder.svg?height=100&width=100&query=product"}
                        alt={`${product.name} thumbnail ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Store className="h-4 w-4 mr-1" />
                      {product.store}
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-700">{product.category}</span>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-rose-600">
                        {product.discountPrice.toLocaleString()}₮
                      </span>
                      <span className="text-gray-500 line-through">{product.originalPrice.toLocaleString()}₮</span>
                    </div>
                    <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-sm font-medium">
                      {product.discountPercent}% хямдрал
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Tag className="h-5 w-5" />
                    <span>Барааны код: {product.id.toString().padStart(6, "0")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Truck className="h-5 w-5" />
                    <span>Хүргэлт: 24-48 цагт</span>
                  </div>
                </div>

                <p className="text-gray-700">{product.description}</p>

                <div className="pt-4">
                  <Button size="lg" className="w-full md:w-auto" asChild>
                    <Link href={product.originalUrl} target="_blank" rel="noopener noreferrer">
                      Дэлгүүрийн сайт руу шилжих
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Details Tabs */}
            <Tabs defaultValue="details" className="mb-12">
              <TabsList className="grid w-full md:w-auto grid-cols-3">
                <TabsTrigger value="details">Дэлгэрэнгүй</TabsTrigger>
                <TabsTrigger value="specifications">Техникийн үзүүлэлт</TabsTrigger>
                <TabsTrigger value="reviews">Сэтгэгдэл</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="p-4 border rounded-md mt-2">
                <div className="prose max-w-none">
                  <h3>Бүтээгдэхүүний тухай</h3>
                  <p>{product.description}</p>
                  <p>
                    Энэхүү бүтээгдэхүүн нь нийт {product.store} дэлгүүрт {product.originalPrice.toLocaleString()}₮
                    үнэтэй байсан боловч одоогоор {product.discountPrice.toLocaleString()}₮ болж хямдарсан байна.
                    Хямдралыг ашиглахын тулд дэлгүүрийн сайт руу шилжиж худалдан авалтаа хийнэ үү.
                  </p>
                  <p>Хямдралын хугацаа: 2023.05.01 - 2023.06.01</p>
                </div>
              </TabsContent>
              <TabsContent value="specifications" className="p-4 border rounded-md mt-2">
                <div className="prose max-w-none">
                  <h3>Техникийн үзүүлэлт</h3>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Барааны код</td>
                        <td className="py-2">{product.id.toString().padStart(6, "0")}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Ангилал</td>
                        <td className="py-2">{product.category}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Дэлгүүр</td>
                        <td className="py-2">{product.store}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Хямдралын хувь</td>
                        <td className="py-2">{product.discountPercent}%</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Хямдралын хугацаа</td>
                        <td className="py-2">2023.05.01 - 2023.06.01</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="p-4 border rounded-md mt-2">
                <div className="prose max-w-none">
                  <h3>Хэрэглэгчдийн сэтгэгдэл</h3>
                  <p>Одоогоор энэ бүтээгдэхүүнд сэтгэгдэл байхгүй байна.</p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Төстэй бүтээгдэхүүнүүд</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((relProduct) => (
                    <Card key={relProduct.id} className="overflow-hidden group">
                      <div className="relative h-48 bg-gray-100">
                        <Image
                          src={relProduct.image || "/placeholder.svg?height=200&width=200&query=product"}
                          alt={relProduct.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 bg-rose-600 text-white px-2 py-1 rounded-md text-sm font-medium flex items-center">
                          <Percent className="h-3 w-3 mr-1" />
                          {relProduct.discountPercent}%
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-1 text-sm font-medium text-gray-500">{relProduct.store}</div>
                        <h3 className="font-medium text-base mb-2 line-clamp-1">{relProduct.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-600">
                              {relProduct.discountPrice.toLocaleString()}₮
                            </span>
                            <span className="text-gray-500 line-through text-xs">
                              {relProduct.originalPrice.toLocaleString()}₮
                            </span>
                          </div>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/products/${relProduct.id}`}>Үзэх</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
