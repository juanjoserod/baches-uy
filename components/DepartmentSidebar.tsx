'use client'

import { useState } from 'react'
import { Trophy, ChevronLeft, Map } from 'lucide-react'
import type { DepartmentCount } from '@/types'

interface DepartmentSidebarProps {
  counts: DepartmentCount[]
  onDeptClick?: (dept: string) => void
  className?: string
  collapsedButtonClassName?: string
}

export default function DepartmentSidebar({
  counts,
  onDeptClick,
  className = 'absolute top-6 left-5 z-[400] bg-white/95 rounded-[24px] shadow-[0_20px_40px_rgba(16,33,51,0.14)] border border-sky-100/90 w-72 backdrop-blur-sm',
  collapsedButtonClassName = 'absolute top-6 left-5 z-[400] bg-white/95 rounded-2xl shadow-[0_16px_30px_rgba(16,33,51,0.12)] border border-sky-100 p-3 text-sky-700 hover:bg-sky-50',
}: DepartmentSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const top = counts.slice(0, 10)
  const max = top[0]?.count ?? 1

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className={collapsedButtonClassName}
        title="Ver ranking de departamentos"
      >
        <Trophy size={18} />
      </button>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-sky-100">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-sky-600" />
          <div>
            <span className="font-semibold text-sm text-slate-900 block">Más baches por departamento</span>
            <span className="text-[11px] text-slate-500">Tocá uno para mover el mapa</span>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
      <div className="py-2 max-h-[calc(100vh-250px)] overflow-y-auto">
        {top.length === 0 ? (
          <p className="text-xs text-slate-500 px-5 py-4">Sin datos aún</p>
        ) : (
          top.map((item, i) => (
            <button
              key={item.department}
              onClick={() => onDeptClick?.(item.department)}
              className="w-full text-left px-5 py-3 hover:bg-sky-50/80 transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-slate-400 w-5 shrink-0 text-center">
                    {i === 0 ? <Trophy size={13} className="text-sky-600 inline" /> : i + 1}
                  </span>
                  <span className="text-sm text-slate-800 truncate group-hover:text-slate-950">
                    {item.department}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                  <span className="text-sm font-semibold text-sky-700">{item.count}</span>
                  <Map size={11} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden ml-7">
                <div
                  className="h-full bg-[linear-gradient(90deg,#2483d8,#7cbcff)] rounded-full transition-all"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
