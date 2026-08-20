/** Formats a date-only ('YYYY-MM-DD') or ISO string as a Korean relative-day label. */
export function formatRelativeDays(dateStr: string, now: Date = new Date()): string {
  const target = new Date(dateStr.length <= 10 ? `${dateStr}T00:00:00` : dateStr)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const diffDays = Math.round((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '오늘'
  if (diffDays === -1) return '어제'
  if (diffDays > 0) return `${diffDays}일 후`

  const daysAgo = -diffDays
  if (daysAgo < 30) return `${daysAgo}일 전`
  if (daysAgo < 365) return `${Math.floor(daysAgo / 30)}개월 전`
  return `${Math.floor(daysAgo / 365)}년 전`
}
