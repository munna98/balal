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
    const file = event.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m: any) => console.log(m),
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

      // 2. Extract Name (Heuristic: usually the line above DOB or Year of Birth)
      const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0)
      for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase()
        if (
          lowerLine.includes('dob') ||
          lowerLine.includes('year of birth') ||
          lowerLine.includes('yob')
        ) {
          // Look at previous line for English Name
          if (i > 0) {
            let possibleName = lines[i - 1]
            // Sometimes previous line is Hindi Name, and English name is above it.
            // A simple heuristic: check if it has valid english alphabets and no digits
            possibleName = possibleName.replace(/[^a-zA-Z\s]/g, '').trim()
            if (possibleName.length > 2) {
              name = possibleName
            } else if (i > 1) {
              // Try one more line above
              possibleName = lines[i - 2].replace(/[^a-zA-Z\s]/g, '').trim()
              if (possibleName.length > 2) {
                name = possibleName
              }
            }
          }
          break
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
