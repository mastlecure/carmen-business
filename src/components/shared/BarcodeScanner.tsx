import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera, AlertCircle } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (code: string) => void
  onClose: () => void
}


export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState('')
  const scannerRef  = useRef<Html5Qrcode | null>(null)
  const scannedRef  = useRef(false)
  const containerId = 'cb-scanner-view'

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId, { verbose: false })
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 260, height: 110 },
          aspectRatio: 1.4,
        },
        (decoded) => {
          if (scannedRef.current) return
          scannedRef.current = true
          scanner.stop().catch(() => {}).finally(() => onScan(decoded))
        },
        () => {}
      )
      .catch(() => {
        setError('No se pudo acceder a la cámara.\nRevisa los permisos del navegador.')
      })

    return () => {
      if (!scannedRef.current) {
        scanner.stop().catch(() => {})
      }
    }
  }, [])

  const handleClose = () => {
    if (!scannedRef.current && scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(13,10,8,0.97)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
            <Camera size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold">Escanear código</span>
        </div>
        <button
          onClick={handleClose}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:bg-white/20 transition-colors"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      {/* Camera area */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-5">
        {error ? (
          <div className="bg-white/10 rounded-3xl p-7 text-center max-w-xs w-full">
            <AlertCircle size={44} className="text-red-400 mx-auto mb-3" />
            <p className="text-white font-semibold text-base">Sin acceso a la cámara</p>
            <p className="text-white/50 text-sm mt-2 leading-relaxed whitespace-pre-line">{error}</p>
            <button
              onClick={handleClose}
              className="mt-5 w-full bg-white text-gray-900 rounded-2xl py-3.5 font-bold text-sm active:opacity-80"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Scanner frame */}
            <div
              className="w-full max-w-xs overflow-hidden rounded-2xl"
              style={{ background: '#000', boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.8)' }}
            >
              <div id={containerId} className="w-full" />
            </div>

            {/* Corner guides */}
            <div className="absolute pointer-events-none">
              {/* decorative — html5-qrcode already draws the viewfinder */}
            </div>
          </>
        )}
      </div>

      {/* Hint */}
      {!error && (
        <div className="px-5 pb-10 text-center flex-shrink-0">
          <p className="text-white/40 text-sm">
            Apunta al código de barras — se detecta automáticamente
          </p>
        </div>
      )}
    </div>
  )
}
