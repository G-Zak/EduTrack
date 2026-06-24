import { useState, useEffect, useCallback } from 'react'
import { getReflections, createReflection, deleteReflection } from '../services/reflectionService'
import type { ReflectionEntry, ReflectionFormData, ReflectionTrend } from '../types/reflection'
import { useAuth } from '../context/AuthContext'

export function useReflections() {
  const { user } = useAuth()
  const userId = user?.id ?? 'local'

  const [reflections, setReflections] = useState<ReflectionEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getReflections(userId)
    setReflections(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (form: ReflectionFormData) => {
    const entry = await createReflection(userId, form)
    setReflections(prev => [entry, ...prev])
    return entry
  }, [userId])

  const remove = useCallback(async (id: string) => {
    await deleteReflection(userId, id)
    setReflections(prev => prev.filter(r => r.id !== id))
  }, [userId])

  /** Build trend data for charts (oldest first) */
  const getTrend = useCallback((subjectId?: string): ReflectionTrend[] => {
    const filtered = subjectId
      ? reflections.filter(r => r.subjectId === subjectId || !r.subjectId)
      : reflections
    return [...filtered]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(r => ({
        date: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        satisfaction: r.progressSatisfaction,
        confidence: r.confidenceLevel,
        motivation: r.motivationLevel,
        mastery: r.selfAssessedMastery,
        concentration: r.concentrationLevel,
        hoursStudied: r.hoursStudied,
      }))
  }, [reflections])

  return { reflections, loading, create, remove, getTrend, reload: load }
}
