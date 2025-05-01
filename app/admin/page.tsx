"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BarChart3, DollarSign, Package, Percent, ShoppingBag, Store, Users } from "lucide-react"
import { ref, get, child } from "firebase/database"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"
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

interface StoreType {
  id: string
  name: string
  description: string
  logo: string
  productCount: number
  averageDiscount: number
  websiteUrl: string
}

interface Category {
  id: string
  name: string
  description: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const { database, isInitialized } = useFirebase()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Состояния для данных
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<StoreType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Статистика
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalStores, setTotalStores] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalDiscountValue, setTotalDiscountValue] = useState(0)
  const [averageDiscount, setAverageDiscount] = useState(0)
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [categoryStats, setCategoryStats] = useState<{ [key: string]: number }>({})

  // Загрузка данных из Firebase
  useEffect(() => {
    if (!isInitialized || !database) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const dbRef = ref(database)

        // Загружаем продукты
        const productsSnapshot = await get(child(dbRef, "products"))
        let productsData: Product[] = []
        if (productsSnapshot.exists()) {
          const data = productsSnapshot.val()
          productsData = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
          setProducts(productsData)
          setTotalProducts(productsData.length)

          // Рассчитываем общую сумму скидок
          const discountValue = productsData.reduce(
            (total, product) => total + (product.originalPrice - product.discountPrice),
            0,
          )
          setTotalDiscountValue(discountValue)

          // Рассчитываем средний процент скидки
          const avgDiscount = Math.round(
            productsData.reduce((total, product) => total + product.discountPercent, 0) / productsData.length,
          )
          setAverageDiscount(avgDiscount)

          // Получаем последние 5 продуктов
          const recent = [...productsData].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5)
          setRecentProducts(recent)

          // Рассчитываем статистику по категориям
          const catStats: { [key: string]: number } = {}
          productsData.forEach((product) => {
            if (product.category) {
              if (!catStats[product.category]) {
                catStats[product.category] = 0
              }
              catStats[product.category] += product.discountPercent
            }
          })

          // Преобразуем в средние значения
          Object.keys(catStats).forEach((cat) => {
            const catProducts = productsData.filter((p) => p.category === cat)
            catStats[cat] = Math.round(catStats[cat] / catProducts.length)
          })

          setCategoryStats(catStats)
        }

        // Загружаем магазины
        const storesSnapshot = await get(child(dbRef, "stores"))
        if (storesSnapshot.exists()) {
          const data = storesSnapshot.val()
          const storesData = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
          setStores(storesData)
          setTotalStores(storesData.length)
        }

        // Загружаем категории
        const categoriesSnapshot = await get(child(dbRef, "categories"))
        if (categoriesSnapshot.exists()) {
          const data = categoriesSnapshot.val()
          const categoriesData = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
          setCategories(categoriesData)
        }

        // Загружаем пользователей
        const usersSnapshot = await get(child(dbRef, "users"))
        if (usersSnapshot.exists()) {
          const data = usersSnapshot.val()
          const usersData = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
          setUsers(usersData)
          setTotalUsers(usersData.length)
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Өгөгдөл ачаалахад алдаа гарлаа")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [database, isInitialized])

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader title="Хянах самбар" />
        <main className="flex-1 p-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview" onClick={() => setActiveTab("overview")}>
                Ерөнхий
              </TabsTrigger>
              <TabsTrigger value="analytics" onClick={() => setActiveTab("analytics")}>
                Статистик
              </TabsTrigger>
              <TabsTrigger value="reports" onClick={() => setActiveTab("reports")}>
                Тайлан
              </TabsTrigger>
              <TabsTrigger value="notifications" onClick={() => setActiveTab("notifications")}>
                Мэдэгдэл
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              // Состояние загрузки
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-20 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-60" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                  </Card>
                  <Card className="col-span-3">
                    <CardHeader>
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-60" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : error ? (
              // Состояние ошибки
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-rose-600 text-lg mb-4">{error}</div>
                  <Button onClick={() => window.location.reload()}>Дахин оролдох</Button>
                </div>
              </div>
            ) : (
              // Данные загружены успешно
              <>
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Нийт бүтээгдэхүүн</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                          {recentProducts.length > 0
                            ? `+${recentProducts.length} шинэ бүтээгдэхүүн нэмэгдсэн`
                            : "Шинэ бүтээгдэхүүн байхгүй"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Нийт дэлгүүр</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalStores}</div>
                        <p className="text-xs text-muted-foreground">
                          {stores.length > 0 ? `${stores.length} идэвхтэй дэлгүүр` : "Дэлгүүр байхгүй"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Нийт хямдрал</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalDiscountValue.toLocaleString()}₮</div>
                        <p className="text-xs text-muted-foreground">+12% өмнөх сараас</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Дундаж хямдрал</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{averageDiscount}%</div>
                        <p className="text-xs text-muted-foreground">+2% өмнөх сараас</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                      <CardHeader>
                        <CardTitle>Сүүлийн үеийн бүтээгдэхүүнүүд</CardTitle>
                        <CardDescription>Сүүлд нэмэгдсэн {recentProducts.length} бүтээгдэхүүн</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Нэр</TableHead>
                              <TableHead>Дэлгүүр</TableHead>
                              <TableHead>Үнэ</TableHead>
                              <TableHead>Хямдрал</TableHead>
                              <TableHead className="text-right">Үйлдэл</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentProducts.length > 0 ? (
                              recentProducts.map((product) => (
                                <TableRow key={product.id}>
                                  <TableCell className="font-medium">{product.name}</TableCell>
                                  <TableCell>{product.store}</TableCell>
                                  <TableCell>{product.discountPrice.toLocaleString()}₮</TableCell>
                                  <TableCell>{product.discountPercent}%</TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link href={`/admin/products/edit/${product.id}`}>Засах</Link>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                  Бүтээгдэхүүн олдсонгүй
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    <Card className="col-span-3">
                      <CardHeader>
                        <CardTitle>Хямдралын статистик</CardTitle>
                        <CardDescription>Ангилал бүрийн дундаж хямдрал</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.keys(categoryStats).length > 0 ? (
                            Object.keys(categoryStats).map((category) => (
                              <div key={category} className="flex items-center">
                                <div className="w-1/3 text-sm">{category}</div>
                                <div className="w-2/3 flex items-center gap-2">
                                  <div
                                    className="bg-rose-500 h-2 rounded-full"
                                    style={{ width: `${categoryStats[category]}%` }}
                                  ></div>
                                  <span className="text-sm">{categoryStats[category]}%</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-muted-foreground">Ангилалын мэдээлэл байхгүй</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Хэрэглэгчдийн үзэлт</CardTitle>
                      <CardDescription>Сүүлийн 30 хоногийн хэрэглэгчдийн үзэлт</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="h-[200px] flex items-end gap-2">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-rose-500 w-full rounded-t-md"
                            style={{
                              height: `${Math.max(15, Math.floor(Math.random() * 100))}%`,
                              opacity: 0.7 + i / 100,
                            }}
                          ></div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Нийт хэрэглэгч</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                          {users.length > 0 ? `+${users.length} идэвхтэй хэрэглэгч` : "Хэрэглэгч байхгүй"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Нийт үзэлт</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">45,678</div>
                        <p className="text-xs text-muted-foreground">+12% өмнөх сараас</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Дэлгүүрт шилжсэн</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">3,752</div>
                        <p className="text-xs text-muted-foreground">+8.2% өмнөх сараас</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="reports" className="space-y-4">
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Тайлангууд</h2>
                    <p className="text-muted-foreground mb-6">Энэ хэсэгт тайлангууд харагдах болно.</p>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card className="p-4">
                        <h3 className="font-medium mb-1">Сарын тайлан</h3>
                        <p className="text-sm text-muted-foreground mb-4">2023 оны 5-р сар</p>
                        <Button variant="outline" size="sm">
                          Татаж авах
                        </Button>
                      </Card>
                      <Card className="p-4">
                        <h3 className="font-medium mb-1">Улирлын тайлан</h3>
                        <p className="text-sm text-muted-foreground mb-4">2023 оны 2-р улирал</p>
                        <Button variant="outline" size="sm">
                          Татаж авах
                        </Button>
                      </Card>
                      <Card className="p-4">
                        <h3 className="font-medium mb-1">Жилийн тайлан</h3>
                        <p className="text-sm text-muted-foreground mb-4">2023 он</p>
                        <Button variant="outline" size="sm">
                          Татаж авах
                        </Button>
                      </Card>
                    </div>
                  </Card>
                </TabsContent>
                <TabsContent value="notifications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Мэдэгдэлүүд</CardTitle>
                      <CardDescription>Сүүлийн мэдэгдэлүүд</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentProducts.length > 0 ? (
                          <div className="flex items-start gap-4 rounded-lg border p-4">
                            <div className="rounded-full bg-rose-100 p-2">
                              <Package className="h-4 w-4 text-rose-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">Шинэ бүтээгдэхүүн нэмэгдлээ</h4>
                              <p className="text-sm text-muted-foreground">
                                "{recentProducts[0].name}" бүтээгдэхүүн нэмэгдлээ.
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">2 цагийн өмнө</p>
                            </div>
                          </div>
                        ) : null}
                        {stores.length > 0 ? (
                          <div className="flex items-start gap-4 rounded-lg border p-4">
                            <div className="rounded-full bg-rose-100 p-2">
                              <Store className="h-4 w-4 text-rose-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">Шинэ дэлгүүр нэмэгдлээ</h4>
                              <p className="text-sm text-muted-foreground">"{stores[0].name}" дэлгүүр нэмэгдлээ.</p>
                              <p className="text-xs text-muted-foreground mt-1">1 өдрийн өмнө</p>
                            </div>
                          </div>
                        ) : null}
                        {recentProducts.length > 1 ? (
                          <div className="flex items-start gap-4 rounded-lg border p-4">
                            <div className="rounded-full bg-rose-100 p-2">
                              <Percent className="h-4 w-4 text-rose-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">Хямдрал шинэчлэгдлээ</h4>
                              <p className="text-sm text-muted-foreground">
                                "{recentProducts[1].name}" бүтээгдэхүүний хямдрал {recentProducts[1].discountPercent}%
                                болж өөрчлөгдлөө.
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">2 өдрийн өмнө</p>
                            </div>
                          </div>
                        ) : null}
                        {recentProducts.length === 0 && stores.length === 0 && (
                          <div className="text-center text-muted-foreground py-8">Мэдэгдэл байхгүй</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  )
}
