'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Camera, Upload } from 'lucide-react'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type PercentCrop,
  type PixelCrop,
} from 'react-image-crop'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent)
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

async function cropImageToFile({
  image,
  crop,
  fileName,
}: {
  image: HTMLImageElement
  crop: PixelCrop
  fileName: string
}) {
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 600
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to crop image')
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  )

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
  const imageRef = useRef<HTMLImageElement | null>(null)
  const mobile = useMemo(() => isMobileDevice(), [])

  const [previewUrlOverride, setPreviewUrlOverride] = useState<string | null>(null)
  const [isCropOpen, setIsCropOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState('')
  const [crop, setCrop] = useState<PercentCrop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [error, setError] = useState<string | null>(null)
  const [isSavingCrop, setIsSavingCrop] = useState(false)
  const previewUrl = previewUrlOverride ?? initialUrl ?? ''

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl)
      if (previewUrlOverride?.startsWith('blob:')) URL.revokeObjectURL(previewUrlOverride)
    }
  }, [previewUrlOverride, sourceUrl])

  function clearSourceUrl() {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    setSourceUrl('')
  }

  async function handleFileSelection(file: File) {
    const objectUrl = URL.createObjectURL(file)
    clearSourceUrl()
    setError(null)
    setSelectedFile(file)
    setSourceUrl(objectUrl)
    setCrop(undefined)
    setCompletedCrop(undefined)
    setIsCropOpen(true)
  }

  function resetCropState() {
    imageRef.current = null
    clearSourceUrl()
    setIsCropOpen(false)
    setSelectedFile(null)
    setCrop(undefined)
    setCompletedCrop(undefined)
    setIsSavingCrop(false)
  }

  async function handleCropSave() {
    if (!selectedFile || !completedCrop || !imageRef.current) return
    setIsSavingCrop(true)
    setError(null)

    try {
      const croppedFile = await cropImageToFile({
        image: imageRef.current,
        crop: completedCrop,
        fileName: selectedFile.name,
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
          </DialogHeader>

          <div className="flex justify-center">
            {sourceUrl ? (
              <ReactCrop
                crop={crop}
                aspect={1}
                minWidth={120}
                keepSelection
                ruleOfThirds
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
                className="max-h-[70vh] rounded-2xl bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={sourceUrl}
                  alt="Crop preview"
                  className="max-h-[70vh] w-auto object-contain"
                  onLoad={(event) => {
                    const { width, height } = event.currentTarget
                    setCrop(centerAspectCrop(width, height, 1))
                  }}
                />
              </ReactCrop>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleCropCancel(false)} disabled={isSavingCrop}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleCropSave()} disabled={isSavingCrop || !completedCrop}>
              {isSavingCrop ? 'Saving...' : 'Use cropped photo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
