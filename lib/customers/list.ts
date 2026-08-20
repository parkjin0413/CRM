import type { Customer } from './types'

export type SortField = 'source' | 'name' | 'company' | 'phone' | 'email' | 'memo' | 'createdAt'
export type SortDirection = 'asc' | 'desc'

export function sortCustomers(customers: Customer[], field: SortField, direction: SortDirection): Customer[] {
  const sorted = [...customers].sort((a, b) => {
    const aVal = (a[field] ?? '').toString()
    const bVal = (b[field] ?? '').toString()
    return aVal.localeCompare(bVal, 'ko')
  })
  return direction === 'asc' ? sorted : sorted.reverse()
}

export function filterCustomers(
  customers: Customer[],
  { sources, search }: { sources: string[]; search: string }
): Customer[] {
  const query = search.trim().toLowerCase()
  const normalizedQuery = query.replace(/\D/g, '')
  return customers.filter((c) => {
    const matchesSource = sources.length === 0 || sources.includes(c.source)
    const matchesSearch =
      query === '' ||
      c.name.toLowerCase().includes(query) ||
      c.company.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      (normalizedQuery !== '' && c.phoneNormalized.includes(normalizedQuery)) ||
      (c.email ?? '').toLowerCase().includes(query)
    return matchesSource && matchesSearch
  })
}
