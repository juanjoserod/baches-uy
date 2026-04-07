import { notFound } from 'next/navigation'
import { getReportById } from '@/lib/supabase'
import ReportDetailClient from '@/components/ReportDetailClient'

export default async function ReportePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await getReportById(id)
  if (!report) notFound()

  return <ReportDetailClient report={report} />
}
