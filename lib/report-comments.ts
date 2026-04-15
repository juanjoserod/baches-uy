import { createHash } from 'crypto'
import type { ReportComment } from '@/types'

export function mapPublicReportComment(row: Record<string, unknown>): ReportComment {
  return {
    id: String(row.id ?? ''),
    created_at: String(row.created_at ?? ''),
    report_id: String(row.report_id ?? ''),
    author_alias: String(row.author_alias ?? 'Vecino'),
    update_type: row.update_type as ReportComment['update_type'],
    body: String(row.body ?? ''),
    status: row.status as ReportComment['status'],
  }
}

export function hashCommentEmail(email: string) {
  const salt = process.env.COMMENT_HASH_SALT ?? process.env.VOTE_FINGERPRINT_SALT ?? 'baches-uy-comment-fallback-salt'

  return createHash('sha256')
    .update(`${salt}:${email.trim().toLowerCase()}`)
    .digest('hex')
}
