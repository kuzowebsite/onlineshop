"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import { ref, set } from "firebase/database"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import ImageUpload from "@/components/image-upload"
import { Switch } from "@/components/ui/switch"

import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"
import { useFirebase } from "@/components/firebase-provider"
import { useSiteSettings } from "@/components/site-provider"

export default function SettingsPage() {
  const router = useRouter()
  const { database } = useFirebase()
  const { settings: initialSettings } = useSiteSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState(initialSettings)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings)
    }
  }, [initialSettings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      maintenanceMode: checked,
    }))
  }

  const handleLogoChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      siteLogo: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!database) {
      toast({
        title: "Алдаа гарлаа",
        description: "Firebase өгөгдлийн сан холбогдоогүй байна.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Save settings to Firebase Realtime Database
      const settingsRef = ref(database, "settings")
      await set(settingsRef, settings)

      toast({
        title: "Амжилттай хадгаллаа",
        description: "Сайтын тохиргоо амжилттай хадгалагдлаа.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Тохиргоог хадгалахад алдаа гарлаа.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <div className="flex flex-col">
          <AdminHeader title="Тохиргоо" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
              <span className="mt-2">Ачааллаж байна...</span>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader title="Тохиргоо" />
        <main className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                <span className="mt-2">Өгөгдөл ачааллаж байна...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex justify-end mb-6">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
                </Button>
              </div>

              <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="general" onClick={() => setActiveTab("general")}>
                    Ерөнхий
                  </TabsTrigger>
                  <TabsTrigger value="contact" onClick={() => setActiveTab("contact")}>
                    Холбоо барих
                  </TabsTrigger>
                  <TabsTrigger value="social" onClick={() => setActiveTab("social")}>
                    Сошиал хаягууд
                  </TabsTrigger>
                  <TabsTrigger value="advanced" onClick={() => setActiveTab("advanced")}>
                    Нэмэлт тохиргоо
                  </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ерөнхий тохиргоо</CardTitle>
                      <CardDescription>Сайтын үндсэн мэдээлэл</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="siteName">Сайтын нэр</Label>
                        <Input
                          id="siteName"
                          name="siteName"
                          value={settings.siteName}
                          onChange={handleChange}
                          placeholder="Сайтын нэр"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteDescription">Сайтын тайлбар</Label>
                        <Textarea
                          id="siteDescription"
                          name="siteDescription"
                          value={settings.siteDescription}
                          onChange={handleChange}
                          placeholder="Сайтын тайлбар"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Сайтын лого</Label>
                        <ImageUpload
                          value={settings.siteLogo}
                          onChange={handleLogoChange}
                          label="Лого"
                          placeholder="Лого оруулах"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Contact Settings */}
                <TabsContent value="contact" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Холбоо барих мэдээлэл</CardTitle>
                      <CardDescription>Сайтын холбоо барих мэдээлэл</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Имэйл хаяг</Label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          value={settings.contactEmail}
                          onChange={handleChange}
                          placeholder="info@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Утасны дугаар</Label>
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          value={settings.contactPhone}
                          onChange={handleChange}
                          placeholder="+976 xxxx xxxx"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactAddress">Хаяг</Label>
                        <Textarea
                          id="contactAddress"
                          name="contactAddress"
                          value={settings.contactAddress}
                          onChange={handleChange}
                          placeholder="Хаяг"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Social Media Settings */}
                <TabsContent value="social" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Сошиал хаягууд</CardTitle>
                      <CardDescription>Сайтын сошиал хаягууд</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="facebookUrl">Facebook</Label>
                        <Input
                          id="facebookUrl"
                          name="facebookUrl"
                          value={settings.facebookUrl}
                          onChange={handleChange}
                          placeholder="https://facebook.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagramUrl">Instagram</Label>
                        <Input
                          id="instagramUrl"
                          name="instagramUrl"
                          value={settings.instagramUrl}
                          onChange={handleChange}
                          placeholder="https://instagram.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitterUrl">Twitter</Label>
                        <Input
                          id="twitterUrl"
                          name="twitterUrl"
                          value={settings.twitterUrl}
                          onChange={handleChange}
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="youtubeUrl">YouTube</Label>
                        <Input
                          id="youtubeUrl"
                          name="youtubeUrl"
                          value={settings.youtubeUrl}
                          onChange={handleChange}
                          placeholder="https://youtube.com/channel/username"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Advanced Settings */}
                <TabsContent value="advanced" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Нэмэлт тохиргоо</CardTitle>
                      <CardDescription>Сайтын нэмэлт тохиргоо</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="maintenanceMode">Засварын горим</Label>
                          <p className="text-sm text-muted-foreground">
                            Сайт засварын горимд орох үед хэрэглэгчид сайтыг үзэх боломжгүй болно.
                          </p>
                        </div>
                        <Switch
                          id="maintenanceMode"
                          checked={settings.maintenanceMode}
                          onCheckedChange={handleSwitchChange}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          )}
        </main>
      </div>
    </div>
  )
}
