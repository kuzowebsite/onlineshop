import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="bg-yellow-100 p-3 rounded-full inline-flex items-center justify-center mb-6">
          <AlertTriangle className="h-12 w-12 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Сайт засвартай байна</h1>
        <p className="text-gray-600 mb-8">
          Уучлаарай, манай сайт одоогоор засвартай байна. Бид тун удахгүй эргэн ирэх болно. Та дараа дахин зочлоорой.
        </p>
        <Button asChild>
          <Link href="/admin/login">Админ нэвтрэх</Link>
        </Button>
      </div>
    </div>
  )
}
