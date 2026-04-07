'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, List, Plus, Info, BarChart3 } from 'lucide-react'

const BachesLogo = dynamic(
  () => import('./BachesLogo').then((mod) => mod.BachesLogo),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center bg-transparent p-0" aria-label="baches uy">
        <img src="/baches-wordmark.png" alt="Baches uy" className="h-[88px] sm:h-[96px] w-auto" />
      </div>
    ),
  }
)

const navItems = [
  { href: '/', label: 'Mapa', Icon: Map },
  { href: '/lista', label: 'Lista', Icon: List },
  { href: '/dashboard', label: 'Dashboard', Icon: BarChart3 },
  { href: '/reportar', label: 'Reportar', Icon: Plus },
  { href: '/info', label: 'Info', Icon: Info },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="z-50 border-b border-sky-100/80 bg-white/88 backdrop-blur-xl shadow-[0_10px_35px_rgba(36,131,216,0.08)]">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-4">
        <Link href="/" className="flex items-center font-bold text-lg tracking-tight">
          <BachesLogo size="small" className="bg-transparent p-0" />
        </Link>
        <nav className="flex items-center gap-1 rounded-full bg-slate-100/80 p-1">
          {navItems.map(({ href, label, Icon }) => {
            const isActive = pathname === href
            const isReport = href === '/reportar'
            return (
              <Link
                key={href}
                href={href}
                className={
                  isReport
                    ? 'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-[0_8px_18px_rgba(23,106,182,0.28)]'
                    : `flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm transition-colors ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'
                      }`
                }
              >
                <Icon size={15} strokeWidth={2} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
