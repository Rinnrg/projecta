"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Link2, X, File, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FileUploadFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  accept?: string
  description?: string
}

export function FileUploadField({
  label,
  value,
  onChange,
  accept,
  description
}: FileUploadFieldProps) {
  const [uploadType, setUploadType] = useState<'link' | 'file'>('link')
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState<string>('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Gagal mengupload file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearFile = () => {
    onChange('')
    setFileName('')
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      
      <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as 'link' | 'file')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="link">
            <Link2 className="mr-2 h-4 w-4" />
            Link URL
          </TabsTrigger>
          <TabsTrigger value="file">
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="space-y-2">
          <Input
            type="url"
            placeholder="https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </TabsContent>

        <TabsContent value="file" className="space-y-2">
          {value ? (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{fileName || 'File terupload'}</p>
                    <a 
                      href={value} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Lihat file
                    </a>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
