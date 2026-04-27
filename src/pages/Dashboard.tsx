import { useNavigate } from 'react-router-dom'
import { modules, profile } from '../data/mockData'
import { useProgress } from '../context/ProgressContext'
import ProgressBar from '../components/shared/ProgressBar'
import StatCard from '../components/shared/StatCard'

export default function Dashboard() {
  const { progress, isCompleted } = useProgress()
  const navigate = useNavigate()

  const allLessons = modules.flatMap(m => m.chapters.flatMap(c => c.lessons))
  const totalLessons = allLessons.length
  const completedCount = progress.completedLessons.length
  const globalPct = Math.round((completedCount / totalLessons) * 100)

  const lastLesson = allLessons.find(l => l.id === progress.lastSeenLesson)
  const lastModule = lastLesson
    ? modules.find(m => m.chapters.some(c => c.lessons.some(l => l.id === lastLesson.id)))
    : null

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text)]">
          Bonjour, {profile.name.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Voici où tu en es dans ton parcours.</p>
      </div>

      <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">Progression globale</span>
          <span className="text-[var(--text-xl)] font-semibold text-[var(--color-text)]">{globalPct}%</span>
        </div>
        <ProgressBar value={globalPct} height={10} />
        <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{completedCount} leçons complétées sur {totalLessons}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Leçons complétées" value={completedCount} />
        <StatCard label="Modules en cours" value={modules.filter(m => {
          const ids = m.chapters.flatMap(c => c.lessons.map(l => l.id))
          const done = ids.filter(id => isCompleted(id)).length
          return done > 0 && done < ids.length
        }).length} />
        <StatCard label="Modules complétés" value={modules.filter(m => {
          const ids = m.chapters.flatMap(c => c.lessons.map(l => l.id))
          return ids.every(id => isCompleted(id))
        }).length} />
      </div>

      {lastLesson && lastModule && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[var(--color-success)]/25 bg-[var(--color-success-bg)] p-4">
          <div>
            <div className="mb-0.5 text-[var(--text-xs)] font-medium text-[var(--color-success)]">Reprendre où tu t'étais arrêté</div>
            <div className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">{lastLesson.title}</div>
            <div className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">{lastModule.title}</div>
          </div>
          <button onClick={() => navigate('/modules')} className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[var(--text-xs)] text-white transition-colors hover:opacity-95">
            Reprendre →
          </button>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-[var(--text-sm)] font-medium text-[var(--color-text)]">Progression par module</h2>
        <div className="flex flex-col gap-3">
          {modules.map(m => {
            const ids = m.chapters.flatMap(c => c.lessons.map(l => l.id))
            const pct = Math.round((ids.filter(id => isCompleted(id)).length / ids.length) * 100)
            return (
              <button
                key={m.id}
                onClick={() => navigate(`/modules?moduleId=${m.id}`)}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-4 text-left transition-colors hover:border-[var(--color-primary)]"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">{m.title}</span>
                  <span className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">{pct}%</span>
                </div>
                <ProgressBar value={pct} color={m.color} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}