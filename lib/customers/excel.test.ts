import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { EXCEL_HEADERS, buildTemplateWorkbook, buildExportWorkbook } from './excel'
import type { Customer } from './types'

describe('buildTemplateWorkbook', () => {
  it('has a header row matching EXCEL_HEADERS and one example row', () => {
    const wb = buildTemplateWorkbook('지인소개')
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })
    expect(rows[0]).toEqual([...EXCEL_HEADERS])
    expect(rows[1][0]).toBe('지인소개')
    expect(rows).toHaveLength(2)
  })
})

describe('buildExportWorkbook', () => {
  const customers: Customer[] = [
    {
      id: '1',
      source: '웹사이트',
      name: '홍길동',
      company: '테스트회사',
      phone: '010-1234-5678',
      phoneNormalized: '01012345678',
      email: 'hong@example.com',
      memo: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]

  it('writes one row per customer plus a header row', () => {
    const wb = buildExportWorkbook(customers)
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })
    expect(rows).toHaveLength(2)
    expect(rows[1][1]).toBe('홍길동')
  })
})
