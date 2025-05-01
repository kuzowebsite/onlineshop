"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { ArrowDown, ArrowUp, Package, Percent, StoreIcon, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

import { useFirebase } from "@/components/firebase-provider"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"

// Types
interface Product {
  id: string
  name: string
  category: string
  store: string
  originalPrice: number
  discountPrice: number
  discountPercent: number
}

interface StoreType {
  id: string
  name: string
  productCount: number
  averageDiscount: number
}

interface User {
  id: string
  name: string
  role: string
  status: string
  createdAt: string
}

interface CategoryData {
  name: string
  count: number
  averageDiscount: number
}

interface StorePerformance {
  name: string
  productCount: number
  averageDiscount: number
}

interface MonthlyData {
  name: string
  products: number
  users: number
  discount: number
}

// Colors for charts
const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#8AC926", "#1982C4", "#6A4C93"]

export default function AnalyticsPage() {
  const { database, isInitialized } = useFirebase()
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("month")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<StoreType[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [storePerformance, setStorePerformance] = useState<StorePerformance[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

  // Statistics
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalStores, setTotalStores] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [averageDiscount, setAverageDiscount] = useState(0)
  const [productGrowth, setProductGrowth] = useState(0)
  const [userGrowth, setUserGrowth] = useState(0)
  const [storeGrowth, setStoreGrowth] = useState(0)
  const [discountGrowth, setDiscountGrowth] = useState(0)

  // Функция для загрузки данных из Firebase
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching analytics data...")

      // Проверяем, что database не null перед использованием
      if (!database) {
        console.log("Database is null, waiting for initialization...")
        setError("Өгөгдлийн сантай холбогдож чадсангүй. Дахин оролдоно уу.")
        return
      }

      // Динамически импортируем необходимые функции Firebase
      const { ref, get, child } = await import("firebase/database")

      console.log("Creating database reference...")
      const dbRef = ref(database)

      // Fetch products
      console.log("Getting products data...")
      const productsSnapshot = await get(child(dbRef, "products"))
      let productsData: Product[] = []

      if (productsSnapshot.exists()) {
        console.log("Products data exists")
        const data = productsSnapshot.val()
        productsData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
        setProducts(productsData)
        setTotalProducts(productsData.length)

        // Calculate average discount
        const totalDiscount = productsData.reduce((sum, product) => sum + product.discountPercent, 0)
        setAverageDiscount(Math.round(totalDiscount / productsData.length))

        // Process category data
        const categories: { [key: string]: { count: number; totalDiscount: number } } = {}
        productsData.forEach((product) => {
          if (!categories[product.category]) {
            categories[product.category] = { count: 0, totalDiscount: 0 }
          }
          categories[product.category].count += 1
          categories[product.category].totalDiscount += product.discountPercent
        })

        const categoryDataArray = Object.keys(categories).map((name) => ({
          name,
          count: categories[name].count,
          averageDiscount: Math.round(categories[name].totalDiscount / categories[name].count),
        }))
        setCategoryData(categoryDataArray)
      } else {
        console.log("No products data found")
      }

      // Fetch stores
      console.log("Getting stores data...")
      const storesSnapshot = await get(child(dbRef, "stores"))
      let storesData: StoreType[] = []

      if (storesSnapshot.exists()) {
        console.log("Stores data exists")
        const data = storesSnapshot.val()
        storesData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
        setStores(storesData)
        setTotalStores(storesData.length)

        // Process store performance data
        const storePerformanceData = storesData.map((store) => ({
          name: store.name,
          productCount: store.productCount,
          averageDiscount: store.averageDiscount,
        }))
        setStorePerformance(storePerformanceData)
      } else {
        console.log("No stores data found")
      }

      // Fetch users
      console.log("Getting users data...")
      const usersSnapshot = await get(child(dbRef, "users"))
      let usersData: User[] = []

      if (usersSnapshot.exists()) {
        console.log("Users data exists")
        const data = usersSnapshot.val()
        usersData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
        setUsers(usersData)
        setTotalUsers(usersData.length)
      } else {
        console.log("No users data found")
      }

      // Generate monthly data (simulated)
      const months = [
        "1-р сар",
        "2-р сар",
        "3-р сар",
        "4-р сар",
        "5-р сар",
        "6-р сар",
        "7-р сар",
        "8-р сар",
        "9-р сар",
        "10-р сар",
        "11-р сар",
        "12-р сар",
      ]
      const monthlyDataArray = months.map((name, index) => {
        // Simulate some growth pattern
        const baseProducts = 10 + index * 5
        const baseUsers = 5 + index * 2
        const baseDiscount = 10 + (index % 5)

        return {
          name,
          products: baseProducts + Math.floor(Math.random() * 10),
          users: baseUsers + Math.floor(Math.random() * 5),
          discount: baseDiscount + Math.floor(Math.random() * 5),
        }
      })
      setMonthlyData(monthlyDataArray)

      // Calculate growth rates (simulated)
      setProductGrowth(12.5)
      setUserGrowth(8.3)
      setStoreGrowth(5.2)
      setDiscountGrowth(-2.1)

      console.log("Analytics data fetched successfully")
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Өгөгдөл ачаалахад алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      setIsLoading(false)
    }
  }

  // Загрузка данных при инициализации компонента
  useEffect(() => {
    // Если Firebase не инициализирован или database равен null, пробуем снова через некоторое время
    if (!isInitialized || !database) {
      if (retryCount < 10) {
        const timer = setTimeout(() => {
          console.log(`Retrying to fetch analytics data... (attempt ${retryCount + 1}/10)`)
          setRetryCount(retryCount + 1)
        }, 2000) // Пробуем снова через 2 секунды
        return () => clearTimeout(timer)
      } else {
        setError("Өгөгдлийн сантай холбогдож чадсангүй. Хуудсыг дахин ачаална уу.")
        setIsLoading(false)
        return
      }
    }

    fetchData()
  }, [database, isInitialized, retryCount])

  const handleRetry = () => {
    setRetryCount(0)
    fetchData()
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader title="Статистик" />
        <main className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                <span className="mt-2">Өгөгдөл ачааллаж байна...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <p className="text-red-500 text-lg">{error}</p>
              <Button onClick={handleRetry}>Дахин оролдох</Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Статистик мэдээлэл</h2>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Хугацаа сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">7 хоног</SelectItem>
                    <SelectItem value="month">30 хоног</SelectItem>
                    <SelectItem value="quarter">Улирал</SelectItem>
                    <SelectItem value="year">Жил</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview" onClick={() => setActiveTab("overview")}>
                    Ерөнхий
                  </TabsTrigger>
                  <TabsTrigger value="products" onClick={() => setActiveTab("products")}>
                    Бүтээгдэхүүн
                  </TabsTrigger>
                  <TabsTrigger value="stores" onClick={() => setActiveTab("stores")}>
                    Дэлгүүр
                  </TabsTrigger>
                  <TabsTrigger value="users" onClick={() => setActiveTab("users")}>
                    Хэрэглэгч
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Нийт бүтээгдэхүүн</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          {productGrowth > 0 ? (
                            <>
                              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                              <span className="text-green-500">+{productGrowth}%</span>
                            </>
                          ) : (
                            <>
                              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                              <span className="text-red-500">{productGrowth}%</span>
                            </>
                          )}
                          <span className="ml-1">
                            өмнөх{" "}
                            {timeRange === "week"
                              ? "7 хоногоос"
                              : timeRange === "month"
                                ? "сараас"
                                : timeRange === "quarter"
                                  ? "улирлаас"
                                  : "жилээс"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Нийт дэлгүүр</CardTitle>
                        <StoreIcon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalStores}</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          {storeGrowth > 0 ? (
                            <>
                              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                              <span className="text-green-500">+{storeGrowth}%</span>
                            </>
                          ) : (
                            <>
                              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                              <span className="text-red-500">{storeGrowth}%</span>
                            </>
                          )}
                          <span className="ml-1">
                            өмнөх{" "}
                            {timeRange === "week"
                              ? "7 хоногоос"
                              : timeRange === "month"
                                ? "сараас"
                                : timeRange === "quarter"
                                  ? "улирлаас"
                                  : "жилээс"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Нийт хэрэглэгч</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          {userGrowth > 0 ? (
                            <>
                              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                              <span className="text-green-500">+{userGrowth}%</span>
                            </>
                          ) : (
                            <>
                              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                              <span className="text-red-500">{userGrowth}%</span>
                            </>
                          )}
                          <span className="ml-1">
                            өмнөх{" "}
                            {timeRange === "week"
                              ? "7 хоногоос"
                              : timeRange === "month"
                                ? "сараас"
                                : timeRange === "quarter"
                                  ? "улирлаас"
                                  : "жилээс"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Дундаж хямдрал</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{averageDiscount}%</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          {discountGrowth > 0 ? (
                            <>
                              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                              <span className="text-green-500">+{discountGrowth}%</span>
                            </>
                          ) : (
                            <>
                              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                              <span className="text-red-500">{discountGrowth}%</span>
                            </>
                          )}
                          <span className="ml-1">
                            өмнөх{" "}
                            {timeRange === "week"
                              ? "7 хоногоос"
                              : timeRange === "month"
                                ? "сараас"
                                : timeRange === "quarter"
                                  ? "улирлаас"
                                  : "жилээс"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                      <CardHeader>
                        <CardTitle>Сарын статистик</CardTitle>
                        <CardDescription>Сүүлийн 12 сарын өсөлт</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={monthlyData}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="products"
                                stroke="#FF6384"
                                activeDot={{ r: 8 }}
                                name="Бүтээгдэхүүн"
                              />
                              <Line type="monotone" dataKey="users" stroke="#36A2EB" name="Хэрэглэгч" />
                              <Line type="monotone" dataKey="discount" stroke="#FFCE56" name="Хямдрал %" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="col-span-3">
                      <CardHeader>
                        <CardTitle>Ангилал</CardTitle>
                        <CardDescription>Бүтээгдэхүүний ангилал</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value, name, props) => [`${value} бүтээгдэхүүн`, props.payload.name]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ангилал бүрийн дундаж хямдрал</CardTitle>
                      <CardDescription>Ангилал бүрийн бүтээгдэхүүний дундаж хямдрал</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={categoryData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value}%`, "Дундаж хямдрал"]} />
                            <Legend />
                            <Bar dataKey="averageDiscount" fill="#FF6384" name="Дундаж хямдрал %" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ангилал бүрийн бүтээгдэхүүний тоо</CardTitle>
                      <CardDescription>Ангилал бүрийн бүтээгдэхүүний тоо</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={categoryData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value} бүтээгдэхүүн`, "Бүтээгдэхүүний тоо"]} />
                            <Legend />
                            <Bar dataKey="count" fill="#36A2EB" name="Бүтээгдэхүүний тоо" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Stores Tab */}
                <TabsContent value="stores" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Дэлгүүр бүрийн бүтээгдэхүүний тоо</CardTitle>
                      <CardDescription>Дэлгүүр бүрийн бүтээгдэхүүний тоо</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={storePerformance}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value} бүтээгдэхүүн`, "Бүтээгдэхүүний тоо"]} />
                            <Legend />
                            <Bar dataKey="productCount" fill="#FFCE56" name="Бүтээгдэхүүний тоо" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Дэлгүүр бүрийн дундаж хямдрал</CardTitle>
                      <CardDescription>Дэлгүүр бүрийн бүтээгдэхүүний дундаж хямдрал</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={storePerformance}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value}%`, "Дундаж хямдрал"]} />
                            <Legend />
                            <Bar dataKey="averageDiscount" fill="#4BC0C0" name="Дундаж хямдрал %" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Хэрэглэгчийн эрх</CardTitle>
                        <CardDescription>Хэрэглэгчдийн эрхийн хуваарилалт</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Админ", value: users.filter((user) => user.role === "admin").length },
                                  { name: "Хэрэглэгч", value: users.filter((user) => user.role === "user").length },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                <Cell fill="#FF6384" />
                                <Cell fill="#36A2EB" />
                              </Pie>
                              <Tooltip formatter={(value) => [`${value} хэрэглэгч`, ""]} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Хэрэглэгчийн төлөв</CardTitle>
                        <CardDescription>Хэрэглэгчдийн төлөвийн хуваарилалт</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Идэвхтэй", value: users.filter((user) => user.status === "active").length },
                                  {
                                    name: "Идэвхгүй",
                                    value: users.filter((user) => user.status === "inactive").length,
                                  },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                <Cell fill="#4BC0C0" />
                                <Cell fill="#FFCE56" />
                              </Pie>
                              <Tooltip formatter={(value) => [`${value} хэрэглэгч`, ""]} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Хэрэглэгчийн бүртгэл</CardTitle>
                      <CardDescription>Сарын хэрэглэгчийн бүртгэлийн тоо</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={monthlyData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value} хэрэглэгч`, "Шинэ хэрэглэгч"]} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="users"
                              stroke="#9966FF"
                              activeDot={{ r: 8 }}
                              name="Шинэ хэрэглэгч"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
