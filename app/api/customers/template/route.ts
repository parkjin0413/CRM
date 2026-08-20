import * as XLSX from 'xlsx'
import { getSourceOptions } from '@/lib/customers/actions'
import { buildTemplateWorkbook } from '@/lib/customers/excel'

export async function GET() {
  const sourceOptions = await getSourceOptions()
  const workbook = buildTemplateWorkbook(sourceOptions[0] ?? '')
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="customer-import-template.xlsx"',
    },
  })
}
