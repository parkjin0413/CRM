'use server'

import * as XLSX from 'xlsx'
import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server-client'
import { getSourceOptions, getCustomers } from './actions'
import { parseCustomerRows, type ParseResult } from './excel'
import { normalizePhone } from './phone'
import type { CustomerInput } from './types'

export type { ParseResult, ParseIssue, ParsedRow } from './excel'

export async function parseImportFile(formData: FormData): Promise<ParseResult> {
  const file = formData.get('file')
  if (!(file instanceof File)) {
    throw new Error('업로드할 파일이 없습니다.')
  }

  const [sourceOptions, existingCustomers] = await Promise.all([getSourceOptions(), getCustomers()])
  const existingPhones = new Set(existingCustomers.map((c) => c.phoneNormalized))

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  return parseCustomerRows(workbook, sourceOptions, existingPhones)
}

export type CommitImportResult = {
  insertedCount: number
}

export async function commitImportRows(rows: CustomerInput[]): Promise<CommitImportResult> {
  if (rows.length === 0) {
    return { insertedCount: 0 }
  }

  const supabase = getSupabaseServerClient()
  let insertedCount = 0

  for (const input of rows) {
    const { error } = await supabase.from('customers').insert({
      source: input.source,
      name: input.name,
      company: input.company,
      phone: input.phone,
      phone_normalized: normalizePhone(input.phone),
      email: input.email || null,
      memo: input.memo || null,
    })
    if (!error) {
      insertedCount += 1
    }
  }

  revalidatePath('/')

  return { insertedCount }
}
