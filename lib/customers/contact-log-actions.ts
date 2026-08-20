'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server-client'
import { mapRowToContactLog, type ContactLog, type ContactLogRow } from './contact-log'
import type { Customer } from './types'

export async function getContactLogs(customerId: string): Promise<ContactLog[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('contact_logs')
    .select('*')
    .eq('customer_id', customerId)
    .order('contacted_at', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as ContactLogRow[] | null ?? []).map(mapRowToContactLog)
}

export async function addContactLog(
  customerId: string,
  input: { contactedAt: string; method: string; note?: string }
): Promise<ContactLog> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('contact_logs')
    .insert({
      customer_id: customerId,
      contacted_at: input.contactedAt,
      method: input.method,
      note: input.note?.trim() || null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${customerId}`)
  revalidatePath('/')
  return mapRowToContactLog(data as ContactLogRow)
}

export async function deleteContactLog(id: string, customerId: string): Promise<void> {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from('contact_logs').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${customerId}`)
  revalidatePath('/')
}

/** Adds the same contact log entry to many customers at once (e.g. "문자 발송함" after a mass text). */
export async function addContactLogBulk(
  customerIds: string[],
  input: { contactedAt: string; method: string; note?: string }
): Promise<{ count: number }> {
  if (customerIds.length === 0) return { count: 0 }

  const supabase = getSupabaseServerClient()
  const note = input.note?.trim() || null
  const rows = customerIds.map((customerId) => ({
    customer_id: customerId,
    contacted_at: input.contactedAt,
    method: input.method,
    note,
  }))
  const { error } = await supabase.from('contact_logs').insert(rows)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  return { count: rows.length }
}

/**
 * Attaches each customer's contact-log summary (last date, count, a few recent
 * entries for hover previews). Only call where it's actually displayed.
 */
export async function attachContactSummaries(customers: Customer[]): Promise<Customer[]> {
  if (customers.length === 0) return customers

  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('contact_logs')
    .select('customer_id, contacted_at, method, note')
    .in('customer_id', customers.map((c) => c.id))
    .order('contacted_at', { ascending: false })
  if (error) throw new Error(error.message)

  const logsByCustomer = new Map<string, { contactedAt: string; method: string; note: string | null }[]>()
  for (const row of data ?? []) {
    const list = logsByCustomer.get(row.customer_id) ?? []
    list.push({ contactedAt: row.contacted_at as string, method: row.method as string, note: row.note as string | null })
    logsByCustomer.set(row.customer_id, list)
  }

  return customers.map((c) => {
    const logs = logsByCustomer.get(c.id) ?? []
    return {
      ...c,
      lastContactedAt: logs[0]?.contactedAt ?? null,
      contactCount: logs.length,
      recentContactLogs: logs.slice(0, 5),
    }
  })
}
