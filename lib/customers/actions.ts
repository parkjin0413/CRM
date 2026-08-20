'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server-client'
import { normalizePhone } from './phone'
import { validateCustomerInput, type ValidationError } from './validation'
import { mapRowToCustomer, type Customer, type CustomerInput, type CustomerRow } from './types'

export async function getSourceOptions(): Promise<string[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.from('source_options').select('value').order('sort_order')
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => row.value as string)
}

export async function getCustomers(): Promise<Customer[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as CustomerRow[] | null ?? []).map(mapRowToCustomer)
}

export type CreateCustomerResult =
  | { status: 'created'; customer: Customer }
  | { status: 'duplicate'; existing: Customer }
  | { status: 'invalid'; errors: ValidationError[] }

export async function createCustomer(
  input: CustomerInput,
  options: { force?: boolean } = {}
): Promise<CreateCustomerResult> {
  const sourceOptions = await getSourceOptions()
  const errors = validateCustomerInput(input, sourceOptions)
  if (errors.length > 0) {
    return { status: 'invalid', errors }
  }

  const phoneNormalized = normalizePhone(input.phone)
  const supabase = getSupabaseServerClient()

  if (!options.force) {
    const { data: existingRows, error: lookupError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone_normalized', phoneNormalized)
      .limit(1)
    if (lookupError) throw new Error(lookupError.message)
    if (existingRows && existingRows.length > 0) {
      return { status: 'duplicate', existing: mapRowToCustomer(existingRows[0] as CustomerRow) }
    }
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      source: input.source,
      name: input.name,
      company: input.company,
      phone: input.phone,
      phone_normalized: phoneNormalized,
      email: input.email || null,
      memo: input.memo || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/')
  return { status: 'created', customer: mapRowToCustomer(data as CustomerRow) }
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<void> {
  const sourceOptions = await getSourceOptions()
  const errors = validateCustomerInput(input, sourceOptions)
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join(', '))
  }

  const supabase = getSupabaseServerClient()
  const { error } = await supabase
    .from('customers')
    .update({
      source: input.source,
      name: input.name,
      company: input.company,
      phone: input.phone,
      phone_normalized: normalizePhone(input.phone),
      email: input.email || null,
      memo: input.memo || null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function deleteCustomer(id: string): Promise<void> {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
}
