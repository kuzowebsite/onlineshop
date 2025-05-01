"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

import { useFirebase } from "@/components/firebase-provider"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteStoreId, setDeleteStoreId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Функция для загрузки данных из Firebase
  const fetchStores = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching stores data...")

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

      console.log("Getting stores data...")
      const snapshot = await get(child(dbRef, "stores"))

      console.log("Snapshot received:", snapshot.exists() ? "Data exists" : "No data")

      if (snapshot.exists()) {
        const storesData = snapshot.val()
        const storesArray: Store[] = []

        // Convert object to array
        for (const key in storesData) {
          storesArray.push({
            id: key,
            ...storesData[key],
          })
        }

        console.log(`Found ${storesArray.length} stores`)
        setStores(storesArray)
      } else {
        console.log("No stores found")
        setStores([])
      }
    } catch (error) {
      console.error("Error fetching stores:", error)
      setError("Дэлгүүрүүдийг ачаалахад алдаа гарлаа. Дахин оролдоно уу.")
      toast({
        title: "Алдаа гарлаа",
        description: "Дэлгүүрүүдийг ачаалахад алдаа гарлаа.",
        variant: "destructive",
      })
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
          console.log(`Retrying to fetch stores... (attempt ${retryCount + 1}/10)`)
          setRetryCount(retryCount + 1)
        }, 2000) // Пробуем снова через 2 секунды
        return () => clearTimeout(timer)
      } else {
        setError("Өгөгдлийн сантай холбогдож чадсангүй. Хуудсыг дахин ачаална уу.")
        setIsLoading(false)
        return
      }
    }

    fetchStores()
  }, [database, isInitialized, retryCount])

  // Filter stores based on search term
  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteClick = (id: string) => {
    setDeleteStoreId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteStoreId || !database) return

    try {
      const { ref, remove } = await import("firebase/database")
      const storeRef = ref(database, `stores/${deleteStoreId}`)
      await remove(storeRef)

      // Update local state
      setStores(stores.filter((store) => store.id !== deleteStoreId))

      toast({
        title: "Амжилттай устгалаа",
        description: "Дэлгүүр амжилттай устгагдлаа.",
      })
    } catch (error) {
      console.error("Error deleting store:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Дэлгүүрийг устгахад алдаа гарлаа.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteStoreId(null)
    }
  }

  const handleRetry = () => {
    setRetryCount(0)
    fetchStores()
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader title="Дэлгүүрүүд" />
        <main className="flex-1 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Дэлгүүр хайх..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button asChild>
              <Link href="/admin/stores/add">
                <Plus className="mr-2 h-4 w-4" /> Дэлгүүр нэмэх
              </Link>
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Лого</TableHead>
                  <TableHead>Нэр</TableHead>
                  <TableHead className="hidden md:table-cell">Тайлбар</TableHead>
                  <TableHead>Бүтээгдэхүүн</TableHead>
                  <TableHead>Дундаж хямдрал</TableHead>
                  <TableHead className="text-right">Үйлдэл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
                        <span className="ml-2">Ачааллаж байна...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-red-500">{error}</p>
                        <Button onClick={handleRetry}>Дахин оролдох</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredStores.length > 0 ? (
                  filteredStores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div className="h-12 w-12 relative rounded overflow-hidden">
                          <Image
                            src={store.logo || "/placeholder.svg"}
                            alt={store.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{store.name}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[300px] truncate">{store.description}</TableCell>
                      <TableCell>{store.productCount}</TableCell>
                      <TableCell>
                        <Badge className="bg-rose-500">{store.averageDiscount}%</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/stores/edit/${store.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Засах</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(store.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Устгах</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Дэлгүүр олдсонгүй.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Нийт <span className="font-medium">{filteredStores.length}</span> дэлгүүр
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Дэлгүүр устгах</DialogTitle>
            <DialogDescription>
              Та энэ дэлгүүрийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Устгах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
