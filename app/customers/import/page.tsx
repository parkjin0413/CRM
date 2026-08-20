import { CustomerImportClient } from '@/components/customer-import-client'
import { AppHeader } from '@/components/app-header'

export default function ImportPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <AppHeader title="엑셀 일괄등록" />
      <p className="mb-4 text-sm text-ink-muted">
        먼저 목록 화면의 &quot;양식 다운로드&quot;로 받은 양식을 채운 뒤 업로드하세요.
      </p>
      <CustomerImportClient />
    </main>
  )
}
