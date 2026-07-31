const STATS = [
  { value: '21+', label: 'visualizations' },
  { value: '4', label: 'AI agents, in sequence' },
  { value: '12', label: 'contradiction patterns' },
  { value: '<2s', label: 'per entry analysis' },
]

export function Stats() {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <dl className="tnum grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-left sm:text-center">
              <dd className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{stat.value}</dd>
              <dt className="mt-1 text-sm text-muted">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
