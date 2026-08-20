import { describe, it, expect } from 'vitest'
import { validateCustomerInput } from './validation'

const SOURCES = ['지인소개', '웹사이트', '기타']

describe('validateCustomerInput', () => {
  it('returns no errors for a fully valid input', () => {
    const errors = validateCustomerInput(
      { source: '지인소개', name: '홍길동', company: '테스트회사', phone: '010-1234-5678' },
      SOURCES
    )
    expect(errors).toEqual([])
  })

  it('flags each missing required field', () => {
    const errors = validateCustomerInput({ source: '', name: '', company: '', phone: '' }, SOURCES)
    expect(errors.map((e) => e.field).sort()).toEqual(['company', 'name', 'phone', 'source'])
  })

  it('flags a source value not in the allowed list', () => {
    const errors = validateCustomerInput(
      { source: '존재하지않는값', name: '홍길동', company: '테스트회사', phone: '010-1234-5678' },
      SOURCES
    )
    expect(errors).toEqual([{ field: 'source', message: '구분 값이 목록에 없습니다.' }])
  })

  it('does not require email or memo', () => {
    const errors = validateCustomerInput(
      { source: '기타', name: '홍길동', company: '테스트회사', phone: '010-1234-5678' },
      SOURCES
    )
    expect(errors).toEqual([])
  })
})
