import { CustomerImportClient } from '@/components/customer-import-client'

export default function ImportPage() {
  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="mb-4 text-xl font-semibold">엑셀 일괄등록</h1>
      <p className="mb-4 text-sm text-gray-600">
        먼저 목록 화면의 &quot;양식 다운로드&quot;로 받은 양식을 채운 뒤 업로드하세요.
      </p>
      <CustomerImportClient />
    </main>
  )
}
