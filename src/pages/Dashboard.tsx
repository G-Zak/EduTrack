import { useNavigate } from 'react-router-dom'
import { grades, absences, tasks, feedbacks, subjects, modules, profile } from '../data/mockData'
import { useProgress } from '../context/ProgressContext'
import RadialProgress from '../components/shared/RadialProgress'

function subjectAverage(subjectId: string) {
  const sg = grades.filter(g => g.subjectId === subjectId)
  if (!sg.length) return 0
  const totalWeight = sg.reduce((s, g) => s + g.weight, 0)
  const weighted = sg.reduce((s, g) => s + g.value * g.weight, 0)
  return +(weighted / totalWeight).toFixed(2)
}

function generalAverage() {
  let totalCoeff = 0, weightedSum = 0
  subjects.forEach(s => {
    const avg = subjectAverage(s.id)
    weightedSum += avg * s.coefficient
    totalCoeff += s.coefficient
  })
  return totalCoeff ? +(weightedSum / totalCoeff).toFixed(2) : 0
}

export default function Dashboard() {
  const { progress, isCompleted } = useProgress()
  const navigate = useNavigate()

  // Academic stats
  const genAvg = generalAverage()
  const totalAbsenceDays = absences.reduce((s, a) => s + (a.duration === 'full' ? 1 : 0.5), 0)
  const absenceRate = +((totalAbsenceDays / 120) * 100).toFixed(1)
  const overdueCount = tasks.filter(t => t.status === 'overdue').length
  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
  const recentFeedbacks = [...feedbacks].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  // Lesson progress
  const allLessons = modules.flatMap(m => m.chapters.flatMap(c => c.lessons))
  const totalLessons = allLessons.length
  const completedCount = progress.completedLessons.length
  const globalPct = Math.round((completedCount / totalLessons) * 100)

  const MENTION =
    genAvg >= 18 ? 'Très Bien' :
    genAvg >= 16 ? 'Bien' :
    genAvg >= 14 ? 'Assez Bien' :
    genAvg >= 12 ? 'Passable' : 'Insuffisant'

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text)]">
          Bonjour, {profile.name.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {profile.year} · {profile.institution} · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </div>

      {/* Academic KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* General average */}
        <button
          onClick={() => navigate('/notes')}
          className="group rounded-2xl bg-[var(--color-primary)] p-5 text-white text-left transition-transform hover:scale-[1.02]"
        >
          <div className="text-[var(--text-xs)] font-medium opacity-80 uppercase tracking-wider">📊 Moyenne Générale</div>
          <div className="mt-2 text-4xl font-bold">{genAvg}</div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[var(--text-xs)] opacity-70">/ 20</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[var(--text-xs)]">{MENTION}</span>
          </div>
        </button>

        {/* Absence rate */}
        <button
          onClick={() => navigate('/absences')}
          className={`group rounded-2xl border p-5 text-left transition-transform hover:scale-[1.02] ${
            absenceRate > 10 ? 'border-red-200 bg-red-50' : 'border-[var(--color-border)] bg-[var(--color-white)]'
          }`}
        >
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">📍 Absences</div>
          <div className={`mt-2 text-4xl font-bold ${absenceRate > 10 ? 'text-red-500' : 'text-[var(--color-text)]'}`}>
            {absenceRate}%
          </div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{totalAbsenceDays}j · {absences.length} entrées</div>
        </button>

        {/* Tasks overdue */}
        <button
          onClick={() => navigate('/taches')}
          className={`group rounded-2xl border p-5 text-left transition-transform hover:scale-[1.02] ${
            overdueCount > 0 ? 'border-orange-200 bg-orange-50' : 'border-[var(--color-border)] bg-[var(--color-white)]'
          }`}
        >
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">📝 Tâches</div>
          <div className={`mt-2 text-4xl font-bold ${overdueCount > 0 ? 'text-orange-500' : 'text-[var(--color-text)]'}`}>
            {overdueCount > 0 ? overdueCount : pendingCount}
          </div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
            {overdueCount > 0 ? `${overdueCount} en retard` : `${pendingCount} en cours / à faire`}
          </div>
        </button>

        {/* Progression */}
        <button
          onClick={() => navigate('/analytics')}
          className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-left transition-transform hover:scale-[1.02]"
        >
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">📈 Analytics</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{subjects.length}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">matières · {grades.length} notes</div>
        </button>
      </div>

      {/* Middle row: Subject averages + Recent feedback */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Subject averages */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Notes par matière</h2>
            <button onClick={() => navigate('/notes')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Voir tout</button>
          </div>
          <div className="space-y-3">
            {subjects.map(s => {
              const avg = subjectAverage(s.id)
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="flex-1 text-[var(--text-sm)] text-[var(--color-text)] truncate">{s.name}</span>
                  <div className="w-32 h-1.5 rounded-full bg-[var(--color-gray-bg)] flex-shrink-0">
                    <div className="h-1.5 rounded-full" style={{ width: `${(avg / 20) * 100}%`, background: s.color }} />
                  </div>
                  <span className="w-10 text-right text-[var(--text-sm)] font-bold text-[var(--color-text)]">{avg}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent feedback */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Derniers avis professeurs</h2>
            <button onClick={() => navigate('/avis')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Voir tout</button>
          </div>
          <div className="space-y-4">
            {recentFeedbacks.map(f => {
              const subj = subjects.find(s => s.id === f.subjectId)
              return (
                <div key={f.id} className="flex gap-3">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white text-[var(--text-xs)] font-bold"
                    style={{ background: subj?.color || 'var(--color-primary)' }}
                  >
                    {f.teacherName.split(' ').pop()?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[var(--text-xs)]">
                      <span className="font-medium text-[var(--color-text)]">{f.teacherName}</span>
                      <span className="text-[var(--color-text-secondary)]">·</span>
                      <span className="text-[var(--color-text-secondary)]">{subj?.name}</span>
                      <div className="ml-auto flex">
                        {[1,2,3,4,5].map(i => (
                          <svg key={i} className={`h-3 w-3 ${i <= f.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)] line-clamp-2 italic">"{f.comment}"</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tasks quick view */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Tâches récentes</h2>
          <button onClick={() => navigate('/taches')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Voir tout</button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['overdue', 'in_progress', 'pending', 'graded'] as const).map(status => {
            const count = tasks.filter(t => t.status === status).length
            const cfg = {
              overdue:     { label: 'En retard',  bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-600' },
              in_progress: { label: 'En cours',   bg: 'bg-blue-50',  border: 'border-blue-200',  text: 'text-blue-600' },
              pending:     { label: 'À faire',    bg: 'bg-gray-50',  border: 'border-gray-200',  text: 'text-gray-600' },
              graded:      { label: 'Notées',     bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
            }[status]
            return (
              <div key={status} className={`rounded-xl border p-4 text-center ${cfg.bg} ${cfg.border}`}>
                <div className={`text-3xl font-bold ${cfg.text}`}>{count}</div>
                <div className={`mt-1 text-[var(--text-xs)] font-medium ${cfg.text}`}>{cfg.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Lesson progress */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <div className="flex items-center gap-8 mb-6">
          <RadialProgress value={globalPct} size={100} strokeWidth={8} label="cours" />
          <div>
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Progression des cours</h2>
            <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{completedCount}/{totalLessons} leçons complétées</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {modules.map(m => {
            const ids = m.chapters.flatMap(c => c.lessons.map(l => l.id))
            const done = ids.filter(id => isCompleted(id)).length
            const pct = Math.round((done / ids.length) * 100)
            return (
              <button
                key={m.id}
                onClick={() => navigate(`/modules?moduleId=${m.id}`)}
                className="rounded-xl border border-[var(--color-border)] p-3 text-left hover:border-[var(--color-primary)] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                  <span className="text-[var(--text-xs)] font-medium text-[var(--color-text)] truncate">{m.title}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--color-gray-bg)]">
                  <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: m.color }} />
                </div>
                <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{pct}%</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}