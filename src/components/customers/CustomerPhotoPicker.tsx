'use client'

import NextImage from 'next/image'
import { useId, useMemo, useRef, useState } from 'react'
import { Camera, Upload } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getImageBounds(imageSize: { width: number; height: number }, zoom: number, cropSize: number) {
  const scale = Math.max(cropSize / imageSize.width, cropSize / imageSize.height) * zoom
  return {
    width: imageSize.width * scale,
    height: imageSize.height * scale,
  }
}

function clampOffset(
  offset: { x: number; y: number },
  imageSize: { width: number; height: number },
  zoom: number,
  cropSize: number
) {
  const bounds = getImageBounds(imageSize, zoom, cropSize)
  const minX = Math.min(0, cropSize - bounds.width)
  const minY = Math.min(0, cropSize - bounds.height)

  return {
    x: clamp(offset.x, minX, 0),
    y: clamp(offset.y, minY, 0),
  }
}

async function loadImageSize(src: string) {
  const image = new window.Image()
  image.decoding = 'async'
  image.src = src

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Failed to load image'))
  })

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
  }
}

async function cropImageToFile({
  sourceUrl,
  fileName,
  imageSize,
  zoom,
  offset,
  cropSize,
}: {
  sourceUrl: string
  fileName: string
  imageSize: { width: number; height: number }
  zoom: number
  offset: { x: number; y: number }
  cropSize: number
}) {
  const image = new window.Image()
  image.decoding = 'async'
  image.src = sourceUrl

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Failed to prepare image crop'))
  })

  const displayBounds = getImageBounds(imageSize, zoom, cropSize)
  const sourceX = (-offset.x / displayBounds.width) * imageSize.width
  const sourceY = (-offset.y / displayBounds.height) * imageSize.height
  const sourceWidth = (cropSize / displayBounds.width) * imageSize.width
  const sourceHeight = (cropSize / displayBounds.height) * imageSize.height

  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 600
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to crop image')
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) resolve(value)
      else reject(new Error('Unable to save cropped image'))
    }, 'image/jpeg', 0.9)
  })

  const baseName = fileName.replace(/\.[^.]+$/, '') || 'customer-photo'
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
}

export function CustomerPhotoPicker({
  label = 'Photo',
  helperText = 'You can capture photo on mobile. Upload happens after submit.',
  initialUrl,
  fallbackLabel = 'Photo',
  onChange,
}: {
  label?: string
  helperText?: string
  initialUrl?: string | null
  fallbackLabel?: string
  onChange: (file: File | null) => void
}) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const dragStateRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const cropSize = 280
  const mobile = useMemo(() => isMobileDevice(), [])

  const [previewUrlOverride, setPreviewUrlOverride] = useState<string | null>(null)
  const [isCropOpen, setIsCropOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState('')
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [error, setError] = useState<string | null>(null)
  const [isSavingCrop, setIsSavingCrop] = useState(false)
  const previewUrl = previewUrlOverride ?? initialUrl ?? ''

  async function handleFileSelection(file: File) {
    const objectUrl = URL.createObjectURL(file)
    setError(null)
    setSelectedFile(file)
    setSourceUrl(objectUrl)

    try {
      const nextImageSize = await loadImageSize(objectUrl)
      const initialZoom = 1
      const initialBounds = getImageBounds(nextImageSize, initialZoom, cropSize)
      setImageSize(nextImageSize)
      setZoom(initialZoom)
      setOffset({
        x: (cropSize - initialBounds.width) / 2,
        y: (cropSize - initialBounds.height) / 2,
      })
      setIsCropOpen(true)
    } catch (nextError) {
      URL.revokeObjectURL(objectUrl)
      setSourceUrl('')
      setSelectedFile(null)
      setImageSize(null)
      setError(nextError instanceof Error ? nextError.message : 'Failed to load image')
    }
  }

  function resetCropState() {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    dragStateRef.current = null
    setIsCropOpen(false)
    setSelectedFile(null)
    setSourceUrl('')
    setImageSize(null)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setIsSavingCrop(false)
  }

  async function handleCropSave() {
    if (!selectedFile || !sourceUrl || !imageSize) return
    setIsSavingCrop(true)
    setError(null)

    try {
      const croppedFile = await cropImageToFile({
        sourceUrl,
        fileName: selectedFile.name,
        imageSize,
        zoom,
        offset,
        cropSize,
      })

      const nextPreviewUrl = URL.createObjectURL(croppedFile)
      setPreviewUrlOverride((currentPreview) => {
        if (currentPreview?.startsWith('blob:')) URL.revokeObjectURL(currentPreview)
        return nextPreviewUrl
      })
      onChange(croppedFile)
      resetCropState()
    } catch (nextError) {
      setIsSavingCrop(false)
      setError(nextError instanceof Error ? nextError.message : 'Failed to crop image')
    }
  }

  function handleCropCancel(nextOpen: boolean) {
    if (nextOpen) {
      setIsCropOpen(true)
      return
    }

    resetCropState()
  }

  function beginDrag(clientX: number, clientY: number) {
    if (!imageSize) return
    dragStateRef.current = {
      startX: clientX,
      startY: clientY,
      originX: offset.x,
      originY: offset.y,
    }
  }

  function updateDrag(clientX: number, clientY: number) {
    if (!dragStateRef.current || !imageSize) return

    const nextOffset = clampOffset(
      {
        x: dragStateRef.current.originX + (clientX - dragStateRef.current.startX),
        y: dragStateRef.current.originY + (clientY - dragStateRef.current.startY),
      },
      imageSize,
      zoom,
      cropSize
    )

    setOffset(nextOffset)
  }

  function endDrag() {
    dragStateRef.current = null
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start gap-4">
        <Avatar className="size-20">
          {previewUrl ? <AvatarImage src={previewUrl} alt="Customer photo preview" /> : null}
          <AvatarFallback>{fallbackLabel.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor={inputId}>{label}</Label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
              {mobile ? <Camera className="mr-2 size-4" /> : <Upload className="mr-2 size-4" />}
              {mobile ? 'Capture photo' : 'Upload photo'}
            </Button>
            {previewUrl ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
                  setPreviewUrlOverride('')
                  onChange(null)
                }}
              >
                Remove
              </Button>
            ) : null}
          </div>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept="image/*"
            capture={mobile ? 'environment' : undefined}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleFileSelection(file)
              event.currentTarget.value = ''
            }}
          />
          <p className="text-xs text-muted-foreground">{helperText}</p>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </div>

      <Dialog open={isCropOpen} onOpenChange={handleCropCancel}>
        <DialogContent className="max-w-xl" showCloseButton={!isSavingCrop}>
          <DialogHeader>
            <DialogTitle>Crop customer photo</DialogTitle>
            <DialogDescription>
              Position the face inside the square frame so all customer photos stay uniform.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center">
              <div
                className="relative overflow-hidden rounded-2xl bg-muted touch-none select-none"
                style={{ width: cropSize, height: cropSize }}
                onPointerDown={(event) => {
                  ;(event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId)
                  beginDrag(event.clientX, event.clientY)
                }}
                onPointerMove={(event) => updateDrag(event.clientX, event.clientY)}
                onPointerUp={(event) => {
                  ;(event.currentTarget as HTMLDivElement).releasePointerCapture(event.pointerId)
                  endDrag()
                }}
                onPointerCancel={(event) => {
                  ;(event.currentTarget as HTMLDivElement).releasePointerCapture(event.pointerId)
                  endDrag()
                }}
              >
                {sourceUrl && imageSize ? (
                  <NextImage
                    src={sourceUrl}
                    alt="Crop preview"
                    unoptimized
                    width={getImageBounds(imageSize, zoom, cropSize).width}
                    height={getImageBounds(imageSize, zoom, cropSize).height}
                    className="absolute max-w-none"
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px)`,
                    }}
                  />
                ) : null}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/80" />
                <div className="pointer-events-none absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Zoom</span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                className="w-full"
                onChange={(event) => {
                  if (!imageSize) return
                  const nextZoom = Number(event.target.value)
                  setZoom(nextZoom)
                  setOffset((current) => clampOffset(current, imageSize, nextZoom, cropSize))
                }}
              />
              <p className="text-xs text-muted-foreground">Drag the photo to adjust the crop.</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleCropCancel(false)} disabled={isSavingCrop}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleCropSave()} disabled={isSavingCrop}>
              {isSavingCrop ? 'Saving...' : 'Use cropped photo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
