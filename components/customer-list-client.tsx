'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { sortCustomers, filterCustomers, type SortField, type SortDirection } from '@/lib/customers/list'
import { deleteCustomer } from '@/lib/customers/actions'
import type { Customer } from '@/lib/customers/types'

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
  const [isPending, startTransition] = useTransition()

  const visible = useMemo(() => {
    const filtered = filterCustomers(customers, { sources: selectedSources, search })
    return sortCustomers(filtered, sortField, sortDirection)
  }, [customers, selectedSources, search, sortField, sortDirection])

  function toggleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  function toggleSource(source: string) {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    )
  }

  function handleDelete(id: string) {
    if (!confirm('이 고객 정보를 삭제할까요?')) return
    startTransition(async () => {
      await deleteCustomer(id)
      setCustomers((prev) => prev.filter((c) => c.id !== id))
    })
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름, 소속, 연락처, 이메일 검색"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2 text-sm">
          {sourceOptions.map((source) => (
            <label key={source} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedSources.includes(source)}
                onChange={() => toggleSource(source)}
              />
              {source}
            </label>
          ))}
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {COLUMNS.map(({ field, label }) => (
              <th
                key={field}
                onClick={() => toggleSort(field)}
                className="cursor-pointer border-b border-gray-300 px-2 py-2 text-left"
              >
                {label}
                {sortField === field ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
            <th className="border-b border-gray-300 px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {visible.map((customer) => (
            <tr key={customer.id} className="border-b border-gray-100">
              <td className="px-2 py-2">{customer.source}</td>
              <td className="px-2 py-2">{customer.name}</td>
              <td className="px-2 py-2">{customer.company}</td>
              <td className="px-2 py-2">{customer.phone}</td>
              <td className="px-2 py-2">{customer.email ?? ''}</td>
              <td className="px-2 py-2">{customer.memo ?? ''}</td>
              <td className="px-2 py-2">{new Date(customer.createdAt).toLocaleDateString('ko-KR')}</td>
              <td className="px-2 py-2">
                <Link href={`/customers/${customer.id}/edit`} className="mr-2 text-blue-600">
                  수정
                </Link>
                <button onClick={() => handleDelete(customer.id)} disabled={isPending} className="text-red-600">
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {visible.length === 0 && <p className="mt-4 text-sm text-gray-500">표시할 고객이 없습니다.</p>}
    </div>
  )
}
