import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { ProgressState } from '../types'

import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

interface ProgressContextType {
  progress: ProgressState
  completeLesson: (lessonId: string) => Promise<void>
  uncompleteLesson: (lessonId: string) => Promise<void>
  isCompleted: (lessonId: string) => boolean
  setLastSeen: (lessonId: string) => Promise<void>
  completeChapter: (chapterId: string) => Promise<void>
  uncompleteChapter: (chapterId: string) => Promise<void>
  isChapterCompleted: (chapterId: string) => boolean
}

const ProgressContext = createContext<ProgressContextType | null>(null)

const STORAGE_KEY = 'student-tracker-progress'

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, isConfigured } = useAuth()
  const [progress, setProgress] = useState<ProgressState>({ completedLessons: [], completedChapters: [], lastSeenLesson: null })

  // Synchronize with user state or local storage
  useEffect(() => {
    if (isConfigured && user) {
      const dbCompleted = user.user_metadata?.completed_lessons ?? []
      const dbChapters = user.user_metadata?.completed_chapters ?? []
      const dbLastSeen = user.user_metadata?.last_seen_lesson ?? null
      setProgress({
        completedLessons: Array.isArray(dbCompleted) ? dbCompleted : [],
        completedChapters: Array.isArray(dbChapters) ? dbChapters : [],
        lastSeenLesson: dbLastSeen
      })
    } else {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setProgress(JSON.parse(stored))
      } else {
        setProgress({ completedLessons: [], completedChapters: [], lastSeenLesson: null })
      }
    }
  }, [user, isConfigured])

  // Save to local storage only in demo mode
  useEffect(() => {
    if (!isConfigured || !user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    }
  }, [progress, isConfigured, user])

  const completeLesson = async (id: string) => {
    const nextCompleted = progress.completedLessons.includes(id)
      ? progress.completedLessons
      : [...progress.completedLessons, id]

    setProgress(p => ({
      ...p,
      completedLessons: nextCompleted,
      lastSeenLesson: id
    }))

    if (isConfigured && user) {
      await supabase.auth.updateUser({
        data: {
          completed_lessons: nextCompleted,
          last_seen_lesson: id
        }
      })
    }
  }

  const uncompleteLesson = async (id: string) => {
    const nextCompleted = progress.completedLessons.filter(l => l !== id)
    setProgress(p => ({ ...p, completedLessons: nextCompleted }))

    if (isConfigured && user) {
      await supabase.auth.updateUser({
        data: {
          completed_lessons: nextCompleted
        }
      })
    }
  }

  const isCompleted = (id: string) => progress.completedLessons.includes(id)

  const setLastSeen = async (id: string) => {
    setProgress(p => ({ ...p, lastSeenLesson: id }))

    if (isConfigured && user) {
      await supabase.auth.updateUser({
        data: {
          last_seen_lesson: id
        }
      })
    }
  }

  const completeChapter = async (id: string) => {
    const nextCompleted = progress.completedChapters?.includes(id)
      ? progress.completedChapters
      : [...(progress.completedChapters ?? []), id]

    setProgress(p => ({
      ...p,
      completedChapters: nextCompleted
    }))

    if (isConfigured && user) {
      await supabase.auth.updateUser({
        data: {
          completed_chapters: nextCompleted
        }
      })
    }
  }

  const uncompleteChapter = async (id: string) => {
    const nextCompleted = (progress.completedChapters ?? []).filter(c => c !== id)
    setProgress(p => ({ ...p, completedChapters: nextCompleted }))

    if (isConfigured && user) {
      await supabase.auth.updateUser({
        data: {
          completed_chapters: nextCompleted
        }
      })
    }
  }

  const isChapterCompleted = (id: string) => progress.completedChapters?.includes(id) ?? false

  return (
    <ProgressContext.Provider value={{ progress, completeLesson, uncompleteLesson, isCompleted, setLastSeen, completeChapter, uncompleteChapter, isChapterCompleted }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}