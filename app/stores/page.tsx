"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Search } from "lucide-react"
import { ref, get, child } from "firebase/database"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

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
}

export default function StoresPage() {
  const { database, isInitialized } = useFirebase()
  const [stores, setStores] = useState<Store[]>([])
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Загрузка данных из Firebase
  useEffect(() => {
    if (!isInitialized || !database) return

    const fetchStores = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const dbRef = ref(database)
        const snapshot = await get(child(dbRef, "stores"))

        if (snapshot.exists()) {
          const storesData = snapshot.val()
          const storesArray: Store[] = []

          // Преобразуем объект в массив
          for (const key in storesData) {
            storesArray.push({
              id: key,
              ...storesData[key],
            })
          }

          setStores(storesArray)
          setFilteredStores(storesArray)
        } else {
          setStores([])
          setFilteredStores([])
          setError("Дэлгүүр олдсонгүй")
        }
      } catch (err) {
        console.error("Error fetching stores:", err)
        setError("Дэлгүүр ачаалахад алдаа гарлаа")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStores()
  }, [database, isInitialized])

  // Применение поиска
  useEffect(() => {
    if (stores.length === 0) return

    if (searchQuery) {
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredStores(filtered)
    } else {
      setFilteredStores(stores)
    }
  }, [stores, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Хамтрагч дэлгүүрүүд</h1>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Дэлгүүр хайх..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item}>
                <div className="relative h-40 bg-gray-50">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-28" />
                </CardFooter>
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

        {/* Stores Grid */}
        {!isLoading && !error && (
          <>
            {filteredStores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStores.map((store) => (
                  <Card key={store.id}>
                    <div className="relative h-40 bg-gray-50">
                      <Image
                        src={store.logo || "/placeholder.svg?height=200&width=400&query=store%20logo"}
                        alt={store.name}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{store.name}</CardTitle>
                      <CardDescription>{store.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-rose-50 rounded-lg p-3 flex-1">
                          <ShoppingBag className="h-6 w-6 text-rose-600 mb-1" />
                          <span className="text-sm text-gray-500">Бүтээгдэхүүн</span>
                          <span className="font-bold text-lg">{store.productCount}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-rose-50 rounded-lg p-3 flex-1">
                          <span className="font-bold text-rose-600 text-lg mb-1">%</span>
                          <span className="text-sm text-gray-500">Дундаж хямдрал</span>
                          <span className="font-bold text-lg">{store.averageDiscount}%</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button asChild variant="outline">
                        <Link href={`/products?store=${store.id}`}>Бүтээгдэхүүн үзэх</Link>
                      </Button>
                      <Button asChild>
                        <Link href={store.websiteUrl} target="_blank" rel="noopener noreferrer">
                          Дэлгүүрийн сайт
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Хайлтын үр дүн олдсонгүй</p>
                <Button onClick={() => setSearchQuery("")}>Шүүлтүүрийг цэвэрлэх</Button>
              </div>
            )}
          </>
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
