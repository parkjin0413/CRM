const TAG_PALETTE = [
  { bg: '#e4ebdd', fg: '#45633c' }, // sage
  { bg: '#f3e1e1', fg: '#8b3d3d' }, // dusty rose
  { bg: '#f3e7c9', fg: '#7a5b15' }, // ochre
  { bg: '#e1e6f0', fg: '#37507a' }, // slate blue
  { bg: '#f2ded2', fg: '#8a4321' }, // terracotta
  { bg: '#eee1ee', fg: '#6c3e6c' }, // plum
  { bg: '#eae6dd', fg: '#5c574b' }, // warm gray
]

export function tagColorFor(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return TAG_PALETTE[hash % TAG_PALETTE.length]
}

export function SourceTag({ value }: { value: string }) {
  const { bg, fg } = tagColorFor(value)
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: bg, color: fg }}
    >
      {value}
    </span>
  )
}
