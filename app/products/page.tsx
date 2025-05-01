"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Percent } from "lucide-react"
import { ref, get, child } from "firebase/database"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function ProductsPage() {
  const { database, isInitialized } = useFirebase()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Фильтры и сортировка
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStore, setSelectedStore] = useState("all")
  const [sortOrder, setSortOrder] = useState("discount-high")
  const [stores, setStores] = useState<string[]>([])

  // Загрузка данных из Firebase
  useEffect(() => {
    if (!isInitialized || !database) return

    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const dbRef = ref(database)
        const snapshot = await get(child(dbRef, "products"))

        if (snapshot.exists()) {
          const productsData = snapshot.val()
          const productsArray: Product[] = []

          // Преобразуем объект в массив
          for (const key in productsData) {
            productsArray.push({
              id: key,
              ...productsData[key],
            })
          }

          setProducts(productsArray)
          setFilteredProducts(productsArray)

          // Получаем уникальные магазины для фильтра
          const uniqueStores = Array.from(new Set(productsArray.map((product) => product.store)))
          setStores(uniqueStores)
        } else {
          setProducts([])
          setFilteredProducts([])
          setError("Бүтээгдэхүүн олдсонгүй")
        }
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("Бүтээгдэхүүн ачаалахад алдаа гарлаа")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [database, isInitialized])

  // Применение фильтров и сортировки
  useEffect(() => {
    if (products.length === 0) return

    let result = [...products]

    // Применяем поиск
    if (searchQuery) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Применяем фильтр по магазину
    if (selectedStore !== "all") {
      result = result.filter((product) => product.store === selectedStore)
    }

    // Применяем сортировку
    switch (sortOrder) {
      case "discount-high":
        result.sort((a, b) => b.discountPercent - a.discountPercent)
        break
      case "discount-low":
        result.sort((a, b) => a.discountPercent - b.discountPercent)
        break
      case "price-low":
        result.sort((a, b) => a.discountPrice - b.discountPrice)
        break
      case "price-high":
        result.sort((a, b) => b.discountPrice - a.discountPrice)
        break
      case "newest":
        // Предполагаем, что более новые товары имеют больший ID
        result.sort((a, b) => Number(b.id) - Number(a.id))
        break
    }

    setFilteredProducts(result)
  }, [products, searchQuery, selectedStore, sortOrder])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Хямдралтай бүтээгдэхүүнүүд</h1>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Хайх..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger>
                <SelectValue placeholder="Дэлгүүр сонгох" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх дэлгүүрүүд</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store} value={store}>
                    {store}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Эрэмбэлэх" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount-high">Хямдрал (Их - Бага)</SelectItem>
                <SelectItem value="discount-low">Хямдрал (Бага - Их)</SelectItem>
                <SelectItem value="price-low">Үнэ (Бага - Их)</SelectItem>
                <SelectItem value="price-high">Үнэ (Их - Бага)</SelectItem>
                <SelectItem value="newest">Шинэ нь эхэндээ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Card key={item} className="overflow-hidden">
                <div className="relative h-64 bg-gray-100">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-6 w-full mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <div className="text-rose-600 text-lg mb-4">{error}</div>
            <Button onClick={() => window.location.reload()}>Дахин оролдох</Button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden group">
                    <div className="relative h-64 bg-gray-100">
                      <Image
                        src={product.image || "/placeholder.svg?height=300&width=300&query=product"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-rose-600 text-white px-2 py-1 rounded-md text-sm font-medium flex items-center">
                        <Percent className="h-3 w-3 mr-1" />
                        {product.discountPercent}%
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="mb-2 text-sm font-medium text-gray-500">{product.store}</div>
                      <h3 className="font-medium text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-600 text-xl">
                            {product.discountPrice.toLocaleString()}₮
                          </span>
                          <span className="text-gray-500 line-through text-sm">
                            {product.originalPrice.toLocaleString()}₮
                          </span>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/products/${product.id}`}>Дэлгэрэнгүй</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Хайлтын үр дүн олдсонгүй</p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedStore("all")
                    setSortOrder("discount-high")
                  }}
                >
                  Шүүлтүүрийг цэвэрлэх
                </Button>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!isLoading && !error && filteredProducts.length > 0 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center gap-1">
              <Button variant="outline" size="icon" disabled>
                <span className="sr-only">Өмнөх хуудас</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
              <Button variant="outline" size="sm" className="font-medium bg-rose-50">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                4
              </Button>
              <Button variant="outline" size="sm">
                5
              </Button>
              <Button variant="outline" size="icon">
                <span className="sr-only">Дараагийн хуудас</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </nav>
          </div>
        )}
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
