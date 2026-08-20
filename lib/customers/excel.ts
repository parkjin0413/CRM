import * as XLSX from 'xlsx'
import type { Customer } from './types'

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
