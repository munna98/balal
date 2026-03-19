'use client'

import { useMemo, useRef, useState } from 'react'
import { Camera, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent)
}

export function PhotoCapture({
  tenantId,
  customerId,
  initialUrl,
  onUploaded,
}: {
  tenantId: string
  customerId: string
  initialUrl?: string
  onUploaded: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(initialUrl || '')
  const mobile = useMemo(() => isMobileDevice(), [])

  async function uploadFile(file: File) {
    const path = `${tenantId}/customers/${customerId}/photo.jpg`
    setUploading(true)
    const { error } = await supabase.storage.from('shop-assets').upload(path, file, {
      upsert: true,
      contentType: file.type || 'image/jpeg',
    })
    if (error) {
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('shop-assets').getPublicUrl(path)
    setPhotoUrl(data.publicUrl)
    onUploaded(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="size-16">
          {photoUrl ? <AvatarImage src={photoUrl} alt="Customer" /> : null}
          <AvatarFallback>Photo</AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {mobile ? <Camera className="mr-2 size-4" /> : <Upload className="mr-2 size-4" />}
          {uploading ? 'Uploading...' : mobile ? 'Capture photo' : 'Upload photo'}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={mobile ? 'environment' : undefined}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void uploadFile(file)
          event.currentTarget.value = ''
        }}
      />
    </div>
  )
}
