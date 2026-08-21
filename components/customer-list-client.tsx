'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sortCustomers, filterCustomers, type SortField, type SortDirection } from '@/lib/customers/list'
import { deleteCustomer } from '@/lib/customers/actions'
import { formatPhone } from '@/lib/customers/phone'
import { formatRelativeDays } from '@/lib/customers/relative-time'
import type { Customer } from '@/lib/customers/types'
import { SourceTag } from './source-tag'
import { SourceFilterDropdown } from './source-filter-dropdown'
import { BusinessCardPreview } from './business-card-preview'
import { ContactHistoryPreview } from './contact-history-preview'
import { FavoriteToggle } from './favorite-toggle'
import { BulkActionsBar } from './bulk-actions-bar'

type ListSortField = SortField | 'contactCount' | 'favorite'

const COLUMNS: { field: SortField; label: string }[] = [
  { field: 'source', label: '구분' },
  { field: 'company', label: '소속' },
  { field: 'name', label: '이름' },
  { field: 'phone', label: '연락처' },
  { field: 'email', label: '이메일' },
  { field: 'memo', label: '메모' },
  { field: 'createdAt', label: '등록일' },
]

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul' }).format(new Date(iso))
}

function lastContactLabel(customer: Customer) {
  return customer.lastContactedAt ? formatRelativeDays(customer.lastContactedAt) : '기록 없음'
}

export function CustomerListClient({
  initialCustomers,
  sourceOptions,
}: {
  initialCustomers: Customer[]
  sourceOptions: string[]
}) {
  const router = useRouter()
  const [customers, setCustomers] = useState(initialCustomers)
  const [sortField, setSortField] = useState<ListSortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const visible = useMemo(() => {
    const filtered = filterCustomers(customers, { sources: selectedSources, search })
    if (sortField === 'contactCount') {
      return [...filtered].sort((a, b) => {
        const diff = (a.contactCount ?? 0) - (b.contactCount ?? 0)
        return sortDirection === 'asc' ? diff : -diff
      })
    }
    if (sortField === 'favorite') {
      return [...filtered].sort((a, b) => {
        const diff = Number(a.isFavorite) - Number(b.isFavorite)
        return sortDirection === 'asc' ? diff : -diff
      })
    }
    return sortCustomers(filtered, sortField, sortDirection)
  }, [customers, selectedSources, search, sortField, sortDirection])

  const exportHref = useMemo(() => {
    const params = new URLSearchParams()
    if (selectedSources.length > 0) params.set('sources', selectedSources.join(','))
    if (search.trim() !== '') params.set('search', search.trim())
    const query = params.toString()
    return query ? `/api/customers/export?${query}` : '/api/customers/export'
  }, [selectedSources, search])

  function toggleSort(field: ListSortField) {
    if (field === sortField) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allVisibleSelected = visible.length > 0 && visible.every((c) => selectedIds.has(c.id))

  function toggleSelectAllVisible() {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev)
        visible.forEach((c) => next.delete(c.id))
        return next
      }
      const next = new Set(prev)
      visible.forEach((c) => next.add(c.id))
      return next
    })
  }

  function handleBulkDone() {
    setSelectedIds(new Set())
    router.refresh()
  }

  function handleDelete(id: string) {
    if (!confirm('이 고객 정보를 삭제할까요?')) return
    setError(null)
    startTransition(async () => {
      try {
        await deleteCustomer(id)
        setCustomers((prev) => prev.filter((c) => c.id !== id))
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : '삭제 중 오류가 발생했습니다.')
      }
    })
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름, 소속, 연락처, 이메일 검색"
          className="input max-w-xs"
        />
        <SourceFilterDropdown options={sourceOptions} selected={selectedSources} onChange={setSelectedSources} />
        <a href={exportHref} className="btn-secondary sm:ml-auto">
          엑셀 내보내기
        </a>
      </div>

      {selectedIds.size > 0 && (
        <BulkActionsBar
          selectedIds={[...selectedIds]}
          sourceOptions={sourceOptions}
          onDone={handleBulkDone}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {error && <p className="mb-3 text-sm text-stamp">{error}</p>}

      {visible.length === 0 && (
        <div className="card px-3 py-10 text-center text-sm text-ink-muted">표시할 고객이 없습니다.</div>
      )}

      {visible.length > 0 && (
        <>
          {/* Mobile: stacked cards. Hidden from sm: up, where the table takes over. */}
          <label className="mb-2 flex w-fit items-center gap-2 text-sm text-ink-muted sm:hidden">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
              className="accent-accent"
            />
            전체 선택 ({visible.length})
          </label>
          <ul className="flex flex-col gap-3 sm:hidden">
            {visible.map((customer) => (
              <li key={customer.id} className="card p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(customer.id)}
                      onChange={() => toggleSelect(customer.id)}
                      className="accent-accent"
                      aria-label={`${customer.name} 선택`}
                    />
                    <FavoriteToggle id={customer.id} initialValue={customer.isFavorite} />
                    <SourceTag value={customer.source} />
                  </div>
                  <Link href={`/customers/${customer.id}`} className="btn-link text-xs">
                    상세보기
                  </Link>
                </div>
                <p className="text-xs text-ink-muted">{customer.company}</p>
                <div className="text-base">
                  <BusinessCardPreview name={customer.name} imageUrl={customer.businessCardUrl} />
                </div>
                <dl className="mt-2 flex flex-col gap-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-ink-muted">연락처</dt>
                    <dd>
                      <a href={`tel:${customer.phoneNormalized}`} className="btn-link font-mono">
                        {formatPhone(customer.phoneNormalized)}
                      </a>
                    </dd>
                  </div>
                  {customer.email && (
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 text-ink-muted">이메일</dt>
                      <dd>
                        <a href={`mailto:${customer.email}`} className="btn-link break-all">
                          {customer.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {customer.memo && (
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 text-ink-muted">메모</dt>
                      <dd className="text-ink-muted">{customer.memo}</dd>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-ink-muted">등록일</dt>
                    <dd className="font-mono text-[13px] text-ink-muted">{formatDate(customer.createdAt)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-ink-muted">마지막 연락</dt>
                    <dd className="text-ink-muted">
                      <ContactHistoryPreview label={lastContactLabel(customer)} logs={customer.recentContactLogs} />
                    </dd>
                  </div>
                </dl>
                <div className="mt-3 flex gap-3 border-t border-line pt-3">
                  <Link href={`/customers/${customer.id}/edit`} className="btn-link text-sm">
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    disabled={isPending}
                    className="text-sm text-stamp hover:underline"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop / tablet: full table. */}
          <div className="card hidden overflow-x-auto sm:block">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-line py-2 pl-3 pr-1.5">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      className="accent-accent"
                      aria-label="현재 목록 전체 선택"
                    />
                  </th>
                  <th
                    onClick={() => toggleSort('favorite')}
                    className="cursor-pointer whitespace-nowrap border-b border-line px-1.5 py-2 text-left text-xs font-medium text-ink-muted hover:text-ink"
                  >
                    ★{sortField === 'favorite' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                  {COLUMNS.map(({ field, label }) => (
                    <th
                      key={field}
                      onClick={() => toggleSort(field)}
                      className="cursor-pointer whitespace-nowrap border-b border-line px-2.5 py-2 text-left text-xs font-medium text-ink-muted hover:text-ink"
                    >
                      {label}
                      {sortField === field ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                    </th>
                  ))}
                  <th
                    onClick={() => toggleSort('contactCount')}
                    className="cursor-pointer whitespace-nowrap border-b border-line px-2.5 py-2 text-left text-xs font-medium text-ink-muted hover:text-ink"
                  >
                    마지막 연락
                    {sortField === 'contactCount' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                  <th className="border-b border-line px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {visible.map((customer) => (
                  <tr key={customer.id} className="border-b border-line last:border-0 hover:bg-paper">
                    <td className="py-2.5 pl-3 pr-1.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(customer.id)}
                        onChange={() => toggleSelect(customer.id)}
                        className="accent-accent"
                        aria-label={`${customer.name} 선택`}
                      />
                    </td>
                    <td className="px-1.5 py-2.5">
                      <FavoriteToggle id={customer.id} initialValue={customer.isFavorite} />
                    </td>
                    <td className="px-2.5 py-2.5">
                      <SourceTag value={customer.source} />
                    </td>
                    <td className="max-w-28 truncate px-2.5 py-2.5">{customer.company}</td>
                    <td className="px-2.5 py-2.5">
                      <BusinessCardPreview name={customer.name} imageUrl={customer.businessCardUrl} />
                    </td>
                    <td className="px-2.5 py-2.5">
                      <a href={`tel:${customer.phoneNormalized}`} className="btn-link font-mono text-[13px]">
                        {formatPhone(customer.phoneNormalized)}
                      </a>
                    </td>
                    <td className="max-w-36 truncate px-2.5 py-2.5 text-ink-muted">
                      {customer.email ? (
                        <a href={`mailto:${customer.email}`} className="btn-link">
                          {customer.email}
                        </a>
                      ) : (
                        ''
                      )}
                    </td>
                    <td className="max-w-32 truncate px-2.5 py-2.5 text-ink-muted">{customer.memo ?? ''}</td>
                    <td className="px-2.5 py-2.5 font-mono text-[13px] text-ink-muted">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-2.5 text-ink-muted">
                      <ContactHistoryPreview label={lastContactLabel(customer)} logs={customer.recentContactLogs} />
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-2.5">
                      <Link href={`/customers/${customer.id}`} className="btn-link mr-2 text-sm">
                        상세
                      </Link>
                      <Link href={`/customers/${customer.id}/edit`} className="btn-link mr-2 text-sm">
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        disabled={isPending}
                        className="text-sm text-stamp hover:underline"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
