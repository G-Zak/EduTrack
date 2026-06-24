import { useState, useEffect, useCallback } from 'react'
import { getSessions, logSession, deleteSession, computeStudyStats } from '../services/studySessionService'
import type { StudySession, StudySessionFormData, StudyStats } from '../types/studySession'
import { useAuth } from '../context/AuthContext'

export function useStudySessions() {
  const { user } = useAuth()
  const userId = user?.id ?? 'local'

  const [sessions, setSessions] = useState<StudySession[]>([])
  const [stats, setStats] = useState<StudyStats | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getSessions(userId)
    setSessions(data)
    setStats(computeStudyStats(data))
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  const log = useCallback(async (data: StudySessionFormData) => {
    const session = await logSession(userId, data)
    setSessions(prev => [session, ...prev])
    setStats(computeStudyStats([session, ...sessions]))
    return session
  }, [userId, sessions])

  const remove = useCallback(async (sessionId: string) => {
    await deleteSession(userId, sessionId)
    const updated = sessions.filter(s => s.id !== sessionId)
    setSessions(updated)
    setStats(computeStudyStats(updated))
  }, [userId, sessions])

  return { sessions, stats, loading, log, remove, reload: load }
}
