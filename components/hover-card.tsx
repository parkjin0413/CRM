'use client'

import { useState, type ReactNode } from 'react'
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

/**
 * Hover-to-preview on desktop, tap-to-open on touch (useHover's mouseOnly
 * keeps a tap from also firing a phantom hover-open right before the click).
 * Shared by the business card and contact history previews.
 */
export function HoverCard({
  trigger,
  triggerClassName,
  panel,
  panelClassName,
}: {
  trigger: ReactNode
  triggerClassName?: string
  panel: ReactNode
  panelClassName?: string
}) {
  const [open, setOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
  })

  const hover = useHover(context, { delay: { open: 150, close: 100 }, mouseOnly: true })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'dialog' })

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss, role])

  return (
    <>
      <button type="button" ref={refs.setReference} {...getReferenceProps()} className={triggerClassName}>
        {trigger}
      </button>
      {open && (
        <FloatingPortal>
          <div
            // eslint-disable-next-line react-hooks/refs -- refs.setFloating is a callback-ref setter from @floating-ui/react, not a .current read
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={panelClassName ?? 'card z-50 p-3 shadow-[var(--shadow-lg)]'}
          >
            {panel}
          </div>
        </FloatingPortal>
      )}
    </>
  )
}
