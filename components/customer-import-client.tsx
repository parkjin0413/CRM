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
    <div className="card flex max-w-lg flex-col gap-4 p-6">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">엑셀 파일</span>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null)
            setResult(null)
            setInsertedCount(null)
          }}
          className="text-sm text-ink-muted file:mr-3 file:rounded-md file:border-0 file:bg-paper file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-line/40"
        />
      </label>
      <button onClick={handlePreview} disabled={!file || isPending} className="btn-primary w-fit">
        업로드 및 미리보기
      </button>

      {error && (
        <p role="alert" className="text-sm text-stamp">
          {error}
        </p>
      )}

      {result && insertedCount === null && (
        <div className="rounded-md border border-line bg-paper p-3 text-sm">
          <p className="text-ink">
            정상 {result.valid.length}건 / 중복 제외 {result.duplicates.length}건 / 오류 {result.errors.length}건
          </p>
          {result.duplicates.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-[#7a5b15]">
              {result.duplicates.map((d) => (
                <li key={d.rowNumber}>
                  {d.rowNumber}행: {d.reason}
                </li>
              ))}
            </ul>
          )}
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-stamp">
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
            className="btn-primary mt-3 w-fit"
          >
            등록
          </button>
        </div>
      )}

      {insertedCount !== null && (
        <div className="rounded-md border border-line bg-paper p-3 text-sm">
          <p className="text-ink">{insertedCount}건 등록됨</p>
          <button onClick={() => router.push('/')} className="btn-secondary mt-3 w-fit">
            목록으로 돌아가기
          </button>
        </div>
      )}
    </div>
  )
}
