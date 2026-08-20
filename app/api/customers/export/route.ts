import * as XLSX from 'xlsx'
import { getCustomers } from '@/lib/customers/actions'
import { buildExportWorkbook } from '@/lib/customers/excel'
import { filterCustomers } from '@/lib/customers/list'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const search = url.searchParams.get('search') ?? ''
  const sources = url.searchParams
    .getAll('sources')
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter((value) => value !== '')

  const customers = await getCustomers()
  const filtered = filterCustomers(customers, { sources, search })
  const workbook = buildExportWorkbook(filtered)
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="customers-export.xlsx"',
    },
  })
}
