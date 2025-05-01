import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

import { FirebaseProvider } from "@/components/firebase-provider"
import { SiteProvider } from "@/components/site-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Хямдрал Агрегатор",
  description: "Бүх дэлгүүрүүдийн хямдралыг нэг дороос",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="mn">
      <body className={inter.className}>
        <FirebaseProvider>
          <SiteProvider>
            {children}
            <Toaster />
          </SiteProvider>
        </FirebaseProvider>
      </body>
    </html>
  )
}
