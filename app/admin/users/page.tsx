"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Plus, Search, Trash2, Shield, User } from "lucide-react"

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { useFirebase } from "@/components/firebase-provider"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"

interface UserType {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  avatar: string
  createdAt: string
  lastLogin?: string
  status: "active" | "inactive"
}

export default function UsersPage() {
  const { database, isInitialized } = useFirebase()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [users, setUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Функция для загрузки данных из Firebase
  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching users data...")

      // Проверяем, что database не null перед использованием
      if (!database) {
        console.log("Database is null, waiting for initialization...")
        setError("Өгөгдлийн сантай холбогдож чадсангүй. Дахин оролдоно уу.")
        return
      }

      // Динамически импортируем необходимые функции
      const { ref, get, child } = await import("firebase/database")

      console.log("Creating database reference...")
      const dbRef = ref(database)

      console.log("Getting users data...")
      const snapshot = await get(child(dbRef, "users"))

      console.log("Snapshot received:", snapshot.exists() ? "Data exists" : "No data")

      if (snapshot.exists()) {
        const usersData = snapshot.val()
        const usersArray: UserType[] = []

        // Convert object to array
        for (const key in usersData) {
          usersArray.push({
            id: key,
            ...usersData[key],
          })
        }

        console.log(`Found ${usersArray.length} users`)
        setUsers(usersArray)
      } else {
        console.log("No users found")
        setUsers([])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Хэрэглэгчдийг ачаалахад алдаа гарлаа. Дахин оролдоно уу.")
      toast({
        title: "Алдаа гарлаа",
        description: "Хэрэглэгчдийг ачаалахад алдаа гарлаа.",
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
          console.log(`Retrying to fetch users... (attempt ${retryCount + 1}/10)`)
          setRetryCount(retryCount + 1)
        }, 2000) // Пробуем снова через 2 секунды
        return () => clearTimeout(timer)
      } else {
        setError("Өгөгдлийн сантай холбогдож чадсангүй. Хуудсыг дахин ачаална уу.")
        setIsLoading(false)
        return
      }
    }

    fetchUsers()
  }, [database, isInitialized, retryCount])

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteClick = (id: string) => {
    setDeleteUserId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteUserId || !database) return

    try {
      // Динамически импортируем необходимые функции
      const { ref, remove } = await import("firebase/database")

      const userRef = ref(database, `users/${deleteUserId}`)
      await remove(userRef)

      // Update local state
      setUsers(users.filter((user) => user.id !== deleteUserId))

      toast({
        title: "Амжилттай устгалаа",
        description: "Хэрэглэгч амжилттай устгагдлаа.",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Хэрэглэгчийг устгахад алдаа гарлаа.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteUserId(null)
    }
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
    if (!database) {
      toast({
        title: "Алдаа гарлаа",
        description: "Firebase өгөгдлийн сан холбогдоогүй байна.",
        variant: "destructive",
      })
      return
    }

    try {
      // Динамически импортируем необходимые функции
      const { ref, update } = await import("firebase/database")

      const userRef = ref(database, `users/${userId}`)
      await update(userRef, { role: newRole })

      // Update local state
      setUsers(
        users.map((user) => {
          if (user.id === userId) {
            return { ...user, role: newRole }
          }
          return user
        }),
      )

      toast({
        title: "Амжилттай шинэчлэгдлээ",
        description: `Хэрэглэгчийн эрх ${newRole === "admin" ? "админ" : "энгийн хэрэглэгч"} болж өөрчлөгдлөө.`,
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Хэрэглэгчийн эрхийг өөрчлөхөд алдаа гарлаа.",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (userId: string, newStatus: "active" | "inactive") => {
    if (!database) {
      toast({
        title: "Алдаа гарлаа",
        description: "Firebase өгөгдлийн сан холбогдоогүй байна.",
        variant: "destructive",
      })
      return
    }

    try {
      // Динамически импортируем необходимые функции
      const { ref, update } = await import("firebase/database")

      const userRef = ref(database, `users/${userId}`)
      await update(userRef, { status: newStatus })

      // Update local state
      setUsers(
        users.map((user) => {
          if (user.id === userId) {
            return { ...user, status: newStatus }
          }
          return user
        }),
      )

      toast({
        title: "Амжилттай шинэчлэгдлээ",
        description: `Хэрэглэгчийн төлөв ${newStatus === "active" ? "идэвхтэй" : "идэвхгүй"} болж өөрчлөгдлөө.`,
      })
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Хэрэглэгчийн төлөвийг өөрчлөхөд алдаа гарлаа.",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    setRetryCount(0)
    fetchUsers()
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader title="Хэрэглэгчид" />
        <main className="flex-1 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Хэрэглэгч хайх..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button asChild>
              <Link href="/admin/users/add">
                <Plus className="mr-2 h-4 w-4" /> Хэрэглэгч нэмэх
              </Link>
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Зураг</TableHead>
                  <TableHead>Нэр</TableHead>
                  <TableHead>Имэйл</TableHead>
                  <TableHead>Эрх</TableHead>
                  <TableHead>Төлөв</TableHead>
                  <TableHead>Бүртгүүлсэн</TableHead>
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
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-red-500">{error}</p>
                        <Button onClick={handleRetry}>Дахин оролдох</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="h-10 w-10 relative rounded-full overflow-hidden">
                          <Image
                            src={user.avatar || "/placeholder.svg?height=40&width=40&query=user"}
                            alt={user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>
                          {user.role === "admin" ? "Админ" : "Хэрэглэгч"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === "active" ? "success" : "secondary"}
                          className={user.status === "active" ? "bg-green-500" : ""}
                        >
                          {user.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString("mn-MN")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Shield className="h-4 w-4" />
                                <span className="sr-only">Эрх</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")}>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Админ болгох</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRoleChange(user.id, "user")}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Хэрэглэгч болгох</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(user.id, "active")}>
                                <span>Идэвхжүүлэх</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(user.id, "inactive")}>
                                <span>Идэвхгүй болгох</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/users/edit/${user.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Засах</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user.id)}>
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
                      Хэрэглэгч олдсонгүй.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Нийт <span className="font-medium">{filteredUsers.length}</span> хэрэглэгч
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Хэрэглэгч устгах</DialogTitle>
            <DialogDescription>
              Та энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
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
