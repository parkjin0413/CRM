import { getSourceOptions } from '@/lib/customers/actions'
import { SourceOptionsClient } from '@/components/source-options-client'

export default async function SourceSettingsPage() {
  const options = await getSourceOptions()
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-xl font-semibold">구분(유입 경로) 관리</h1>
      <SourceOptionsClient initialOptions={options} />
    </main>
  )
}
