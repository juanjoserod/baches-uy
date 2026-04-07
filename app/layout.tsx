import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'baches.uy — Mapa de baches en Uruguay',
  description: 'Reportá baches y agujeros en las calles de Uruguay. Mapa colaborativo de baches.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full flex flex-col bg-gray-50 font-sans">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Analytics />
      </body>
    </html>
  )
}
