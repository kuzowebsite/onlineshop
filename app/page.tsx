import Link from "next/link"
import { ArrowRight, Percent, ShoppingBag, Store, Search, CheckCircle2, Clock, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import Header from "@/components/header"
import { Suspense } from "react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <main>
        {/* Hero Section */}
        <section className="py-12 px-4 md:py-24 lg:py-32 bg-gradient-to-r from-rose-100 to-pink-100">
          <div className="container mx-auto flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">Хямдрал Агрегатор</h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl">Бүх дэлгүүрүүдийн хямдралыг нэг дороос</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg">
                <Link href="/products">
                  Хямдралтай бүтээгдэхүүн үзэх <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg">
                <Link href="/stores">
                  Дэлгүүрүүд үзэх <Store className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Бидний үйлчилгээ</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Хямдрал Агрегатор нь Монголын олон дэлгүүрүүдийн хямдралтай бүтээгдэхүүнүүдийг нэг дор харуулж,
                хэрэглэгчдэд хамгийн хямд үнээр худалдан авах боломжийг олгодог.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-rose-100 p-3 rounded-full mb-4">
                    <Search className="h-8 w-8 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Хямдрал хайх</h3>
                  <p className="text-gray-600">
                    Олон дэлгүүрүүдийн хямдралыг нэг дороос хайж, хамгийн хямд үнийг олох боломжтой.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-rose-100 p-3 rounded-full mb-4">
                    <CheckCircle2 className="h-8 w-8 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Үнэ харьцуулалт</h3>
                  <p className="text-gray-600">
                    Ижил төрлийн бүтээгдэхүүнүүдийн үнийг хооронд нь харьцуулж, хамгийн ашигтай сонголтыг хийх.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-rose-100 p-3 rounded-full mb-4">
                    <Clock className="h-8 w-8 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Цаг хэмнэлт</h3>
                  <p className="text-gray-600">
                    Олон дэлгүүр тус бүрээр хайх шаардлагагүйгээр нэг дороос бүх хямдралыг харах боломжтой.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg">
                <Link href="/products">
                  Хямдралууд үзэх <Zap className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Яагаад бидний сайтыг сонгох вэ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Percent className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Хамгийн шилдэг хямдралууд</h3>
                <p className="text-gray-600">
                  Бид өдөр бүр олон дэлгүүрүүдийн хамгийн шилдэг хямдралтай бүтээгдэхүүнүүдийг цуглуулдаг
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Олон дэлгүүрүүд</h3>
                <p className="text-gray-600">Монголын шилдэг онлайн дэлгүүрүүдтэй хамтын ажиллагаатай</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Цаг хэмнэлт</h3>
                <p className="text-gray-600">
                  Бүх дэлгүүрүүдийн хямдралыг нэг дороос харж, хамгийн хямд үнээр худалдан авах боломжтой
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10 px-4">
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
