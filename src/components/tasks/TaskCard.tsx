import { useState, useRef, useEffect } from 'react'
import type { StudentTask, TaskStatus } from '../../types/task'
import { getTaskStatus, getDaysUntilDue, getSubtaskCompletionPercentage } from '../../utils/taskUtils'

interface TaskCardProps {
  task: StudentTask
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
  onEdit: (task: StudentTask) => void
  onDelete: (taskId: string) => void
  onAssessment?: (taskId: string, quality: number, learning: number) => void
  readOnly?: boolean
}

// ─── Status configuration ──────────────────────────────────────────────────────

type StatusCfg = {
  label: string
  bg: string
  text: string
  border: string
  dot: string
  // SVG path for the icon inside the dropdown option
  iconPath: string
}

const statusConfig: Record<TaskStatus, StatusCfg> = {
  pending: {
    label: 'À faire',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', // clock
  },
  in_progress: {
    label: 'En cours',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z', // lightning
  },
  submitted: {
    label: 'Soumis',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', // check-circle
  },
  completed: {
    label: 'Complété',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
    iconPath: 'M5 13l4 4L19 7', // simple check
  },
  graded: {
    label: 'Noté',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', // star
  },
  overdue: {
    label: 'En retard',
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    dot: 'bg-red-500',
    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', // warning
  },
  abandoned: {
    label: 'Abandonné',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    iconPath: 'M6 18L18 6M6 6l12 12', // x
  },
}

// Which statuses a student can freely set (all meaningful states)
const STUDENT_SELECTABLE: TaskStatus[] = [
  'pending',
  'in_progress',
  'submitted',
  'completed',
  'abandoned',
]

// Left accent colour by status
const accentColor: Record<TaskStatus, string> = {
  pending:     '#9ca3af',
  in_progress: '#3b82f6',
  submitted:   '#8b5cf6',
  graded:      '#16a34a',
  completed:   '#16a34a',
  overdue:     '#ef4444',
  abandoned:   '#d1d5db',
}

const priorityLabel: Record<string, string> = { high: 'Haute', medium: 'Moyenne', low: 'Basse' }
const priorityStyle: Record<string, string> = {
  high:   'bg-red-50 text-red-600 border border-red-200',
  medium: 'bg-amber-50 text-amber-600 border border-amber-200',
  low:    'bg-green-50 text-green-600 border border-green-200',
}

// ─── Status Dropdown Component ─────────────────────────────────────────────────

function StatusDropdown({
  currentStatus,
  onChange,
  disabled,
}: {
  currentStatus: TaskStatus
  onChange: (s: TaskStatus) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Decide direction before opening
  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      // Approximate panel height: 5 options × 32px + padding ≈ 200px
      const panelHeight = 200
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUpward(spaceBelow < panelHeight)
    }
    setOpen(v => !v)
  }

  const cfg = statusConfig[currentStatus]

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        disabled={disabled}
        onClick={handleOpen}
        className={`
          inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border
          transition-all select-none
          ${cfg.bg} ${cfg.text} ${cfg.border}
          ${disabled ? 'cursor-default opacity-70' : 'cursor-pointer hover:opacity-80'}
        `}
      >
        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {cfg.label}
        {!disabled && (
          <svg
            className={`h-3 w-3 ml-0.5 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown panel — flips upward when near bottom of viewport */}
      {open && (
        <div
          className={`absolute right-0 z-50 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] shadow-xl ring-1 ring-black/5 overflow-hidden ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          <div className="p-1.5 space-y-0.5">
            {STUDENT_SELECTABLE.map(status => {
              const s = statusConfig[status]
              const isActive = status === currentStatus
              return (
                <button
                  key={status}
                  onClick={() => {
                    if (status !== currentStatus) onChange(status)
                    setOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-left
                    transition-colors
                    ${isActive
                      ? `${s.bg} ${s.text}`
                      : 'text-[var(--color-text)] hover:bg-[var(--color-gray-bg)]'
                    }
                  `}
                >
                  {/* Coloured icon circle */}
                  <span className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${s.bg}`}>
                    <svg className={`h-3 w-3 ${s.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.iconPath} />
                    </svg>
                  </span>
                  {s.label}
                  {isActive && (
                    <svg className={`h-3.5 w-3.5 ml-auto flex-shrink-0 ${s.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


// ─── Task Card ─────────────────────────────────────────────────────────────────

export default function TaskCard({
  task,
  onStatusChange,
  onAssessment,
  readOnly = false,
}: TaskCardProps) {
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [showAssessment, setShowAssessment] = useState(false)
  const [assessmentData, setAssessmentData] = useState({ quality: 3, learning: 3 })

  const currentStatus = getTaskStatus(task)
  const cfg = statusConfig[currentStatus]
  const daysLeft = getDaysUntilDue(task.dueDate)
  const isOverdue = currentStatus === 'overdue'
  const subtaskProgress = getSubtaskCompletionPercentage(task.subtasks)
  const isComplex = task.type === 'complex' && task.subtasks && task.subtasks.length > 0

  const handleAssessment = () => {
    if (onAssessment) {
      onAssessment(task.id, assessmentData.quality, assessmentData.learning)
      setShowAssessment(false)
    }
  }

  // Statuses that are terminal (read-only for student)
  const isTerminal = currentStatus === 'graded'

  return (
    <div
      className={`rounded-xl border bg-[var(--color-white)] transition-all hover:shadow-md ${
        isOverdue ? 'border-red-200' : 'border-[var(--color-border)]'
      }`}
    >
      {/* Coloured left accent bar */}
      <div className="flex">
        <div
          className="w-1 flex-shrink-0 rounded-l-xl"
          style={{ background: accentColor[currentStatus] }}
        />

        <div className="flex-1 p-4">
          {/* Header row: title + status dropdown */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[var(--color-text)] leading-snug">{task.title}</h3>
              {task.description && (
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] line-clamp-2">{task.description}</p>
              )}
            </div>

            {/* Status: dropdown for students, static badge for teacher / terminal states */}
            {readOnly || isTerminal ? (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                {cfg.label}
              </span>
            ) : (
              <StatusDropdown
                currentStatus={currentStatus}
                onChange={status => onStatusChange(task.id, status)}
              />
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-secondary)] mb-3">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyle[task.priority]}`}>
              {priorityLabel[task.priority]}
            </span>
            <span>{task.category}</span>
            <span>{task.estimatedHours}h estimé{task.actualHours ? ` · ${task.actualHours}h réel` : ''}</span>
            <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
              Échéance : {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              {!isOverdue && daysLeft > 0 && (
                <span className={` ml-1 font-medium ${daysLeft <= 3 ? 'text-orange-500' : ''}`}>
                  ({daysLeft}j)
                </span>
              )}
            </span>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.map(tag => (
                <span key={tag} className="inline-block bg-[var(--color-gray-bg)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Subtasks */}
          {isComplex && (
            <div className="mb-3">
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="text-xs font-medium text-[var(--color-primary)] hover:underline flex items-center gap-1 mb-1.5"
              >
                <svg className={`h-3 w-3 transition-transform ${showSubtasks ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Sous-tâches ({task.subtasks?.filter(s => s.status === 'completed').length}/{task.subtasks?.length})
              </button>
              <div className="h-1.5 bg-[var(--color-gray-bg)] rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${subtaskProgress}%`, background: 'var(--color-primary)' }}
                />
              </div>
              {showSubtasks && (
                <div className="space-y-1 pl-2 border-l-2 border-[var(--color-border)]">
                  {task.subtasks?.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${subtask.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={subtask.status === 'completed' ? 'line-through opacity-60' : ''}>
                        {subtask.title}
                      </span>
                      <span className="ml-auto">{subtask.estimatedHours}h</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assessment summary */}
          {(currentStatus === 'completed' || currentStatus === 'graded') && (task.completionQuality || task.learningGain) && (
            <div className="mb-3 flex gap-3 text-xs text-[var(--color-text-secondary)]">
              {task.completionQuality && (
                <span className="rounded-full bg-[var(--color-gray-bg)] px-2 py-0.5">Qualité : {task.completionQuality}/5</span>
              )}
              {task.learningGain && (
                <span className="rounded-full bg-[var(--color-gray-bg)] px-2 py-0.5">Apprentissage : {task.learningGain}/5</span>
              )}
            </div>
          )}

          {/* Grade */}
          {currentStatus === 'graded' && task.grade !== undefined && (
            <div className={`text-sm font-bold mb-3 ${task.grade >= 16 ? 'text-green-600' : task.grade >= 12 ? 'text-amber-600' : 'text-red-600'}`}>
              Note : {task.grade}/20
            </div>
          )}

          {/* Auto-assessment button (student, completed or in_progress, not yet rated) */}
          {!readOnly && (currentStatus === 'completed' || currentStatus === 'in_progress') && !task.completionQuality && onAssessment && (
            <div className="pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowAssessment(true)}
                className="text-xs font-medium px-3 py-1 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 transition-all"
              >
                Auto-évaluer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Assessment Modal */}
      {showAssessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-white)] rounded-xl p-6 max-w-sm w-full space-y-5 shadow-xl">
            <h3 className="font-bold text-[var(--color-text)] text-base">Auto-évaluation de la tâche</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Qualité de complétion</label>
                  <span className="text-sm font-bold text-[var(--color-primary)]">{assessmentData.quality}/5</span>
                </div>
                <input
                  type="range" min="1" max="5"
                  value={assessmentData.quality}
                  onChange={e => setAssessmentData(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                  className="w-full accent-[var(--color-primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-0.5">
                  <span>Faible</span><span>Excellente</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Gain d'apprentissage</label>
                  <span className="text-sm font-bold text-[var(--color-primary)]">{assessmentData.learning}/5</span>
                </div>
                <input
                  type="range" min="1" max="5"
                  value={assessmentData.learning}
                  onChange={e => setAssessmentData(prev => ({ ...prev, learning: parseInt(e.target.value) }))}
                  className="w-full accent-[var(--color-primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-0.5">
                  <span>Peu appris</span><span>Très enrichissant</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setShowAssessment(false)}
                className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-gray-bg)] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAssessment}
                className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
