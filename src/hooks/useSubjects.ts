import { useState, useEffect, useCallback } from 'react'
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../services/subjectService'
import type { Subject, SubjectType } from '../types'
import { useAuth } from '../context/AuthContext'

export function useSubjects(filterType?: SubjectType) {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getSubjects(user?.id, filterType)
    setSubjects(data)
    setLoading(false)
  }, [user?.id, filterType])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (subject: Omit<Subject, 'id'>) => {
    const created = await createSubject(user?.id ?? 'local', subject)
    setSubjects(prev => [...prev, created])
    return created
  }, [user?.id])

  const update = useCallback(async (id: string, updates: Partial<Subject>) => {
    await updateSubject(user?.id ?? 'local', id, updates)
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [user?.id])

  const remove = useCallback(async (id: string) => {
    await deleteSubject(user?.id ?? 'local', id)
    setSubjects(prev => prev.filter(s => s.id !== id))
  }, [user?.id])

  return { subjects, loading, create, update, remove, reload: load }
}
