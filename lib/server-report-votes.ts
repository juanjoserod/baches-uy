import type { SupabaseClient } from '@supabase/supabase-js'
import type { Report, ReportVoteType } from '@/types'
import { mapPublicReport } from '@/lib/supabase'
import { resolveReportStatus } from '@/lib/report-status'

function isSchemaMismatchError(error: { code?: string; message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? ''
  return (
    error?.code === '42P01' ||
    error?.code === '42703' ||
    message.includes('report_votes') ||
    message.includes('sent_confirmed_count') ||
    message.includes('repair_confirmed_count') ||
    message.includes('status_updated_at') ||
    message.includes('column')
  )
}

export async function registerReportVote({
  supabase,
  reportId,
  voteType,
  voterHash,
}: {
  supabase: SupabaseClient
  reportId: string
  voteType: ReportVoteType
  voterHash: string
}): Promise<
  | { success: true; report: Report; active: boolean }
  | { success: false; error: string; status: number }
> {
  const { data: existingReport, error: readError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (isSchemaMismatchError(readError)) {
    return {
      success: false,
      error: 'La base de datos no está actualizada para el sistema de votos. Ejecutá el schema.sql nuevo en Supabase.',
      status: 500,
    }
  }

  if (readError || !existingReport) {
    return { success: false, error: 'No se encontró el reporte.', status: 404 }
  }

  const { data: duplicateVote } = await supabase
    .from('report_votes')
    .select('id')
    .eq('report_id', reportId)
    .eq('vote_type', voteType)
    .eq('voter_hash', voterHash)
    .maybeSingle()

  let active = false

  if (duplicateVote) {
    const { error: deleteError } = await supabase
      .from('report_votes')
      .delete()
      .eq('id', duplicateVote.id)

    if (deleteError) {
      return { success: false, error: 'No se pudo deshacer el voto.', status: 500 }
    }
  } else {
    const { error: voteError } = await supabase
      .from('report_votes')
      .insert({
        report_id: reportId,
        vote_type: voteType,
        voter_hash: voterHash,
      })

    if (isSchemaMismatchError(voteError)) {
      return {
        success: false,
        error: 'Falta crear la tabla de votos o las nuevas columnas en Supabase. Ejecutá el schema.sql actualizado.',
        status: 500,
      }
    }

    if (voteError) {
      return { success: false, error: 'No se pudo registrar el voto.', status: 500 }
    }

    active = true
  }

  const delta = duplicateVote ? -1 : 1
  const nextConfirmedCount =
    Math.max(0, Number(existingReport.confirmed_count ?? 0) + (voteType === 'confirm_exists' ? delta : 0))
  const nextSentConfirmedCount =
    Math.max(0, Number(existingReport.sent_confirmed_count ?? 0) + (voteType === 'confirm_sent' ? delta : 0))
  const nextRepairConfirmedCount =
    Math.max(0, Number(existingReport.repair_confirmed_count ?? 0) + (voteType === 'confirm_repaired' ? delta : 0))

  const nextStatus = resolveReportStatus({
    currentStatus: existingReport.status as Report['status'],
    confirmedCount: nextConfirmedCount,
    sentConfirmedCount: nextSentConfirmedCount,
    repairConfirmedCount: nextRepairConfirmedCount,
  })

  const nowIso = new Date().toISOString()
  const updatePayload: Record<string, unknown> = {
    confirmed_count: nextConfirmedCount,
    sent_confirmed_count: nextSentConfirmedCount,
    repair_confirmed_count: nextRepairConfirmedCount,
    status: nextStatus,
    status_updated_at: nowIso,
  }

  if (voteType === 'confirm_sent' && !existingReport.sent_at) {
    updatePayload.sent_at = nowIso
  }
  if (voteType === 'confirm_sent' && nextSentConfirmedCount === 0) {
    updatePayload.sent_at = null
  }

  if (nextStatus === 'reparado' && !existingReport.repaired_at) {
    updatePayload.repaired_at = nowIso
  }
  if (voteType === 'confirm_repaired' && nextRepairConfirmedCount === 0) {
    updatePayload.repaired_at = null
  }

  const { data: updatedReport, error: updateError } = await supabase
    .from('reports')
    .update(updatePayload)
    .eq('id', reportId)
    .select('*')
    .single()

  if (isSchemaMismatchError(updateError)) {
    return {
      success: false,
      error: 'La tabla reports todavía no tiene todas las columnas nuevas para actualizar estados.',
      status: 500,
    }
  }

  if (updateError || !updatedReport) {
    return { success: false, error: 'No se pudo actualizar el reporte.', status: 500 }
  }

  return {
    success: true,
    report: mapPublicReport(updatedReport as Record<string, unknown>),
    active,
  }
}
