const BLOOMS = [
  { size: 560, x: '-6%', y: '8%', color: 'var(--color-bloom-a)', blur: 140 },
  { size: 520, x: '72%', y: '52%', color: 'var(--color-bloom-b)', blur: 120 },
]

export function BackgroundOrbs() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {BLOOMS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: orb.color,
            filter: `blur(${orb.blur}px)`,
          }}
        />
      ))}
    </div>
  )
}
