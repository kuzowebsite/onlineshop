"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useFirebase } from "./firebase-provider"

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteLogo: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  facebookUrl: string
  instagramUrl: string
  twitterUrl: string
  youtubeUrl: string
  maintenanceMode: boolean
}

const defaultSettings: SiteSettings = {
  siteName: "Хямдрал Агрегатор",
  siteDescription: "Бүх дэлгүүрүүдийн хямдралыг нэг дороос",
  siteLogo: "",
  contactEmail: "info@khamdralaggregator.mn",
  contactPhone: "+976 8800 8800",
  contactAddress: "Улаанбаатар хот, Монгол улс",
  facebookUrl: "https://facebook.com/",
  instagramUrl: "https://instagram.com/",
  twitterUrl: "https://twitter.com/",
  youtubeUrl: "https://youtube.com/",
  maintenanceMode: false,
}

interface SiteContextType {
  settings: SiteSettings
  isLoading: boolean
  error: string | null
}

const SiteContext = createContext<SiteContextType>({
  settings: defaultSettings,
  isLoading: false,
  error: null,
})

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { database, isInitialized } = useFirebase()
  const [isBrowser, setIsBrowser] = useState(false)

  // Проверяем, что мы на клиенте
  useEffect(() => {
    setIsBrowser(typeof window !== "undefined")
  }, [])

  useEffect(() => {
    // Проверяем, что мы на клиенте и Firebase инициализирован
    if (!isBrowser || !isInitialized || !database) {
      return
    }

    const fetchSettings = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log("Fetching site settings...")
        // Динамически импортируем необходимые функции Firebase
        const { ref, get, child } = await import("firebase/database")

        const dbRef = ref(database)
        const snapshot = await get(child(dbRef, "settings"))

        if (snapshot.exists()) {
          console.log("Site settings found")
          setSettings(snapshot.val())
        } else {
          console.log("No site settings found, using defaults")
          // Если настройки не найдены, используем значения по умолчанию
          setSettings(defaultSettings)
        }
      } catch (error) {
        console.error("Error fetching site settings:", error)
        setError("Не удалось загрузить настройки сайта")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [database, isInitialized, isBrowser])

  return <SiteContext.Provider value={{ settings, isLoading, error }}>{children}</SiteContext.Provider>
}

export function useSiteSettings() {
  return useContext(SiteContext)
}
