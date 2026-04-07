'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Bike, Camera, CarFront, Check, Footprints, ImagePlus, MapPin, Route } from 'lucide-react'
import type { RoadType } from '@/types'
import { ROAD_TYPE_LABELS } from '@/types'
import { createReport, uploadPhoto } from '@/lib/supabase'

const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false })

const ROAD_TYPES: RoadType[] = ['calle', 'vereda', 'ciclovia', 'camino']
const ROAD_TYPE_ICONS: Record<RoadType, typeof CarFront> = {
  calle: CarFront,
  vereda: Footprints,
  ciclovia: Bike,
  camino: Route,
}

export default function ReportForm() {
  const router = useRouter()
  const [roadType, setRoadType] = useState<RoadType>('calle')
  const [location, setLocation] = useState<{
    lat: number; lng: number; address: string; department: string
  } | null>(null)
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [photoError, setPhotoError] = useState('')

  function handlePhotos(files: FileList | null) {
    if (!files) return
    setPhotoError('')
    const remaining = 3 - photos.length
    const newFiles = Array.from(files).slice(0, remaining)

    const invalidFile = newFiles.find((file) => !file.type.startsWith('image/'))
    if (invalidFile) {
      setPhotoError('Solo se permiten imágenes.')
      return
    }

    setPhotos((prev) => [...prev, ...newFiles])
    for (const f of newFiles) {
      const url = URL.createObjectURL(f)
      setPhotoPreviews((prev) => [...prev, url])
    }
  }

  function removePhoto(i: number) {
    setPhotos((prev) => prev.filter((_, j) => j !== i))
    setPhotoPreviews((prev) => prev.filter((_, j) => j !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setPhotoError('')
    if (!location) { setError('Seleccioná la ubicación del bache en el mapa'); return }
    if (!email.trim()) { setError('El email es requerido'); return }
    setSubmitting(true)
    try {
      // Upload photos first
      const photoUrls: string[] = []
      for (const file of photos) {
        const url = await uploadPhoto(file)
        photoUrls.push(url)
      }
      const report = await createReport({
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        department: location.department,
        road_type: roadType,
        status: 'nuevo',
        description: description.trim() || null,
        email: email.trim(),
        photos: photoUrls,
      })
      router.push(`/reporte/${report.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Hubo un error al enviar el reporte.'
      if (
        message.includes('SUPABASE_SERVICE_ROLE_KEY') ||
        message.toLowerCase().includes('row-level security')
      ) {
        setPhotoError(
          'La subida de fotos no está habilitada todavía en Supabase. Agregá SUPABASE_SERVICE_ROLE_KEY en el servidor o configurá políticas de Storage.'
        )
        setError('El reporte no se pudo enviar con fotos. Si quieres, intenta de nuevo sin fotos mientras se ajusta Storage.')
      } else {
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 w-full relative z-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Reportar bache</h1>
      <p className="text-gray-500 text-sm mb-7">
        Marcá la ubicación, agregá una foto y ayudá a mejorar las calles de Uruguay.
      </p>

      {/* Road type */}
      <fieldset className="mb-7">
        <legend className="block text-sm font-semibold text-gray-700 mb-3">
          Tipo de vía <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ROAD_TYPES.map((rt) => (
            <button
              key={rt}
              type="button"
              onClick={() => setRoadType(rt)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                roadType === rt
                  ? 'border-sky-500 bg-sky-50 text-gray-900'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-sky-200'
              }`}
              aria-pressed={roadType === rt}
            >
              {(() => {
                const Icon = ROAD_TYPE_ICONS[rt]
                return <Icon size={22} className={roadType === rt ? 'text-sky-700' : 'text-gray-500'} />
              })()}
              {ROAD_TYPE_LABELS[rt]}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Location */}
      <fieldset className="mb-7">
        <legend className="block text-sm font-semibold text-gray-700 mb-1">
          Ubicación <span className="text-red-500">*</span>
        </legend>
        <p className="text-xs text-gray-500 mb-3">Ingresá la dirección o hacé clic en el mapa</p>
        <div className="relative z-0">
          <LocationPicker
            onSelect={(lat, lng, address, department) =>
              setLocation({ lat, lng, address, department })
            }
            initialLat={location?.lat}
            initialLng={location?.lng}
            searchInputId="report-location-search"
            searchInputName="location_search"
          />
        </div>
        {location && (
          <div className="mt-2 flex items-start gap-2 text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <Check size={15} className="text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">{location.address}</p>
              <p className="text-xs text-gray-500">{location.department}</p>
            </div>
          </div>
        )}
      </fieldset>

      {/* Email */}
      <div className="mb-6">
        <label htmlFor="report-email" className="block text-sm font-semibold text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="report-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Solo para verificación, nunca se publica.</p>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label htmlFor="report-description" className="block text-sm font-semibold text-gray-700 mb-1">
          Descripción <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="report-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej. Bache grande en el medio de la calle, peligroso de noche..."
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white resize-none"
        />
      </div>

      {/* Photos */}
      <div className="mb-8">
        <label htmlFor="report-photos" className="block text-sm font-semibold text-gray-700 mb-1">
          Fotos <span className="text-gray-400 font-normal">(opcional, máx. 3)</span>
        </label>
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-2"><Camera size={14} className="text-sky-600" />Una foto vale más que mil palabras</p>
        <div className="flex gap-3 flex-wrap">
          {photoPreviews.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 bg-gray-900/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none hover:bg-gray-900"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          ))}
          {photos.length < 3 && (
            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition-colors">
              <ImagePlus size={24} className="text-sky-500" />
              <span className="text-xs text-gray-500 mt-1">Agregar</span>
              <input
                id="report-photos"
                name="photos"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handlePhotos(e.target.files)}
              />
            </label>
          )}
        </div>
        {photoError && (
          <div className="mt-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            {photoError}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-base transition-colors"
      >
        {submitting ? (
          <>
            <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
            Enviando...
          </>
        ) : (
          <><MapPin size={16} /> Enviar reporte</>
        )}
      </button>
    </form>
  )
}
