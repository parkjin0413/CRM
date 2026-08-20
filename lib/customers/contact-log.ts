export const CONTACT_METHODS = ['문자', '전화', '이메일', '방문', '기타'] as const
export type ContactMethod = (typeof CONTACT_METHODS)[number]

export type ContactLog = {
  id: string
  customerId: string
  contactedAt: string
  method: string
  note: string | null
  createdAt: string
}

export type ContactLogRow = {
  id: string
  customer_id: string
  contacted_at: string
  method: string
  note: string | null
  created_at: string
}

export function mapRowToContactLog(row: ContactLogRow): ContactLog {
  return {
    id: row.id,
    customerId: row.customer_id,
    contactedAt: row.contacted_at,
    method: row.method,
    note: row.note,
    createdAt: row.created_at,
  }
}
