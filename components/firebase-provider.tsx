"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "firebase/auth"
import { firebaseConfig } from "@/lib/firebase-config"

// Определяем типы для контекста
interface FirebaseContextType {
  database: any | null
  auth: any | null
  user: User | null
  isInitialized: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<any>
  register: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
}

// Создаем контекст с начальными значениями
const FirebaseContext = createContext<FirebaseContextType>({
  database: null,
  auth: null,
  user: null,
  isInitialized: false,
  isLoading: true,
  login: async () => {
    throw new Error("Not implemented")
  },
  register: async () => {
    throw new Error("Not implemented")
  },
  logout: async () => {},
})

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [auth, setAuth] = useState<any>(null)
  const [database, setDatabase] = useState<any>(null)
  const [firebaseApp, setFirebaseApp] = useState<any>(null)
  const [initializationAttempts, setInitializationAttempts] = useState(0)
  const [isBrowser, setIsBrowser] = useState(false)

  // Проверяем, что мы на клиенте
  useEffect(() => {
    setIsBrowser(typeof window !== "undefined")
  }, [])

  // Инициализация Firebase App
  useEffect(() => {
    if (!isBrowser) return

    const initializeFirebaseApp = async () => {
      try {
        console.log("Initializing Firebase App...")
        const { initializeApp, getApps, getApp } = await import("firebase/app")

        let app
        if (getApps().length === 0) {
          console.log("Creating new Firebase app instance")
          app = initializeApp(firebaseConfig)
        } else {
          console.log("Firebase app already initialized")
          app = getApp()
        }

        setFirebaseApp(app)
        console.log("Firebase App initialized successfully")
      } catch (error) {
        console.error("Error initializing Firebase App:", error)
        // Если произошла ошибка, пробуем снова через некоторое время
        if (initializationAttempts < 5) {
          console.log(`Retrying Firebase App initialization (attempt ${initializationAttempts + 1}/5)...`)
          setTimeout(() => {
            setInitializationAttempts(initializationAttempts + 1)
          }, 2000)
        }
      }
    }

    initializeFirebaseApp()
  }, [isBrowser, initializationAttempts])

  // Инициализация Firebase Auth
  useEffect(() => {
    if (!firebaseApp) return

    const initializeAuth = async () => {
      try {
        console.log("Initializing Firebase Auth...")
        const { getAuth, onAuthStateChanged } = await import("firebase/auth")
        const authInstance = getAuth(firebaseApp)
        setAuth(authInstance)

        // Настройка слушателя состояния аутентификации
        onAuthStateChanged(
          authInstance,
          (currentUser: User | null) => {
            setUser(currentUser)
            console.log("Auth state changed, user:", currentUser ? "logged in" : "not logged in")
          },
          (error: any) => {
            console.error("Auth state change error:", error)
          },
        )

        console.log("Firebase Auth initialized successfully")
      } catch (error) {
        console.error("Error initializing Firebase Auth:", error)
      }
    }

    initializeAuth()
  }, [firebaseApp])

  // Инициализация Firebase Database
  useEffect(() => {
    if (!firebaseApp || !auth) return

    const initializeDatabase = async () => {
      try {
        console.log("Initializing Firebase Database...")
        const { getDatabase } = await import("firebase/database")
        const databaseInstance = getDatabase(firebaseApp)
        setDatabase(databaseInstance)
        setIsInitialized(true)
        setIsLoading(false)
        console.log("Firebase Database initialized successfully")
      } catch (error) {
        console.error("Error initializing Firebase Database:", error)
        setIsLoading(false)
      }
    }

    // Добавляем небольшую задержку перед инициализацией базы данных
    const timer = setTimeout(() => {
      initializeDatabase()
    }, 1000)

    return () => clearTimeout(timer)
  }, [firebaseApp, auth])

  // Функции аутентификации
  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized")

    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth")
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized")

    try {
      const { createUserWithEmailAndPassword } = await import("firebase/auth")
      return await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Register error:", error)
      throw error
    }
  }

  const logout = async () => {
    if (!auth) throw new Error("Auth not initialized")

    try {
      const { signOut } = await import("firebase/auth")
      return await signOut(auth)
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  return (
    <FirebaseContext.Provider
      value={{
        database,
        auth,
        user,
        isInitialized,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

export function useFirebase() {
  return useContext(FirebaseContext)
}
