'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server-client'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export type DashboardCustomerSummary = {
  id: string
  name: string
  company: string
  createdAt: string
  lastContactedAt: string | null
}

export type DashboardStats = {
  totalCustomers: number
  newThisMonth: number
  newLastMonth: number
  contactsLast30Days: number
  uncontactedCount: number
  sourceBreakdown: { source: string; count: number }[]
  methodBreakdown: { method: string; count: number }[]
  monthlyContacts: { month: string; count: number }[]
  staleFavorites: DashboardCustomerSummary[]
  uncontactedNew: DashboardCustomerSummary[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabaseServerClient()

  const [{ data: customers, error: custErr }, { data: logs, error: logErr }] = await Promise.all([
    supabase.from('customers').select('id, name, company, source, is_favorite, created_at'),
    supabase.from('contact_logs').select('customer_id, contacted_at, method'),
  ])
  if (custErr) throw new Error(custErr.message)
  if (logErr) throw new Error(logErr.message)

  const allCustomers = customers ?? []
  const allLogs = logs ?? []
  const now = new Date()

  const lastContactByCustomer = new Map<string, string>()
  for (const log of allLogs) {
    const prev = lastContactByCustomer.get(log.customer_id)
    if (!prev || log.contacted_at > prev) lastContactByCustomer.set(log.customer_id, log.contacted_at)
  }

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS)

  const newThisMonth = allCustomers.filter((c) => new Date(c.created_at) >= thisMonthStart).length
  const newLastMonth = allCustomers.filter((c) => {
    const d = new Date(c.created_at)
    return d >= lastMonthStart && d < thisMonthStart
  }).length

  const contactsLast30Days = allLogs.filter((l) => new Date(l.contacted_at) >= thirtyDaysAgo).length
  const uncontactedCount = allCustomers.filter((c) => !lastContactByCustomer.has(c.id)).length

  const sourceCounts = new Map<string, number>()
  for (const c of allCustomers) sourceCounts.set(c.source, (sourceCounts.get(c.source) ?? 0) + 1)
  const sourceBreakdown = [...sourceCounts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)

  const methodCounts = new Map<string, number>()
  for (const l of allLogs) methodCounts.set(l.method, (methodCounts.get(l.method) ?? 0) + 1)
  const methodBreakdown = [...methodCounts.entries()]
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count)

  const monthlyContacts: { month: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthlyContacts.push({ month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, count: 0 })
  }
  const monthIndex = new Map(monthlyContacts.map((m, i) => [m.month, i]))
  for (const l of allLogs) {
    const d = new Date(l.contacted_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const idx = monthIndex.get(key)
    if (idx !== undefined) monthlyContacts[idx].count += 1
  }

  const staleFavorites = allCustomers
    .filter((c) => c.is_favorite)
    .map((c) => ({
      id: c.id as string,
      name: c.name as string,
      company: c.company as string,
      createdAt: c.created_at as string,
      lastContactedAt: lastContactByCustomer.get(c.id) ?? null,
    }))
    .filter((c) => !c.lastContactedAt || new Date(c.lastContactedAt) < thirtyDaysAgo)
    .sort((a, b) => (a.lastContactedAt ?? '').localeCompare(b.lastContactedAt ?? ''))
    .slice(0, 8)

  const uncontactedNew = allCustomers
    .filter((c) => new Date(c.created_at) >= thirtyDaysAgo && !lastContactByCustomer.has(c.id))
    .map((c) => ({
      id: c.id as string,
      name: c.name as string,
      company: c.company as string,
      createdAt: c.created_at as string,
      lastContactedAt: null,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)

  return {
    totalCustomers: allCustomers.length,
    newThisMonth,
    newLastMonth,
    contactsLast30Days,
    uncontactedCount,
    sourceBreakdown,
    methodBreakdown,
    monthlyContacts,
    staleFavorites,
    uncontactedNew,
  }
}
