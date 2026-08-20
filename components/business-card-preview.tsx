import { HoverCard } from './hover-card'

export function BusinessCardPreview({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  if (!imageUrl) {
    return <span className="font-medium text-ink">{name}</span>
  }

  return (
    <HoverCard
      triggerClassName="inline-flex items-center gap-1.5 font-medium text-ink"
      trigger={
        <>
          {name}
          <svg viewBox="0 0 20 14" width={16} height={12} className="shrink-0 text-ink-muted" aria-hidden>
            <rect x={0.5} y={0.5} width={19} height={13} rx={2} fill="none" stroke="currentColor" />
            <circle cx={6} cy={7} r={2} fill="currentColor" />
            <line x1={10.5} y1={5} x2={17} y2={5} stroke="currentColor" />
            <line x1={10.5} y1={8} x2={17} y2={8} stroke="currentColor" />
          </svg>
        </>
      }
      panel={
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={`${name} 명함`}
          className="max-h-56 max-w-[calc(100vw-2rem)] rounded object-contain sm:max-w-72"
        />
      }
    />
  )
}
