import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Upload, Loader2 } from 'lucide-react'
import Tesseract from 'tesseract.js'

interface AadhaarScannerProps {
  onScan: (data: { name: string; aadhaar: string }) => void
}

export function AadhaarScanner({ onScan }: AadhaarScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let file = event.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    try {
      // Resize image to max 1000px to speed up OCR significantly on mobile
      file = await new Promise<File>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const MAX_SIZE = 1000
            let { width, height } = img
            if (width > height) {
              if (width > MAX_SIZE) {
                height *= MAX_SIZE / width
                width = MAX_SIZE
              }
            } else {
              if (height > MAX_SIZE) {
                width *= MAX_SIZE / height
                height = MAX_SIZE
              }
            }
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(img, 0, 0, width, height)
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(new File([blob], file!.name, { type: 'image/jpeg' }))
              } else {
                resolve(file!)
              }
            }, 'image/jpeg', 0.8)
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file as File)
      })

      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m: any) => console.log(m.status, m.progress),
      })
      
      const text = result.data.text
      let aadhaar = ''
      let name = ''

      // 1. Extract Aadhaar number
      const aadhaarMatch = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/)
      if (aadhaarMatch) {
        aadhaar = aadhaarMatch[0].replace(/\s/g, '') // remove spaces just in case
      } else {
        const aadhaarMatch12 = text.match(/\b\d{12}\b/)
        if (aadhaarMatch12) aadhaar = aadhaarMatch12[0]
      }

      // 2. Extract Name (Broader Heuristic)
      const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0)
      for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase()
        const isDatePattern = /\d{2}\/\d{2}\/\d{4}/.test(lowerLine) || /\b(?:19|20)\d{2}\b/.test(lowerLine)
        
        if (
          lowerLine.includes('dob') ||
          lowerLine.includes('year of birth') ||
          lowerLine.includes('yob') ||
          isDatePattern ||
          lowerLine.includes('male') ||
          lowerLine.includes('female')
        ) {
          // Check up to 2 lines above
          for (let j = 1; j <= 2; j++) {
            if (i - j >= 0) {
              let possibleName = lines[i - j]
              possibleName = possibleName.replace(/[^a-zA-Z\s]/g, '').trim()
              if (
                possibleName.length > 2 && 
                !possibleName.toLowerCase().includes('government') &&
                !possibleName.toLowerCase().includes('india') &&
                !possibleName.toLowerCase().includes('father')
              ) {
                name = possibleName
                break
              }
            }
          }
          if (name) break
        }
      }

      onScan({ name, aadhaar })
    } catch (error) {
      console.error('OCR Error:', error)
      alert("Failed to scan Aadhaar. Please enter manually.")
    } finally {
      setIsScanning(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        ref={fileInputRef}
        className="hidden"
      />
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className="h-6 text-xs px-2 flex items-center gap-1.5"
      >
        {isScanning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" />
            Scan Aadhaar
          </>
        )}
      </Button>
    </div>
  )
}
