import { useState } from 'react'
import { tasks, subjects } from '../data/mockData'
import type { TaskStatus } from '../types'

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending:     { label: 'À faire',    bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400' },
  in_progress: { label: 'En cours',   bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  submitted:   { label: 'Soumis',     bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  graded:      { label: 'Noté',       bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  overdue:     { label: 'En retard',  bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
}

const statusOrder: TaskStatus[] = ['overdue', 'in_progress', 'pending', 'submitted', 'graded']

function isOverdue(dueDate: string, status: TaskStatus) {
  return status === 'overdue' || (new Date(dueDate) < new Date() && status === 'pending')
}

export default function TasksPage() {
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')

  const filtered = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === filter)

  const countByStatus = (s: TaskStatus) => tasks.filter(t => t.status === s).length

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text)]">📝 Tâches & Devoirs</h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Gérez vos assignations et suivez leur avancement.</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {statusOrder.map(s => {
          const cfg = statusConfig[s]
          const count = countByStatus(s)
          return (
            <button
              key={s}
              onClick={() => setFilter(filter === s ? 'all' : s)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                filter === s ? `${cfg.bg} border-current` : 'border-[var(--color-border)] bg-[var(--color-white)] hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                <span className={`text-[var(--text-xs)] font-medium ${filter === s ? cfg.text : 'text-[var(--color-text-secondary)]'}`}>{cfg.label}</span>
              </div>
              <div className={`text-2xl font-bold ${filter === s ? cfg.text : 'text-[var(--color-text)]'}`}>{count}</div>
            </button>
          )
        })}
      </div>

      {/* Filter label */}
      <div className="flex items-center justify-between">
        <span className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {filtered.length} tâche{filtered.length > 1 ? 's' : ''}{filter !== 'all' ? ` — ${statusConfig[filter].label}` : ''}
        </span>
        {filter !== 'all' && (
          <button onClick={() => setFilter('all')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">
            Voir tout
          </button>
        )}
      </div>

      {/* Task cards */}
      <div className="space-y-3">
        {filtered.map(t => {
          const subj = subjects.find(s => s.id === t.subjectId)
          const cfg = statusConfig[t.status]
          const overdue = isOverdue(t.dueDate, t.status)
          const daysLeft = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / 86400000)

          return (
            <div
              key={t.id}
              className={`rounded-xl border bg-[var(--color-white)] p-5 transition-shadow hover:shadow-sm ${
                t.status === 'overdue' ? 'border-red-200' : 'border-[var(--color-border)]'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Status indicator */}
                <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                  <span className={`h-3 w-3 rounded-full ${cfg.dot}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-[var(--color-text)]">{t.title}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[var(--text-xs)] font-medium ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    {t.status === 'graded' && t.grade !== undefined && (
                      <span className={`font-bold text-[var(--text-sm)] ${t.grade >= 16 ? 'text-green-600' : t.grade >= 12 ? 'text-amber-600' : 'text-red-500'}`}>
                        {t.grade}/20
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)] mb-2">{t.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[var(--text-xs)]">
                    {subj && (
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: subj.color }} />
                        <span className="text-[var(--color-text-secondary)]">{subj.name}</span>
                      </span>
                    )}
                    <span className={overdue && t.status !== 'graded' && t.status !== 'submitted' ? 'text-red-500 font-medium' : 'text-[var(--color-text-secondary)]'}>
                      Échéance : {new Date(t.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {t.status === 'pending' && daysLeft > 0 && (
                      <span className={`font-medium ${daysLeft <= 3 ? 'text-orange-500' : 'text-[var(--color-text-secondary)]'}`}>
                        ({daysLeft}j restants)
                      </span>
                    )}
                    {t.submittedDate && (
                      <span className="text-green-600">
                        ✓ Soumis le {new Date(t.submittedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center text-[var(--color-text-secondary)]">
            Aucune tâche dans cette catégorie.
          </div>
        )}
      </div>
    </div>
  )
}
