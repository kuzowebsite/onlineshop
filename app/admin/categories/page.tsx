"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Plus, Search, Trash2 } from "lucide-react"
// Удаляем статические импорты Firebase
// import { ref, get, remove, child } from "firebase/database"

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
import { toast } from "@/components/ui/use-toast"

import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"
import { useFirebase } from "@/components/firebase-provider"

interface Category {
  id: string
  name: string
  description: string
}

export default function CategoriesPage() {
  const { database, isInitialized } = useFirebase()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Проверяем, что Firebase полностью инициализирован
    if (!isInitialized || !database) {
      console.log("Firebase not initialized yet or database is null, waiting...")
      return
    }

    const fetchCategories = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Проверяем database еще раз перед использованием
        if (!database) {
          throw new Error("Firebase database is not available")
        }

        // Динамически импортируем необходимые функции Firebase
        const { ref, get, child } = await import("firebase/database")

        const dbRef = ref(database)
        const snapshot = await get(child(dbRef, "categories"))

        if (snapshot.exists()) {
          const categoriesData = snapshot.val()
          const categoriesArray: Category[] = []

          // Convert object to array
          for (const key in categoriesData) {
            categoriesArray.push({
              id: key,
              ...categoriesData[key],
            })
          }

          setCategories(categoriesArray)
        } else {
          setCategories([])
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        setError("Не удалось загрузить категории")
        toast({
          title: "Алдаа гарлаа",
          description: "Ангилалуудыг ачаалахад алдаа гарлаа.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Добавляем небольшую задержку перед вызовом fetchCategories
    const timer = setTimeout(() => {
      fetchCategories()
    }, 1000)

    return () => clearTimeout(timer)
  }, [database, isInitialized])

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) => {
    return (
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleDeleteClick = (id: string) => {
    setDeleteCategoryId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteCategoryId || !database) return

    try {
      // Динамически импортируем необходимые функции Firebase
      const { ref, remove } = await import("firebase/database")

      const categoryRef = ref(database, `categories/${deleteCategoryId}`)
      await remove(categoryRef)

      // Update local state
      setCategories(categories.filter((category) => category.id !== deleteCategoryId))

      toast({
        title: "Амжилттай устгалаа",
        description: "Ангилал амжилттай устгагдлаа.",
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Ангилалыг устгахад алдаа гарлаа.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteCategoryId(null)
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader title="Ангилалууд" />
        <main className="flex-1 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Ангилал хайх..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button asChild>
              <Link href="/admin/categories/add">
                <Plus className="mr-2 h-4 w-4" /> Ангилал нэмэх
              </Link>
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Нэр</TableHead>
                  <TableHead className="hidden md:table-cell">Тайлбар</TableHead>
                  <TableHead className="text-right">Үйлдэл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
                        <span className="ml-2">Ачааллаж байна...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[500px] truncate">
                        {category.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/categories/edit/${category.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Засах</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(category.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Устгах</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Ангилал олдсонгүй.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Нийт <span className="font-medium">{filteredCategories.length}</span> ангилал
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ангилал устгах</DialogTitle>
            <DialogDescription>
              Та энэ ангилалыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
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
