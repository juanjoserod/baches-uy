'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, Mail, MessageSquareText, Send, UserRound } from 'lucide-react'
import type { ReportComment, ReportCommentUpdateType } from '@/types'
import { COMMENT_UPDATE_TYPE_LABELS } from '@/types'
import { createReportComment, getReportComments } from '@/lib/supabase'
import { timeAgo } from '@/lib/geocoding'

const TYPE_STYLES: Record<ReportCommentUpdateType, string> = {
  still_there: 'bg-sky-50 text-sky-700 border-sky-100',
  worse: 'bg-orange-50 text-orange-700 border-orange-100',
  repaired_claim: 'bg-green-50 text-green-700 border-green-100',
  hazard: 'bg-red-50 text-red-700 border-red-100',
  formal_complaint: 'bg-blue-50 text-blue-700 border-blue-100',
  general: 'bg-slate-50 text-slate-700 border-slate-100',
}

export default function ReportNeighborUpdates({ reportId }: { reportId: string }) {
  const [comments, setComments] = useState<ReportComment[]>([])
  const [authorAlias, setAuthorAlias] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    getReportComments(reportId)
      .then((items) => {
        if (isMounted) setComments(items)
      })
      .catch(() => {
        if (isMounted) setError('No se pudieron cargar las actualizaciones.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [reportId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    try {
      const saved = await createReportComment({
        reportId,
        author_alias: authorAlias,
        email,
        update_type: 'general',
        body,
      })

      if (saved.status === 'published') {
        setComments((current) => [saved, ...current])
        setSuccess('Tu actualización ya quedó publicada.')
      } else {
        setSuccess('Tu actualización quedó enviada y será revisada antes de publicarse.')
      }

      setAuthorAlias('')
      setEmail('')
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la actualización.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
          <MessageSquareText size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Actualizaciones de vecinos</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <UserRound size={13} /> Alias
            </span>
            <input
              id="neighbor-update-alias"
              name="neighbor_update_alias"
              type="text"
              value={authorAlias}
              onChange={(event) => setAuthorAlias(event.target.value)}
              maxLength={40}
              required
              autoComplete="nickname"
              placeholder="Ej: Vecina del Prado"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Mail size={13} /> Email
            </span>
            <input
              id="neighbor-update-email"
              name="neighbor_update_email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={160}
              required
              autoComplete="email"
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 text-xs font-semibold text-slate-700">Comentario</span>
          <textarea
            id="neighbor-update-body"
            name="neighbor_update_body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={500}
            required
            rows={4}
            placeholder="Contá qué viste. Por seguridad, evitá datos personales y links."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
          <span className="mt-1 block text-right text-[11px] text-slate-400">{body.length}/500</span>
        </label>

        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertTriangle size={15} /> {error}
          </p>
        )}
        {success && (
          <p className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-700">
            <CheckCircle2 size={15} /> {success}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(23,106,182,0.22)] transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={15} />
          {submitting ? 'Enviando...' : 'Enviar actualización'}
        </button>
      </form>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando actualizaciones...</p>
        ) : comments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            Todavía no hay actualizaciones publicadas para este bache.
          </p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${TYPE_STYLES[comment.update_type]}`}>
                  {COMMENT_UPDATE_TYPE_LABELS[comment.update_type]}
                </span>
                <span className="text-xs font-semibold text-slate-700">{comment.author_alias}</span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={12} /> {timeAgo(comment.created_at)}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.body}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
