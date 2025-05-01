"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Plus, Search, Trash2 } from "lucide-react"
// Удаляем: import { ref, get, remove, child } from "firebase/database"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  category: string
  store: string
  image: string
  originalUrl: string
}

export default function ProductsPage() {
  const { database, isInitialized } = useFirebase()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [storeFilter, setStoreFilter] = useState("all")
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [stores, setStores] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Добавляем проверку на инициализацию Firebase
    if (!isInitialized || !database) {
      console.log("Firebase not initialized yet, waiting...")
      return
    }

    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        // Проверяем, что database не null
        if (!database) {
          throw new Error("Firebase database is not available")
        }

        // Динамически импортируем необходимые функции Firebase
        const { ref, get, child } = await import("firebase/database")

        const dbRef = ref(database)
        const snapshot = await get(child(dbRef, "products"))

        if (snapshot.exists()) {
          const productsData = snapshot.val()
          const productsArray: Product[] = []

          // Convert object to array
          for (const key in productsData) {
            productsArray.push({
              id: key,
              ...productsData[key],
            })
          }

          setProducts(productsArray)

          // Extract unique categories and stores
          const uniqueCategories = Array.from(new Set(productsArray.map((product) => product.category)))
          const uniqueStores = Array.from(new Set(productsArray.map((product) => product.store)))

          setCategories(uniqueCategories)
          setStores(uniqueStores)
        } else {
          setProducts([])
          setCategories([])
          setStores([])
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Бүтээгдэхүүнүүдийг ачаалахад алдаа гарлаа.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Добавляем небольшую задержку перед вызовом fetchProducts
    const timer = setTimeout(() => {
      fetchProducts()
    }, 500)

    return () => clearTimeout(timer)
  }, [database, isInitialized])

  // Filter products based on search term and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStore = storeFilter === "all" || product.store === storeFilter

    return matchesSearch && matchesCategory && matchesStore
  })

  const handleDeleteClick = (id: string) => {
    setDeleteProductId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteProductId || !database) return

    try {
      // Динамически импортируем необходимые функции Firebase
      const { ref, remove } = await import("firebase/database")

      const productRef = ref(database, `products/${deleteProductId}`)
      await remove(productRef)

      // Update local state
      setProducts(products.filter((product) => product.id !== deleteProductId))

      toast({
        title: "Амжилттай устгалаа",
        description: "Бүтээгдэхүүн амжилттай устгагдлаа.",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Бүтээгдэхүүнийг устгахад алдаа гарлаа.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteProductId(null)
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader title="Бүтээгдэхүүнүүд" />
        <main className="flex-1 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Бүтээгдэхүүн хайх..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ангилал" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх ангилал</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Дэлгүүр" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх дэлгүүр</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store} value={store}>
                      {store}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button asChild>
              <Link href="/admin/products/add">
                <Plus className="mr-2 h-4 w-4" /> Бүтээгдэхүүн нэмэх
              </Link>
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Зураг</TableHead>
                  <TableHead>Нэр</TableHead>
                  <TableHead>Ангилал</TableHead>
                  <TableHead>Дэлгүүр</TableHead>
                  <TableHead>Үнэ</TableHead>
                  <TableHead>Хямдрал</TableHead>
                  <TableHead className="text-right">Үйлдэл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
                        <span className="ml-2">Ачааллаж байна...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="h-12 w-12 relative rounded overflow-hidden">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate" title={product.name}>
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{product.store}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.discountPrice.toLocaleString()}₮</span>
                          <span className="text-sm text-muted-foreground line-through">
                            {product.originalPrice.toLocaleString()}₮
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-rose-500">{product.discountPercent}%</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/products/edit/${product.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Засах</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Устгах</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Бүтээгдэхүүн олдсонгүй.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Нийт <span className="font-medium">{filteredProducts.length}</span> бүтээгдэхүүн
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Бүтээгдэхүүн устгах</DialogTitle>
            <DialogDescription>
              Та энэ бүтээгдэхүүнийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
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
