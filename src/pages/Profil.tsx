import { modules, profile } from '../data/mockData'
import { useProgress } from '../context/ProgressContext'

export default function Profil() {
  const { progress, isCompleted } = useProgress()
  const completedCount = progress.completedLessons.length
  const allLessons = modules.flatMap(m => m.chapters.flatMap(c => c.lessons))
  const totalLessons = allLessons.length
  const globalPct = Math.round((completedCount / totalLessons) * 100)

  const modulesDone = modules.filter(m => {
    const ids = m.chapters.flatMap(c => c.lessons.map(l => l.id))
    return ids.every(id => isCompleted(id))
  }).length

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <div
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold"
          style={{ fontSize: 'var(--text-xl)' }}
        >
          {profile.initials}
        </div>
        <div>
          <h1 className="font-bold text-[var(--color-text)]" style={{ fontSize: 'var(--text-xl)' }}>{profile.name}</h1>
          <p className="mt-0.5 text-[var(--color-text-secondary)]" style={{ fontSize: 'var(--text-sm)' }}>{profile.track}</p>
          <p className="mt-1 text-[var(--color-text-secondary)]" style={{ fontSize: 'var(--text-xs)' }}>Depuis le {new Date(profile.startDate).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Progression', value: `${globalPct}%` },
          { label: 'Leçons', value: `${completedCount}/${totalLessons}` },
          { label: 'Modules finis', value: modulesDone },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-[var(--color-gray-bg)] p-3 text-center">
            <div className="font-semibold text-[var(--color-text)]" style={{ fontSize: 'var(--text-xl)' }}>{s.value}</div>
            <div className="mt-0.5 text-[var(--color-text-secondary)]" style={{ fontSize: 'var(--text-xs)' }}>{s.label}</div>
          </div>
        ))}
      </div>

    </div>
  )
}