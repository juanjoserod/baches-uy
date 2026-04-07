import type { ReportStatus } from '@/types'

export const REPORT_CONFIRM_THRESHOLD = 3
export const REPORT_REPAIR_THRESHOLD = 3
export const REPORT_SENT_THRESHOLD = 1

export function resolveReportStatus({
  currentStatus,
  confirmedCount,
  sentConfirmedCount,
  repairConfirmedCount,
}: {
  currentStatus?: ReportStatus
  confirmedCount: number
  sentConfirmedCount: number
  repairConfirmedCount: number
}): ReportStatus {
  if (currentStatus === 'cerrado') {
    return 'cerrado'
  }

  if (repairConfirmedCount >= REPORT_REPAIR_THRESHOLD) {
    return 'reparado'
  }

  if (sentConfirmedCount >= REPORT_SENT_THRESHOLD) {
    return 'enviado'
  }

  if (confirmedCount >= REPORT_CONFIRM_THRESHOLD) {
    return 'confirmado'
  }

  return 'nuevo'
}
