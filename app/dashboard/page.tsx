import { getDashboardStats } from '@/lib/customers/dashboard-actions'
import { getSourceOptions } from '@/lib/customers/actions'
import { CONTACT_METHODS } from '@/lib/customers/contact-log'
import { formatRelativeDays } from '@/lib/customers/relative-time'
import { colorForIndex } from '@/lib/dashboard/chart-colors'
import { AppHeader } from '@/components/app-header'
import { StatTile } from '@/components/dashboard/stat-tile'
import { DonutChart } from '@/components/dashboard/donut-chart'
import { BarChart } from '@/components/dashboard/bar-chart'
import { LineChart } from '@/components/dashboard/line-chart'
import { ActionList } from '@/components/dashboard/action-list'

export const dynamic = 'force-dynamic'

function formatMonthLabel(key: string) {
  const [, month] = key.split('-')
  return `${Number(month)}월`
}

export default async function DashboardPage() {
  const [stats, sourceOptions] = await Promise.all([getDashboardStats(), getSourceOptions()])

  const sourceData = stats.sourceBreakdown.map((s) => ({
    label: s.source,
    value: s.count,
    color: colorForIndex(sourceOptions.indexOf(s.source)),
  }))

  const methodOrder: readonly string[] = CONTACT_METHODS
  const methodData = stats.methodBreakdown.map((m) => ({
    label: m.method,
    value: m.count,
    color: colorForIndex(methodOrder.indexOf(m.method)),
  }))

  const lineData = stats.monthlyContacts.map((m) => ({ label: formatMonthLabel(m.month), value: m.count }))

  return (
    <main className="mx-auto max-w-6xl p-6">
      <AppHeader title="통계 대시보드" />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="전체 고객 수" value={stats.totalCustomers} />
        <StatTile
          label="이번 달 신규 등록"
          value={stats.newThisMonth}
          delta={stats.newThisMonth - stats.newLastMonth}
          deltaLabel="전월 대비"
        />
        <StatTile label="최근 30일 연락 건수" value={stats.contactsLast30Days} />
        <StatTile label="미접촉 고객 수" value={stats.uncontactedCount} />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <DonutChart title="구분별 고객 분포" data={sourceData} />
        </div>
        <div className="card p-4">
          <BarChart title="연락 방법별 분포" data={methodData} />
        </div>
      </div>

      <div className="card mb-4 p-4">
        <LineChart title="월별 연락 건수 추이 (최근 6개월)" data={lineData} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ActionList
          title="30일 이상 연락 없는 즐겨찾기"
          emptyText="모두 잘 챙기고 계세요."
          items={stats.staleFavorites.map((c) => ({
            id: c.id,
            name: c.name,
            company: c.company,
            meta: c.lastContactedAt ? formatRelativeDays(c.lastContactedAt) : '기록 없음',
          }))}
        />
        <ActionList
          title="연락 기록 없는 신규 고객 (최근 30일)"
          emptyText="모두 한 번씩은 연락했어요."
          items={stats.uncontactedNew.map((c) => ({
            id: c.id,
            name: c.name,
            company: c.company,
            meta: `${formatRelativeDays(c.createdAt)} 등록`,
          }))}
        />
      </div>
    </main>
  )
}
