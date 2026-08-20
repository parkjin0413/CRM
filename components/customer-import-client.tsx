'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { parseImportFile, commitImportRows, type ParseResult } from '@/lib/customers/bulk-import'

export function CustomerImportClient() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [insertedCount, setInsertedCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isCommitting, startCommitTransition] = useTransition()

  function handlePreview() {
    if (!file) return
    setError(null)
    setResult(null)
    setInsertedCount(null)
    const formData = new FormData()
    formData.set('file', file)
    startTransition(async () => {
      try {
        const res = await parseImportFile(formData)
        setResult(res)
      } catch (e) {
        setError(e instanceof Error ? e.message : '업로드 중 오류가 발생했습니다.')
      }
    })
  }

  function handleCommit() {
    if (!result || result.valid.length === 0) return
    setError(null)
    startCommitTransition(async () => {
      try {
        const { insertedCount } = await commitImportRows(result.valid.map((r) => r.input))
        setInsertedCount(insertedCount)
      } catch (e) {
        setError(e instanceof Error ? e.message : '등록 중 오류가 발생했습니다.')
      }
    })
  }

  return (
    <div className="flex max-w-lg flex-col gap-3 font-sans">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null)
          setResult(null)
          setInsertedCount(null)
        }}
      />
      <button
        onClick={handlePreview}
        disabled={!file || isPending}
        className="w-fit rounded bg-black px-3 py-2 text-white"
      >
        업로드 및 미리보기
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && insertedCount === null && (
        <div className="rounded border border-gray-300 p-3 text-sm">
          <p>
            정상 {result.valid.length}건 / 중복 제외 {result.duplicates.length}건 / 오류 {result.errors.length}건
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
          <button
            onClick={handleCommit}
            disabled={result.valid.length === 0 || isCommitting}
            className="mt-3 w-fit rounded bg-black px-3 py-2 text-white disabled:opacity-50"
          >
            등록
          </button>
        </div>
      )}

      {insertedCount !== null && (
        <div className="rounded border border-gray-300 p-3 text-sm">
          <p>{insertedCount}건 등록됨</p>
          <button onClick={() => router.push('/')} className="mt-3 rounded border border-gray-300 px-3 py-1">
            목록으로 돌아가기
          </button>
        </div>
      )}
    </div>
  )
}
