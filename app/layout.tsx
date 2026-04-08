import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import { Analytics } from '@vercel/analytics/next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bachesuy.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'bachesuy.com — Mapa colaborativo de baches en Uruguay',
  description: 'Reportá baches y agujeros en calles, caminos, veredas y ciclovías de Uruguay. Mapa ciudadano para visibilizar el problema y generar presión pública.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'bachesuy.com — Mapa colaborativo de baches en Uruguay',
    description: 'Reportá baches y ayudá a visibilizar el problema con datos, fotos y evidencia pública.',
    url: siteUrl,
    siteName: 'bachesuy.com',
    locale: 'es_UY',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'bachesuy.com',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'bachesuy.com — Mapa colaborativo de baches en Uruguay',
    description: 'Reportá baches y ayudá a visibilizar el problema con datos, fotos y evidencia pública.',
    images: ['/twitter-image'],
  },
  icons: {
    icon: '/favicon-baches.png',
    shortcut: '/favicon-baches.png',
    apple: '/favicon-baches.png',
  },
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
