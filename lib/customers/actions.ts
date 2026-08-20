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

export type UpdateCustomerResult =
  | { status: 'ok' }
  | { status: 'invalid'; errors: ValidationError[] }

export async function updateCustomer(id: string, input: CustomerInput): Promise<UpdateCustomerResult> {
  const sourceOptions = await getSourceOptions()
  const errors = validateCustomerInput(input, sourceOptions)
  if (errors.length > 0) {
    return { status: 'invalid', errors }
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
  return { status: 'ok' }
}

export async function deleteCustomer(id: string): Promise<void> {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export type SourceOptionResult =
  | { status: 'ok' }
  | { status: 'error'; message: string }

export async function addSourceOption(value: string): Promise<SourceOptionResult> {
  const trimmed = value.trim()
  if (!trimmed) {
    return { status: 'error', message: '구분 값을 입력해주세요.' }
  }

  const supabase = getSupabaseServerClient()
  const { data: last, error: lookupError } = await supabase
    .from('source_options')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
  if (lookupError) throw new Error(lookupError.message)
  const nextOrder = (last?.[0]?.sort_order ?? 0) + 1

  const { error } = await supabase.from('source_options').insert({ value: trimmed, sort_order: nextOrder })
  if (error) {
    if (error.code === '23505') {
      return { status: 'error', message: '이미 존재하는 구분 값입니다.' }
    }
    return { status: 'error', message: error.message }
  }

  revalidatePath('/')
  revalidatePath('/settings/sources')
  return { status: 'ok' }
}

export async function deleteSourceOption(value: string): Promise<SourceOptionResult> {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from('source_options').delete().eq('value', value)
  if (error) {
    if (error.code === '23503') {
      return { status: 'error', message: '이 구분을 사용 중인 고객이 있어 삭제할 수 없습니다.' }
    }
    return { status: 'error', message: error.message }
  }

  revalidatePath('/')
  revalidatePath('/settings/sources')
  return { status: 'ok' }
}
