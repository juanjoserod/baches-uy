'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface PhotoLightboxProps {
  photos: string[]
}

export default function PhotoLightbox({ photos }: PhotoLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    if (activeIndex === null) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setActiveIndex(null)
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => (current === null ? current : (current - 1 + photos.length) % photos.length))
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => (current === null ? current : (current + 1) % photos.length))
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex, photos.length])

  return (
    <>
      <div className="flex gap-3 mb-5 overflow-x-auto pb-1">
        {photos.map((url, i) => (
          <button
            key={`${url}-${i}`}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="shrink-0 rounded-xl border border-gray-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <img
              src={url}
              alt={`Foto ${i + 1}`}
              className="w-36 h-36 object-cover hover:scale-[1.02] transition-transform"
            />
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute top-4 right-4 text-white/90 hover:text-white"
            aria-label="Cerrar visor"
          >
            <X size={28} />
          </button>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setActiveIndex((activeIndex - 1 + photos.length) % photos.length)
              }}
              className="absolute left-4 text-white/90 hover:text-white"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={34} />
            </button>
          )}

          <img
            src={photos[activeIndex]}
            alt={`Foto ampliada ${activeIndex + 1}`}
            className="max-h-[88vh] max-w-[92vw] rounded-2xl shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setActiveIndex((activeIndex + 1) % photos.length)
              }}
              className="absolute right-4 text-white/90 hover:text-white"
              aria-label="Foto siguiente"
            >
              <ChevronRight size={34} />
            </button>
          )}
        </div>
      )}
    </>
  )
}
