'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Mode = 'camera' | 'manual'

export function ImeiScanner({
  value,
  onChange,
}: {
  value: string
  onChange: (imei: string) => void
}) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>('manual')
  const [scannedValue, setScannedValue] = useState('')
  const [manualInput, setManualInput] = useState(value)

  useEffect(() => {
    if (mode !== 'camera' || !scannerRef.current) return
    let scanner: { start: (...args: unknown[]) => Promise<unknown>; stop: () => Promise<unknown>; clear: () => void } | null = null
    let active = true

    async function startScanner() {
      const html5QrcodeModule = await import('html5-qrcode')
      const Html5Qrcode = html5QrcodeModule.Html5Qrcode as new (id: string) => {
        start: (...args: unknown[]) => Promise<unknown>
        stop: () => Promise<unknown>
        clear: () => void
      }
      scanner = new Html5Qrcode('imei-scanner-region')
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 220 },
        (decodedText: string) => {
          if (!active) return
          setScannedValue(decodedText)
          onChange(decodedText)
        },
        () => undefined
      )
    }

    void startScanner()

    return () => {
      active = false
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner?.clear())
          .catch(() => undefined)
      }
    }
  }, [mode, onChange])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>IMEI</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setMode((prev) => (prev === 'camera' ? 'manual' : 'camera'))}
        >
          Switch to {mode === 'camera' ? 'manual' : 'camera'}
        </Button>
      </div>

      {mode === 'camera' ? (
        <div className="space-y-2">
          <div id="imei-scanner-region" ref={scannerRef} className="min-h-52 rounded-md border" />
          <Input value={scannedValue || value} readOnly placeholder="Scanned value preview" />
          <Button
            type="button"
            disabled={!scannedValue}
            onClick={() => {
              onChange(scannedValue)
            }}
          >
            Confirm scanned IMEI
          </Button>
        </div>
      ) : (
        <Input
          value={manualInput}
          placeholder="Enter IMEI manually"
          onChange={(event) => {
            setManualInput(event.target.value)
            onChange(event.target.value)
          }}
        />
      )}
    </div>
  )
}
