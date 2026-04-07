'use client'

import { Printer } from 'lucide-react'

export default function PrintActions() {
  return (
    <div className="print:hidden flex items-center gap-3 mb-6">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
      >
        <Printer size={15} />
        Imprimir o guardar PDF
      </button>
      <p className="text-sm text-gray-500">
        Se abre el diálogo del navegador para guardar esta constancia como PDF.
      </p>
    </div>
  )
}
