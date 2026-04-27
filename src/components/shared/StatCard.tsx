interface Props { label: string; value: string | number; sub?: string }

export default function StatCard({ label, value, sub }: Props) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-4">
      <div className="text-[var(--text-xl)] font-semibold text-[var(--color-text)]">{value}</div>
      <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{label}</div>
      {sub && <div className="mt-1 text-[var(--text-xs)] text-[var(--color-success)]">{sub}</div>}
    </div>
  )
}