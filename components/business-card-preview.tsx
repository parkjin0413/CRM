'use client'

import { useState } from 'react'
import {
  useFloating,
  useHover,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  offset,
  flip,
  shift,
  FloatingPortal,
} from '@floating-ui/react'

export function BusinessCardPreview({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  const [open, setOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
  })

  // mouseOnly keeps touch taps from also firing a hover-open right before the click.
  const hover = useHover(context, { delay: { open: 150, close: 100 }, mouseOnly: true })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'dialog' })

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss, role])

  if (!imageUrl) {
    return <span className="font-medium text-ink">{name}</span>
  }

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        {...getReferenceProps()}
        className="inline-flex items-center gap-1.5 font-medium text-ink"
      >
        {name}
        <svg viewBox="0 0 20 14" width={16} height={12} className="shrink-0 text-ink-muted" aria-hidden>
          <rect x={0.5} y={0.5} width={19} height={13} rx={2} fill="none" stroke="currentColor" />
          <circle cx={6} cy={7} r={2} fill="currentColor" />
          <line x1={10.5} y1={5} x2={17} y2={5} stroke="currentColor" />
          <line x1={10.5} y1={8} x2={17} y2={8} stroke="currentColor" />
        </svg>
      </button>
      {open && (
        <FloatingPortal>
          {/* eslint-disable-next-line react-hooks/refs -- refs.setFloating is a callback-ref setter from @floating-ui/react, not a .current read */}
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className="card z-50 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`${name} 명함`}
              className="max-h-56 max-w-64 rounded object-contain sm:max-w-72"
            />
          </div>
        </FloatingPortal>
      )}
    </>
  )
}
