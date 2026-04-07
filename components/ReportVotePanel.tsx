'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, FileCheck2, ThumbsUp, Wrench } from 'lucide-react'
import type { Report, ReportVoteType } from '@/types'
import { castReportVote } from '@/lib/supabase'

interface ReportVotePanelProps {
  report: Report
  onReportChange?: (report: Report) => void
}

const STORAGE_KEY = 'report_vote_registry'

const VOTE_UI: Record<ReportVoteType, {
  label: string
  Icon: typeof ThumbsUp
  activeClassName: string
  idleClassName: string
  countKey: keyof Pick<Report, 'confirmed_count' | 'sent_confirmed_count' | 'repair_confirmed_count'>
  doneText: string
}> = {
  confirm_exists: {
    label: 'Confirmar este bache',
    Icon: ThumbsUp,
    activeClassName: 'bg-sky-50 border-2 border-sky-200 text-sky-700',
    idleClassName: 'bg-sky-600 hover:bg-sky-700 text-white',
    countKey: 'confirmed_count',
    doneText: 'Ya confirmaste este bache',
  },
  confirm_sent: {
    label: 'Ya hice la denuncia formal',
    Icon: FileCheck2,
    activeClassName: 'bg-blue-50 border-2 border-blue-200 text-blue-700',
    idleClassName: 'bg-blue-600 hover:bg-blue-700 text-white',
    countKey: 'sent_confirmed_count',
    doneText: 'Ya marcaste una denuncia formal',
  },
  confirm_repaired: {
    label: 'Marcar como reparado',
    Icon: Wrench,
    activeClassName: 'bg-green-50 border-2 border-green-200 text-green-700',
    idleClassName: 'bg-green-600 hover:bg-green-700 text-white',
    countKey: 'repair_confirmed_count',
    doneText: 'Ya marcaste este arreglo',
  },
}

function buildVoteStorageId(reportId: string, voteType: ReportVoteType) {
  return `${reportId}:${voteType}`
}

export default function ReportVotePanel({ report, onReportChange }: ReportVotePanelProps) {
  const [reportState, setReportState] = useState(report)
  const [loadingVote, setLoadingVote] = useState<ReportVoteType | null>(null)
  const [doneVotes, setDoneVotes] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, boolean>
    setDoneVotes(stored)
  }, [])

  async function handleVote(voteType: ReportVoteType) {
    const storageId = buildVoteStorageId(report.id, voteType)
    if (loadingVote) return

    setError('')
    setLoadingVote(voteType)
    try {
      const result = await castReportVote(report.id, voteType)
      const nextStored = {
        ...doneVotes,
        [storageId]: result.active,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStored))
      setDoneVotes(nextStored)
      setReportState(result.report)
      onReportChange?.(result.report)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el voto.')
    } finally {
      setLoadingVote(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(VOTE_UI) as ReportVoteType[]).map((voteType) => {
          const config = VOTE_UI[voteType]
          const Icon = config.Icon
          const count = reportState[config.countKey]
          const storageId = buildVoteStorageId(report.id, voteType)
          const alreadyDone = Boolean(doneVotes[storageId])
          const isLoading = loadingVote === voteType

          return (
            <button
              key={voteType}
              type="button"
              onClick={() => handleVote(voteType)}
              disabled={Boolean(loadingVote)}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                alreadyDone ? config.activeClassName : config.idleClassName
              } disabled:cursor-default disabled:opacity-100`}
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
              ) : alreadyDone ? (
                <CheckCircle2 size={17} />
              ) : (
                <Icon size={17} />
              )}
              {alreadyDone ? `${config.doneText} (${count})` : `${config.label} · ${count}`}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
