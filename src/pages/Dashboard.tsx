import { useNavigate } from 'react-router-dom'
import { modules, profile } from '../data/mockData'
import { useProgress } from '../context/ProgressContext'
import RadialProgress from '../components/shared/RadialProgress'

export default function Dashboard() {
  const { progress, isCompleted } = useProgress()
  const navigate = useNavigate()

  const allLessons = modules.flatMap(m => m.chapters.flatMap(c => c.lessons))
  const totalLessons = allLessons.length
  const completedCount = progress.completedLessons.length
  const globalPct = Math.round((completedCount / totalLessons) * 100)

  const modulesInProgress = modules.filter(m => {
    const ids = m.chapters.flatMap(c => c.lessons.map(l => l.id))
    const done = ids.filter(id => isCompleted(id)).length
    return done > 0 && done < ids.length
  }).length

  const modulesCompleted = modules.filter(m => {
    const ids = m.chapters.flatMap(c => c.lessons.map(l => l.id))
    return ids.every(id => isCompleted(id))
  }).length

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10">
        <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text)]">
          Bonjour, {profile.name.split(' ')[0]}
        </h1>
        <p className="mt-1.5 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Voici où tu en es dans ton parcours.</p>
      </div>

      <div className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-8">
        <div className="flex items-center gap-10">
          <RadialProgress value={globalPct} size={160} strokeWidth={12} label="global" />
          <div className="flex flex-1 gap-4">
            <div className="flex-1 rounded-xl bg-[var(--color-gray-bg)] p-5">
              <div className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">{completedCount}</div>
              <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">Leçons complétées</div>
              <div className="mt-2.5 h-1 w-full rounded-full bg-[var(--color-border)]">
                <div className="h-1 rounded-full bg-[var(--color-primary)]" style={{ width: `${(completedCount / totalLessons) * 100}%`, transition: 'width 0.4s ease' }} />
              </div>
            </div>
            <div className="flex-1 rounded-xl bg-[var(--color-gray-bg)] p-5">
              <div className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">{modulesInProgress}</div>
              <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">Modules en cours</div>
              <div className="mt-2.5 flex gap-1">
                {modules.map((m, i) => {
                  const ids = m.chapters.flatMap(c => c.lessons.map(l => l.id))
                  const done = ids.filter(id => isCompleted(id)).length
                  const isActive = done > 0 && done < ids.length
                  return (
                    <div
                      key={m.id}
                      className="h-1 flex-1 rounded-full"
                      style={{
                        background: isActive ? m.color : 'var(--color-border)',
                        transition: 'background 0.3s ease',
                        opacity: i < modulesInProgress + modulesCompleted ? 1 : 0.3
                      }}
                    />
                  )
                })}
              </div>
            </div>
            <div className="flex-1 rounded-xl bg-[var(--color-gray-bg)] p-5">
              <div className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">{modulesCompleted}</div>
              <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">Modules complétés</div>
              <div className="mt-2.5 flex gap-1">
                {modules.map(m => {
                  const ids = m.chapters.flatMap(c => c.lessons.map(l => l.id))
                  const done = ids.filter(id => isCompleted(id)).length
                  const isComplete = done === ids.length
                  return (
                    <div
                      key={m.id}
                      className="h-1 flex-1 rounded-full"
                      style={{
                        background: isComplete ? 'var(--color-success)' : 'var(--color-border)',
                        transition: 'background 0.3s ease'
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Progression par module</h2>
          <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">{completedCount}/{totalLessons} leçons</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {modules.map(m => {
            const ids = m.chapters.flatMap(c => c.lessons.map(l => l.id))
            const done = ids.filter(id => isCompleted(id)).length
            const pct = Math.round((done / ids.length) * 100)
            return (
              <button
                key={m.id}
                onClick={() => navigate(`/modules?moduleId=${m.id}`)}
                className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-left transition-all hover:border-[var(--color-primary)] hover:shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: m.color }} />
                  <span className="text-[var(--text-sm)] font-semibold text-[var(--color-text)]">{m.title}</span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">{done}/{ids.length} leçons</span>
                  <span className="text-[var(--text-sm)] font-semibold" style={{ color: m.color }}>{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--color-gray-bg)]">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: m.color,
                      transition: 'width 0.5s ease'
                    }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}