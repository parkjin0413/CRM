'use server'

import * as XLSX from 'xlsx'
import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server-client'
import { getSourceOptions, getCustomers } from './actions'
import { parseCustomerRows, type ParseIssue } from './excel'
import { normalizePhone } from './phone'

export type BulkImportResult = {
  insertedCount: number
  duplicates: ParseIssue[]
  errors: ParseIssue[]
}

export async function bulkImportCustomers(formData: FormData): Promise<BulkImportResult> {
  const file = formData.get('file')
  if (!(file instanceof File)) {
    throw new Error('업로드할 파일이 없습니다.')
  }

  const [sourceOptions, existingCustomers] = await Promise.all([getSourceOptions(), getCustomers()])
  const existingPhones = new Set(existingCustomers.map((c) => c.phoneNormalized))

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const { valid, duplicates, errors } = parseCustomerRows(workbook, sourceOptions, existingPhones)

  if (valid.length === 0) {
    return { insertedCount: 0, duplicates, errors }
  }

  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from('customers').insert(
    valid.map(({ input }) => ({
      source: input.source,
      name: input.name,
      company: input.company,
      phone: input.phone,
      phone_normalized: normalizePhone(input.phone),
      email: input.email || null,
      memo: input.memo || null,
    }))
  )
  if (error) throw new Error(error.message)

  revalidatePath('/')

  return { insertedCount: valid.length, duplicates, errors }
}
