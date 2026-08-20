'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { sortCustomers, filterCustomers, type SortField, type SortDirection } from '@/lib/customers/list'
import { deleteCustomer } from '@/lib/customers/actions'
import type { Customer } from '@/lib/customers/types'
import { SourceTag } from './source-tag'
import { SourceFilterDropdown } from './source-filter-dropdown'

const COLUMNS: { field: SortField; label: string }[] = [
  { field: 'source', label: '구분' },
  { field: 'name', label: '이름' },
  { field: 'company', label: '소속' },
  { field: 'phone', label: '연락처' },
  { field: 'email', label: '이메일' },
  { field: 'memo', label: '메모' },
  { field: 'createdAt', label: '등록일' },
]

export function CustomerListClient({
  initialCustomers,
  sourceOptions,
}: {
  initialCustomers: Customer[]
  sourceOptions: string[]
}) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const visible = useMemo(() => {
    const filtered = filterCustomers(customers, { sources: selectedSources, search })
    return sortCustomers(filtered, sortField, sortDirection)
  }, [customers, selectedSources, search, sortField, sortDirection])

  const exportHref = useMemo(() => {
    const params = new URLSearchParams()
    if (selectedSources.length > 0) params.set('sources', selectedSources.join(','))
    if (search.trim() !== '') params.set('search', search.trim())
    const query = params.toString()
    return query ? `/api/customers/export?${query}` : '/api/customers/export'
  }, [selectedSources, search])

  function toggleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  function handleDelete(id: string) {
    if (!confirm('이 고객 정보를 삭제할까요?')) return
    setError(null)
    startTransition(async () => {
      try {
        await deleteCustomer(id)
        setCustomers((prev) => prev.filter((c) => c.id !== id))
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
        <a href={exportHref} className="btn-secondary ml-auto">
          엑셀 내보내기
        </a>
      </div>

      {error && <p className="mb-3 text-sm text-stamp">{error}</p>}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr>
              {COLUMNS.map(({ field, label }) => (
                <th
                  key={field}
                  onClick={() => toggleSort(field)}
                  className="cursor-pointer whitespace-nowrap border-b border-line px-3 py-2.5 text-left text-xs font-medium text-ink-muted hover:text-ink"
                >
                  {label}
                  {sortField === field ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
              <th className="border-b border-line px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {visible.map((customer) => (
              <tr key={customer.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-3 py-2.5">
                  <SourceTag value={customer.source} />
                </td>
                <td className="px-3 py-2.5 font-medium text-ink">{customer.name}</td>
                <td className="px-3 py-2.5">{customer.company}</td>
                <td className="px-3 py-2.5 font-mono text-[13px]">{customer.phone}</td>
                <td className="px-3 py-2.5 text-ink-muted">{customer.email ?? ''}</td>
                <td className="max-w-48 truncate px-3 py-2.5 text-ink-muted">{customer.memo ?? ''}</td>
                <td className="px-3 py-2.5 font-mono text-[13px] text-ink-muted">
                  {new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul' }).format(new Date(customer.createdAt))}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <Link href={`/customers/${customer.id}/edit`} className="btn-link mr-3 text-sm">
                    수정
                  </Link>
                  <button onClick={() => handleDelete(customer.id)} disabled={isPending} className="text-sm text-stamp hover:underline">
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visible.length === 0 && (
          <p className="px-3 py-10 text-center text-sm text-ink-muted">표시할 고객이 없습니다.</p>
        )}
      </div>
    </div>
  )
}
