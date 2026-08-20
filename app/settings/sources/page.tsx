import { getSourceOptions } from '@/lib/customers/actions'
import { SourceOptionsClient } from '@/components/source-options-client'
import { AppHeader } from '@/components/app-header'

export const dynamic = 'force-dynamic'

export default async function SourceSettingsPage() {
  const options = await getSourceOptions()
  return (
    <main className="mx-auto max-w-2xl p-6">
      <AppHeader title="구분(유입 경로) 관리" />
      <SourceOptionsClient initialOptions={options} />
    </main>
  )
}
