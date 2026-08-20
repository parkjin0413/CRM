import * as XLSX from 'xlsx'
import { validateCustomerInput } from './validation'
import { normalizePhone } from './phone'
import type { Customer, CustomerInput } from './types'

export const EXCEL_HEADERS = ['구분', '이름', '소속', '연락처', '이메일', '메모'] as const

export function buildTemplateWorkbook(exampleSource: string): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()
  const rows = [
    [...EXCEL_HEADERS],
    [exampleSource, '홍길동', '예시회사', '010-1234-5678', 'hong@example.com', '예시 메모'],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, '고객등록양식')
  return wb
}

export function buildExportWorkbook(customers: Customer[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()
  const rows = [
    [...EXCEL_HEADERS, '등록일'],
    ...customers.map((c) => [c.source, c.name, c.company, c.phone, c.email ?? '', c.memo ?? '', c.createdAt]),
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, '고객목록')
  return wb
}

export type ParsedRow = {
  rowNumber: number
  input: CustomerInput
}

export type ParseIssue = {
  rowNumber: number
  reason: string
}

export type ParseResult = {
  valid: ParsedRow[]
  duplicates: ParseIssue[]
  errors: ParseIssue[]
}

export function parseCustomerRows(
  workbook: XLSX.WorkBook,
  validSources: string[],
  existingPhones: Set<string>
): ParseResult {
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<(string | number | undefined)[]>(sheet, {
    header: 1,
    blankrows: false,
  })
  const dataRows = rows.slice(1)

  const valid: ParsedRow[] = []
  const duplicates: ParseIssue[] = []
  const errors: ParseIssue[] = []
  const seenInFile = new Set<string>()

  dataRows.forEach((row, index) => {
    const rowNumber = index + 2
    const [source, name, company, phone, email, memo] = row.map((cell) => (cell ?? '').toString().trim())
    const input: CustomerInput = { source, name, company, phone, email, memo }

    const validationErrors = validateCustomerInput(input, validSources)
    if (validationErrors.length > 0) {
      errors.push({ rowNumber, reason: validationErrors.map((e) => e.message).join(', ') })
      return
    }

    const phoneNormalized = normalizePhone(phone)
    if (existingPhones.has(phoneNormalized) || seenInFile.has(phoneNormalized)) {
      duplicates.push({ rowNumber, reason: '이미 등록된 연락처입니다.' })
      return
    }

    seenInFile.add(phoneNormalized)
    valid.push({ rowNumber, input })
  })

  return { valid, duplicates, errors }
}
