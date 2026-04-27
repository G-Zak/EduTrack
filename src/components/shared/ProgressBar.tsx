interface Props { value: number; color?: string; height?: number }

export default function ProgressBar({ value, color = 'var(--color-primary)', height = 6 }: Props) {
  return (
    <div style={{ background: 'var(--color-border)', borderRadius: 99, height, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(value, 100)}%`, background: color, height, borderRadius: 99, transition: 'width 0.4s ease' }} />
    </div>
  )
}