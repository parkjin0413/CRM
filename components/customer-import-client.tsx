'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { bulkImportCustomers, type BulkImportResult } from '@/lib/customers/bulk-import'

export function CustomerImportClient() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<BulkImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleUpload() {
    if (!file) return
    setError(null)
    setResult(null)
    const formData = new FormData()
    formData.set('file', file)
    startTransition(async () => {
      try {
        const res = await bulkImportCustomers(formData)
        setResult(res)
      } catch (e) {
        setError(e instanceof Error ? e.message : '업로드 중 오류가 발생했습니다.')
      }
    })
  }

  return (
    <div className="flex max-w-lg flex-col gap-3 font-sans">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        onClick={handleUpload}
        disabled={!file || isPending}
        className="w-fit rounded bg-black px-3 py-2 text-white"
      >
        업로드 및 미리보기
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="rounded border border-gray-300 p-3 text-sm">
          <p>
            정상 {result.insertedCount}건 등록됨 / 중복 제외 {result.duplicates.length}건 / 오류 {result.errors.length}건
          </p>
          {result.duplicates.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-yellow-700">
              {result.duplicates.map((d) => (
                <li key={d.rowNumber}>
                  {d.rowNumber}행: {d.reason}
                </li>
              ))}
            </ul>
          )}
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-red-700">
              {result.errors.map((e) => (
                <li key={e.rowNumber}>
                  {e.rowNumber}행: {e.reason}
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => router.push('/')} className="mt-3 rounded border border-gray-300 px-3 py-1">
            목록으로 돌아가기
          </button>
        </div>
      )}
    </div>
  )
}
