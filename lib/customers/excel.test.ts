import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { EXCEL_HEADERS, buildTemplateWorkbook, buildExportWorkbook, parseCustomerRows } from './excel'
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

function workbookFromRows(rows: (string | undefined)[][]) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'sheet1')
  return wb
}

describe('parseCustomerRows', () => {
  const validSources = ['지인소개', '웹사이트']

  it('accepts fully valid rows', () => {
    const wb = workbookFromRows([
      [...EXCEL_HEADERS],
      ['지인소개', '홍길동', 'A사', '010-1111-1111', 'a@x.com', '메모1'],
      ['웹사이트', '김철수', 'B사', '010-2222-2222', '', ''],
    ])
    const result = parseCustomerRows(wb, validSources, new Set())
    expect(result.valid).toHaveLength(2)
    expect(result.errors).toHaveLength(0)
    expect(result.duplicates).toHaveLength(0)
    expect(result.valid[0].input.name).toBe('홍길동')
    expect(result.valid[0].rowNumber).toBe(2)
  })

  it('reports a row with a missing required field as an error', () => {
    const wb = workbookFromRows([
      [...EXCEL_HEADERS],
      ['지인소개', '', 'A사', '010-1111-1111', '', ''],
    ])
    const result = parseCustomerRows(wb, validSources, new Set())
    expect(result.valid).toHaveLength(0)
    expect(result.errors).toEqual([{ rowNumber: 2, reason: '이름은(는) 필수입니다.' }])
  })

  it('reports a row with an invalid source as an error', () => {
    const wb = workbookFromRows([
      [...EXCEL_HEADERS],
      ['존재하지않는구분', '홍길동', 'A사', '010-1111-1111', '', ''],
    ])
    const result = parseCustomerRows(wb, validSources, new Set())
    expect(result.errors).toEqual([{ rowNumber: 2, reason: '구분 값이 목록에 없습니다.' }])
  })

  it('reports a row matching an existing phone as a duplicate', () => {
    const wb = workbookFromRows([
      [...EXCEL_HEADERS],
      ['지인소개', '홍길동', 'A사', '010-1111-1111', '', ''],
    ])
    const result = parseCustomerRows(wb, validSources, new Set(['01011111111']))
    expect(result.valid).toHaveLength(0)
    expect(result.duplicates).toEqual([{ rowNumber: 2, reason: '이미 등록된 연락처입니다.' }])
  })

  it('reports the second occurrence of a phone repeated within the file as a duplicate', () => {
    const wb = workbookFromRows([
      [...EXCEL_HEADERS],
      ['지인소개', '홍길동', 'A사', '010-1111-1111', '', ''],
      ['웹사이트', '김철수', 'B사', '010-1111-1111', '', ''],
    ])
    const result = parseCustomerRows(wb, validSources, new Set())
    expect(result.valid).toHaveLength(1)
    expect(result.duplicates).toEqual([{ rowNumber: 3, reason: '이미 등록된 연락처입니다.' }])
  })
})
