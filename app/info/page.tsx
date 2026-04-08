import Link from 'next/link'
import { Info, ListChecks, Lock, Lightbulb, BarChart3, Mail, Plus } from 'lucide-react'
import { DEPARTMENT_COMPLAINT_CHANNELS } from '@/lib/department-complaints'

export const metadata = {
  title: 'Info — bachesuy.com',
  description: 'Cómo funciona bachesuy.com, qué significan los estados, cómo se usan los datos y cuáles son los canales oficiales de reclamo por departamento.',
}

export default function InfoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">¿Qué es bachesuy.com?</h1>
      <p className="text-gray-600 mb-8">
        Un mapa colaborativo donde cualquier ciudadano puede reportar baches y agujeros en las
        calles de Uruguay.
      </p>

      <div className="space-y-6">
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><Info size={16} className="text-sky-600" />¿Cómo funciona?</h2>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>Encontrás un bache en la calle</li>
            <li>Entrás a bachesuy.com y hacés clic en Reportar</li>
            <li>Marcás la ubicación en el mapa y subís una foto</li>
            <li>El reporte aparece en el mapa para que todos lo vean</li>
            <li>Otros usuarios pueden confirmar el bache</li>
          </ol>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><ListChecks size={16} className="text-sky-600" />Estados de un reporte</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Nuevo', desc: 'Recién reportado, sin validación suficiente' },
              { label: 'Confirmado', desc: 'Recibió al menos 3 confirmaciones ciudadanas' },
              { label: 'Enviado', desc: 'Al menos una persona marcó que presentó la denuncia formal' },
              { label: 'Reparado', desc: 'La reparación fue confirmada por varias personas y se muestra en verde en el mapa' },
              { label: 'Cerrado', desc: 'Cerrado por otro motivo' },
            ].map((s) => (
              <div key={s.label} className="flex gap-3">
                <span className="font-medium w-28 shrink-0 text-sky-700">{s.label}</span>
                <span className="text-gray-500">{s.desc}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Si quieres ver el criterio completo de tiempos, umbrales y reglas, abre la{' '}
            <Link href="/guia-estados" className="font-medium text-sky-700 hover:underline">
              guía de estados
            </Link>.
          </p>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Info size={16} className="text-sky-600" />Canales oficiales por departamento</h2>
          <div className="space-y-2 text-sm">
            {DEPARTMENT_COMPLAINT_CHANNELS.map((channel) => (
              <div key={channel.department} className="flex flex-col gap-1 border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-sky-700">{channel.department}</span>
                  <span className="text-xs text-gray-400">
                    {channel.kind === 'complaint_form' ? 'reclamo / formulario' : 'contacto oficial'}
                  </span>
                </div>
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-sky-700 hover:underline break-all"
                >
                  {channel.label}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><Lock size={16} className="text-sky-600" />Privacidad</h2>
          <p className="text-sm text-gray-600">
            El email que ingresás al reportar nunca se muestra públicamente. Se usa solo para
            verificar reportes y enviarte actualizaciones si el estado cambia.
          </p>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><Lightbulb size={16} className="text-sky-600" />Inspirado en</h2>
          <p className="text-sm text-gray-600">
            Este proyecto está inspirado en{' '}
            <a
              href="https://asfaltkje.si"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-700 hover:underline font-medium"
            >
              asfaltkje.si
            </a>
            , la plataforma de reporte de baches de Eslovenia.
          </p>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><BarChart3 size={16} className="text-sky-600" />Datos y evidencia</h2>
          <p className="text-sm text-gray-600">
            Cada reporte puede compartirse, descargarse como constancia PDF y alimentar un dashboard público con estadísticas para reforzar la visibilidad del problema.
          </p>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><Mail size={16} className="text-sky-600" />Contacto</h2>
          <p className="text-sm text-gray-600">
            Para consultas, prensa, sugerencias o problemas con la plataforma, puedes escribir a{' '}
            <a href="mailto:bachesuycontacto@gmail.com" className="font-medium text-sky-700 hover:underline">
              bachesuycontacto@gmail.com
            </a>
            .
          </p>
        </section>

      </div>

      <div className="mt-8 text-center">
        <Link
          href="/reportar"
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3 rounded-full transition-colors"
        >
          <Plus size={16} /> Reportar un bache
        </Link>
      </div>
    </div>
  )
}
