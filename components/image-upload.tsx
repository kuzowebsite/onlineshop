"use client"

import { useState, useRef, type ChangeEvent } from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
}

export default function ImageUpload({
  value,
  onChange,
  label = "Зураг",
  placeholder = "Зураг оруулах",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isUploading, setIsUploading] = useState(false)
  const [urlInput, setUrlInput] = useState(value || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setPreview(base64String)
      onChange(base64String)
      setIsUploading(false)
    }
    reader.onerror = () => {
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value)
  }

  const handleUrlSubmit = () => {
    if (urlInput) {
      setPreview(urlInput)
      onChange(urlInput)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    setUrlInput("")
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Зургийн URL оруулах"
            value={urlInput}
            onChange={handleUrlChange}
            className="flex-1"
          />
          <Button type="button" onClick={handleUrlSubmit} variant="secondary">
            Оруулах
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Ачааллаж байна..." : placeholder}
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
      </div>

      {preview && (
        <div className="relative border rounded-md p-2 h-[200px] flex items-center justify-center bg-gray-50">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="relative h-full w-full">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Preview"
              fill
              className="object-contain"
              onError={() => {
                setPreview("/placeholder.svg")
                onChange("/placeholder.svg")
              }}
            />
          </div>
        </div>
      )}

      {!preview && (
        <div className="border rounded-md p-2 h-[200px] flex items-center justify-center bg-gray-50">
          <div className="text-muted-foreground text-sm">Зураг байхгүй</div>
        </div>
      )}
    </div>
  )
}
