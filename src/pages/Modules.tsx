import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { modules } from '../data/mockData'
import { useProgress } from '../context/ProgressContext'
import type { Module, Lesson } from '../types'
import ProgressBar from '../components/shared/ProgressBar'

export default function Modules() {
  const { isCompleted, completeLesson, uncompleteLesson, setLastSeen } = useProgress()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    const moduleId = searchParams.get('moduleId')
    if (!moduleId) return

    const moduleFromQuery = modules.find((m) => m.id === moduleId) ?? null
    if (moduleFromQuery) {
      setSelectedModule(moduleFromQuery)
      setSelectedLesson(null)
    }
  }, [searchParams])

  if (selectedLesson && selectedModule) {
    const allLessons = selectedModule.chapters.flatMap(c => c.lessons)
    const idx = allLessons.findIndex(l => l.id === selectedLesson.id)
    return (
      <div className="mx-auto max-w-3xl">
        <button onClick={() => setSelectedLesson(null)} className="mb-6 flex items-center gap-1 text-[var(--text-xs)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
          ← Retour au module
        </button>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <div className="mb-1 text-[var(--text-xs)] font-medium" style={{ color: selectedModule.color }}>{selectedModule.title}</div>
          <h1 className="mb-4 text-[var(--text-xl)] font-bold text-[var(--color-text)]">{selectedLesson.title}</h1>
          <div className="mb-6 text-[var(--text-xs)] text-[var(--color-text-secondary)]">Durée estimée : {selectedLesson.duration}</div>
          <p className="mb-8 text-[var(--text-sm)] leading-relaxed text-[var(--color-text)]">{selectedLesson.content}</p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                isCompleted(selectedLesson.id) ? uncompleteLesson(selectedLesson.id) : completeLesson(selectedLesson.id)
                setLastSeen(selectedLesson.id)
              }}
              className={`rounded-lg px-5 py-2 text-[var(--text-sm)] transition-colors ${
                isCompleted(selectedLesson.id)
                  ? 'bg-[var(--color-gray-bg)] text-[var(--color-gray)] hover:opacity-95'
                  : 'bg-[var(--color-primary)] text-white hover:opacity-95'
              }`}>
              {isCompleted(selectedLesson.id) ? '✓ Complétée' : 'Marquer comme complétée'}
            </button>
            <div className="flex gap-2">
              {idx > 0 && <button onClick={() => setSelectedLesson(allLessons[idx - 1])} className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--text-xs)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-bg)]">← Précédente</button>}
              {idx < allLessons.length - 1 && <button onClick={() => setSelectedLesson(allLessons[idx + 1])} className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--text-xs)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-bg)]">Suivante →</button>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedModule) {
    const ids = selectedModule.chapters.flatMap(c => c.lessons.map(l => l.id))
    const pct = Math.round((ids.filter(id => isCompleted(id)).length / ids.length) * 100)
    return (
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => {
            setSelectedModule(null)
            setSearchParams({})
          }}
          className="mb-6 text-[var(--text-xs)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          ← Tous les modules
        </button>
        <div className="mb-6">
          <h1 className="text-[var(--text-xl)] font-bold text-[var(--color-text)]">{selectedModule.title}</h1>
          <p className="mb-3 mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">{selectedModule.description}</p>
          <ProgressBar value={pct} color={selectedModule.color} />
          <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{pct}% complété</p>
        </div>
        {selectedModule.chapters.map(ch => (
          <div key={ch.id} className="mb-4">
            <div className="mb-2 px-1 text-[var(--text-xs)] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">{ch.title}</div>
            <div className="flex flex-col gap-2">
              {ch.lessons.map(l => (
                <button key={l.id} onClick={() => setSelectedLesson(l)}
                  className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-3 text-left transition-colors hover:border-[var(--color-primary)]">
                  <div>
                    <div className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">{l.title}</div>
                    <div className="mt-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{l.duration}</div>
                  </div>
                  <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${isCompleted(l.id) ? 'border-[var(--color-success)] bg-[var(--color-success)]' : 'border-[var(--color-border)]'}`}>
                    {isCompleted(l.id) && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Mes modules</h1>
      <p className="mb-8 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Clique sur un module pour voir ses leçons.</p>
      <div className="grid grid-cols-2 gap-4">
        {modules.map(m => {
          const ids = m.chapters.flatMap(c => c.lessons.map(l => l.id))
          const done = ids.filter(id => isCompleted(id)).length
          const pct = Math.round((done / ids.length) * 100)
          return (
            <button
              key={m.id}
              onClick={() => {
                setSelectedModule(m)
                setSearchParams({ moduleId: m.id })
              }}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-left transition-colors hover:border-[var(--color-primary)]">
              <div className="w-2 h-2 rounded-full mb-3" style={{ background: m.color }}></div>
              <div className="mb-1 text-[var(--text-base)] font-medium text-[var(--color-text)]">{m.title}</div>
              <div className="mb-4 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{m.description}</div>
              <ProgressBar value={pct} color={m.color} />
              <div className="mt-1.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{done}/{ids.length} leçons · {pct}%</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}