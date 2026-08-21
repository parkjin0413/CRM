'use client'

import { useState, type PointerEvent } from 'react'

export type LinePoint = { label: string; value: number }

const WIDTH = 560
const HEIGHT = 180
const PADDING = { top: 16, right: 12, bottom: 24, left: 12 }
const SERIES_COLOR = '#2a78d6' // categorical slot 1 (blue) — single series

export function LineChart({ title, data }: { title: string; data: LinePoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const innerW = WIDTH - PADDING.left - PADDING.right
  const innerH = HEIGHT - PADDING.top - PADDING.bottom
  const max = Math.max(1, ...data.map((d) => d.value))
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0

  const xFor = (i: number) => PADDING.left + i * stepX
  const yFor = (v: number) => PADDING.top + innerH - (v / max) * innerH

  const points = data.map((d, i) => `${xFor(i)},${yFor(d.value)}`).join(' ')

  function handleMove(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    let nearestDist = Infinity
    data.forEach((_, i) => {
      const dist = Math.abs(xFor(i) - relX)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = i
      }
    })
    setHoverIndex(nearest)
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      {data.every((d) => d.value === 0) ? (
        <p className="text-sm text-ink-muted">아직 연락 기록이 없습니다.</p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full touch-none"
            onPointerMove={handleMove}
            onPointerLeave={() => setHoverIndex(null)}
            role="img"
            aria-label={title}
          >
            <line
              x1={PADDING.left}
              y1={PADDING.top + innerH}
              x2={WIDTH - PADDING.right}
              y2={PADDING.top + innerH}
              stroke="var(--line)"
              strokeWidth={1}
            />
            {hoverIndex !== null && (
              <line
                x1={xFor(hoverIndex)}
                y1={PADDING.top}
                x2={xFor(hoverIndex)}
                y2={PADDING.top + innerH}
                stroke="var(--line)"
                strokeWidth={1}
              />
            )}
            <polyline
              points={points}
              fill="none"
              stroke={SERIES_COLOR}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {data.map((d, i) => (
              <g key={d.label}>
                <circle
                  cx={xFor(i)}
                  cy={yFor(d.value)}
                  r={hoverIndex === i ? 5 : 4}
                  fill={SERIES_COLOR}
                  stroke="var(--paper-raised)"
                  strokeWidth={2}
                />
                <text x={xFor(i)} y={HEIGHT - 6} textAnchor="middle" fontSize={10} fill="var(--ink-muted)">
                  {d.label}
                </text>
              </g>
            ))}
          </svg>
          <div className="mt-1 text-center text-sm">
            {hoverIndex !== null ? (
              <>
                <span className="text-ink-muted">{data[hoverIndex].label}</span>{' '}
                <span className="font-semibold text-ink">{data[hoverIndex].value}건</span>
              </>
            ) : (
              <span className="text-ink-muted">그래프를 가리키면 월별 건수를 볼 수 있어요</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
