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

/** Attaches each customer's most recent contact date. Only call where it's actually shown. */
export async function attachLastContactedDates(customers: Customer[]): Promise<Customer[]> {
  if (customers.length === 0) return customers

  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('contact_logs')
    .select('customer_id, contacted_at')
    .in('customer_id', customers.map((c) => c.id))
    .order('contacted_at', { ascending: false })
  if (error) throw new Error(error.message)

  const lastByCustomer = new Map<string, string>()
  for (const row of data ?? []) {
    if (!lastByCustomer.has(row.customer_id)) {
      lastByCustomer.set(row.customer_id, row.contacted_at as string)
    }
  }

  return customers.map((c) => ({ ...c, lastContactedAt: lastByCustomer.get(c.id) ?? null }))
}
