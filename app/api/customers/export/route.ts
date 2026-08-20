import * as XLSX from 'xlsx'
import { getCustomers } from '@/lib/customers/actions'
import { buildExportWorkbook } from '@/lib/customers/excel'

export async function GET() {
  const customers = await getCustomers()
  const workbook = buildExportWorkbook(customers)
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="customers-export.xlsx"',
    },
  })
}
