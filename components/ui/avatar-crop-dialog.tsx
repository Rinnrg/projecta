'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface AvatarCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  onCropComplete: (croppedImageBlob: Blob) => void
}

interface CroppedArea {
  x: number
  y: number
  width: number
  height: number
}

interface Point {
  x: number
  y: number
}

export function AvatarCropDialog({ 
  open, 
  onOpenChange, 
  imageSrc,
  onCropComplete 
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null)

  const onCropChange = (crop: Point) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onCropCompleteHandler = useCallback((_croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (): Promise<Blob | null> => {
    try {
      const image = await createImage(imageSrc)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx || !croppedAreaPixels) return null

      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      )

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/jpeg', 0.9)
      })
    } catch (e) {
      console.error(e)
      return null
    }
  }

  const handleSave = async () => {
    const croppedBlob = await getCroppedImg()
    if (croppedBlob) {
      onCropComplete(croppedBlob)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative h-[400px] w-full bg-gray-900 rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteHandler}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
