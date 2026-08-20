import { describe, it, expect } from 'vitest'
import { sortCustomers, filterCustomers } from './list'
import type { Customer } from './types'

function customer(overrides: Partial<Customer>): Customer {
  return {
    id: '1',
    source: '웹사이트',
    name: '이름',
    company: '회사',
    phone: '010-0000-0000',
    phoneNormalized: '01000000000',
    email: null,
    memo: null,
    businessCardPath: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('sortCustomers', () => {
  it('sorts by name ascending', () => {
    const list = [customer({ id: '1', name: '다' }), customer({ id: '2', name: '가' }), customer({ id: '3', name: '나' })]
    const sorted = sortCustomers(list, 'name', 'asc')
    expect(sorted.map((c) => c.name)).toEqual(['가', '나', '다'])
  })

  it('sorts by name descending', () => {
    const list = [customer({ id: '1', name: '다' }), customer({ id: '2', name: '가' }), customer({ id: '3', name: '나' })]
    const sorted = sortCustomers(list, 'name', 'desc')
    expect(sorted.map((c) => c.name)).toEqual(['다', '나', '가'])
  })

  it('sorts by createdAt chronologically', () => {
    const list = [
      customer({ id: '1', createdAt: '2026-03-01T00:00:00.000Z' }),
      customer({ id: '2', createdAt: '2026-01-01T00:00:00.000Z' }),
    ]
    const sorted = sortCustomers(list, 'createdAt', 'asc')
    expect(sorted.map((c) => c.id)).toEqual(['2', '1'])
  })

  it('does not mutate the input array', () => {
    const list = [customer({ id: '1', name: '나' }), customer({ id: '2', name: '가' })]
    sortCustomers(list, 'name', 'asc')
    expect(list.map((c) => c.id)).toEqual(['1', '2'])
  })
})

describe('filterCustomers', () => {
  const list = [
    customer({
      id: '1',
      source: '웹사이트',
      name: '김철수',
      company: 'A사',
      phone: '010-1111-1111',
      phoneNormalized: '01011111111',
      email: 'a@x.com',
    }),
    customer({
      id: '2',
      source: '지인소개',
      name: '박영희',
      company: 'B사',
      phone: '010-2222-2222',
      phoneNormalized: '01022222222',
      email: 'b@x.com',
    }),
  ]

  it('returns all rows when no sources or search are given', () => {
    expect(filterCustomers(list, { sources: [], search: '' }).map((c) => c.id)).toEqual(['1', '2'])
  })

  it('filters by selected sources', () => {
    expect(filterCustomers(list, { sources: ['지인소개'], search: '' }).map((c) => c.id)).toEqual(['2'])
  })

  it('filters by search text across name/company/phone/email', () => {
    expect(filterCustomers(list, { sources: [], search: '김철수' }).map((c) => c.id)).toEqual(['1'])
    expect(filterCustomers(list, { sources: [], search: 'B사' }).map((c) => c.id)).toEqual(['2'])
  })

  it('combines source filter and search with AND', () => {
    expect(filterCustomers(list, { sources: ['웹사이트'], search: '박영희' }).map((c) => c.id)).toEqual([])
  })

  it('matches a digits-only query against the normalized phone', () => {
    expect(filterCustomers(list, { sources: [], search: '01011111111' }).map((c) => c.id)).toEqual(['1'])
  })
})
