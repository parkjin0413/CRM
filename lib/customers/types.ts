export type Customer = {
  id: string
  source: string
  name: string
  company: string
  phone: string
  phoneNormalized: string
  email: string | null
  memo: string | null
  createdAt: string
  updatedAt: string
}

export type CustomerInput = {
  source: string
  name: string
  company: string
  phone: string
  email?: string
  memo?: string
}

export type CustomerRow = {
  id: string
  source: string
  name: string
  company: string
  phone: string
  phone_normalized: string
  email: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

export function mapRowToCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    source: row.source,
    name: row.name,
    company: row.company,
    phone: row.phone,
    phoneNormalized: row.phone_normalized,
    email: row.email,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
