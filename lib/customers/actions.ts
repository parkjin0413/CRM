'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server-client'
import { normalizePhone } from './phone'
import { validateCustomerInput, type ValidationError } from './validation'
import { mapRowToCustomer, type Customer, type CustomerInput, type CustomerRow } from './types'

const BUSINESS_CARD_BUCKET = 'business-cards'
const BUSINESS_CARD_SIGNED_URL_TTL_SECONDS = 60 * 60

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

/** Attaches short-lived signed URLs for display. Only call where cards are actually shown. */
export async function attachBusinessCardUrls(customers: Customer[]): Promise<Customer[]> {
  const paths = customers.map((c) => c.businessCardPath).filter((p): p is string => !!p)
  if (paths.length === 0) return customers

  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.storage
    .from(BUSINESS_CARD_BUCKET)
    .createSignedUrls(paths, BUSINESS_CARD_SIGNED_URL_TTL_SECONDS)
  if (error) throw new Error(error.message)

  const urlByPath = new Map((data ?? []).map((d) => [d.path, d.signedUrl]))
  return customers.map((c) =>
    c.businessCardPath ? { ...c, businessCardUrl: urlByPath.get(c.businessCardPath) ?? null } : c
  )
}

async function uploadBusinessCard(file: File): Promise<string> {
  const supabase = getSupabaseServerClient()
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const path = `${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage
    .from(BUSINESS_CARD_BUCKET)
    .upload(path, file, { contentType: file.type || undefined })
  if (error) throw new Error(error.message)
  return path
}

async function deleteBusinessCard(path: string): Promise<void> {
  const supabase = getSupabaseServerClient()
  await supabase.storage.from(BUSINESS_CARD_BUCKET).remove([path])
}

export type CreateCustomerResult =
  | { status: 'created'; customer: Customer }
  | { status: 'duplicate'; existing: Customer }
  | { status: 'invalid'; errors: ValidationError[] }

export async function createCustomer(
  input: CustomerInput,
  options: { force?: boolean; businessCardFile?: File | null } = {}
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

  const businessCardPath = options.businessCardFile ? await uploadBusinessCard(options.businessCardFile) : null

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
      business_card_path: businessCardPath,
    })
    .select()
    .single()

  if (error) {
    if (businessCardPath) await deleteBusinessCard(businessCardPath)
    throw new Error(error.message)
  }
  revalidatePath('/')
  return { status: 'created', customer: mapRowToCustomer(data as CustomerRow) }
}

export type UpdateCustomerResult =
  | { status: 'ok' }
  | { status: 'invalid'; errors: ValidationError[] }

export async function updateCustomer(
  id: string,
  input: CustomerInput,
  options: { businessCardFile?: File | null; removeBusinessCard?: boolean } = {}
): Promise<UpdateCustomerResult> {
  const sourceOptions = await getSourceOptions()
  const errors = validateCustomerInput(input, sourceOptions)
  if (errors.length > 0) {
    return { status: 'invalid', errors }
  }

  const supabase = getSupabaseServerClient()

  let businessCardPath: string | null | undefined
  let previousPath: string | null = null
  if (options.businessCardFile || options.removeBusinessCard) {
    const { data: existing } = await supabase.from('customers').select('business_card_path').eq('id', id).single()
    previousPath = (existing?.business_card_path as string | null) ?? null
  }
  if (options.businessCardFile) {
    businessCardPath = await uploadBusinessCard(options.businessCardFile)
  } else if (options.removeBusinessCard) {
    businessCardPath = null
  }

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
      ...(businessCardPath !== undefined ? { business_card_path: businessCardPath } : {}),
    })
    .eq('id', id)

  if (error) {
    if (options.businessCardFile && businessCardPath) await deleteBusinessCard(businessCardPath)
    throw new Error(error.message)
  }
  if (previousPath && previousPath !== businessCardPath) {
    await deleteBusinessCard(previousPath)
  }

  revalidatePath('/')
  return { status: 'ok' }
}

export async function toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from('customers').update({ is_favorite: isFavorite }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath(`/customers/${id}`)
}

export async function updateSourceBulk(customerIds: string[], newSource: string): Promise<{ count: number }> {
  if (customerIds.length === 0) return { count: 0 }
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from('customers').update({ source: newSource }).in('id', customerIds)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  return { count: customerIds.length }
}

export async function updateFavoriteBulk(customerIds: string[], isFavorite: boolean): Promise<{ count: number }> {
  if (customerIds.length === 0) return { count: 0 }
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from('customers').update({ is_favorite: isFavorite }).in('id', customerIds)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  return { count: customerIds.length }
}

export async function deleteCustomer(id: string): Promise<void> {
  const supabase = getSupabaseServerClient()
  const { data: existing } = await supabase.from('customers').select('business_card_path').eq('id', id).single()
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw new Error(error.message)
  const path = existing?.business_card_path as string | null
  if (path) await deleteBusinessCard(path)
  revalidatePath('/')
}

export async function deleteCustomerBulk(customerIds: string[]): Promise<{ count: number }> {
  if (customerIds.length === 0) return { count: 0 }

  const supabase = getSupabaseServerClient()
  const { data: existing } = await supabase
    .from('customers')
    .select('business_card_path')
    .in('id', customerIds)
  const { error } = await supabase.from('customers').delete().in('id', customerIds)
  if (error) throw new Error(error.message)

  const paths = (existing ?? [])
    .map((row) => row.business_card_path as string | null)
    .filter((p): p is string => !!p)
  if (paths.length > 0) {
    await supabase.storage.from(BUSINESS_CARD_BUCKET).remove(paths)
  }

  revalidatePath('/')
  return { count: customerIds.length }
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
