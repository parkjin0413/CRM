export type Customer = {
  id: string
  source: string
  name: string
  company: string
  phone: string
  phoneNormalized: string
  email: string | null
  memo: string | null
  businessCardPath: string | null
  /** Short-lived signed URL, attached only where the card is actually displayed. */
  businessCardUrl?: string | null
  isFavorite: boolean
  /** Contact-log summary, attached only where it's actually displayed (see attachContactSummaries). */
  lastContactedAt?: string | null
  contactCount?: number
  recentContactLogs?: { contactedAt: string; method: string; note: string | null }[]
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
  business_card_path: string | null
  is_favorite: boolean
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
    businessCardPath: row.business_card_path,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
