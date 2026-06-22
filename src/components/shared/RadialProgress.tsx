interface Props {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
}

export default function RadialProgress({
  value,
  size = 140,
  strokeWidth = 10,
  color = 'var(--color-primary)',
  label,
}: Props) {
  const center = size / 2
  const radius = center - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[var(--text-xl)] font-bold text-[var(--color-text)]" style={{ fontSize: size > 100 ? 'var(--text-xl)' : 'var(--text-lg)' }}>
          {value}%
        </span>
        {label && (
          <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)] mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
