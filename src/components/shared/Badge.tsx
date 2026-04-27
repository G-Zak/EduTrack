type Variant = 'success' | 'warning' | 'danger' | 'info'

const styles: Record<Variant, string> = {
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  info: 'bg-blue-100 text-[var(--color-info)]',
}

export default function Badge({ label, variant }: { label: string; variant: Variant }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[var(--text-xs)] font-medium ${styles[variant]}`}>
      {label}
    </span>
  )
}