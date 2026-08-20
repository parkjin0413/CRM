'use client'

import { useEffect, useMemo, useState } from 'react'

const MAX_SIZE_BYTES = 8 * 1024 * 1024

export function BusinessCardUpload({
  existingUrl,
  onChange,
}: {
  existingUrl?: string | null
  onChange: (file: File | null, removeExisting: boolean) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setError(null)
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.')
        return
      }
      if (selected.size > MAX_SIZE_BYTES) {
        setError('파일 크기는 8MB 이하로 올려주세요.')
        return
      }
    }
    setFile(selected)
    setRemoved(false)
    onChange(selected, false)
  }

  function handleRemove() {
    setFile(null)
    setRemoved(true)
    onChange(null, true)
  }

  const displayUrl = objectUrl ?? (removed ? null : existingUrl ?? null)

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-ink">명함 사진</span>
      {displayUrl ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt="명함 미리보기"
            className="h-20 w-32 rounded-md border border-line object-cover"
          />
          <button type="button" onClick={handleRemove} className="btn-secondary">
            제거
          </button>
        </div>
      ) : (
        <label className="btn-secondary w-fit cursor-pointer">
          명함 사진 선택
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
      {error && <span className="text-xs text-stamp">{error}</span>}
    </div>
  )
}
