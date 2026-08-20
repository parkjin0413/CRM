export function SealMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={className}
      width={28}
      height={28}
      aria-hidden
    >
      <circle cx={14} cy={14} r={13} fill="var(--stamp)" />
      <circle cx={14} cy={14} r={9} fill="none" stroke="var(--paper)" strokeWidth={1.4} />
      <circle cx={14} cy={14} r={2.4} fill="var(--paper)" />
    </svg>
  )
}
