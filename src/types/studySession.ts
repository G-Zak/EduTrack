/**
 * Study Session Types
 */

export interface StudySession {
  id: string
  userId: string
  subjectId?: string
  taskId?: string
  startTime: string    // ISO timestamp
  endTime?: string     // ISO timestamp (null if in-progress)
  durationMinutes: number
  notes?: string
  quality?: number     // 1–5 session quality rating
  createdAt: string
}

export interface StudySessionFormData {
  subjectId?: string
  taskId?: string
  durationMinutes: number
  date: string        // date of the session
  notes?: string
  quality?: number
}

/** Aggregated study stats for analytics */
export interface StudyStats {
  totalMinutes: number
  totalHours: number
  sessionCount: number
  avgSessionMinutes: number
  bySubject: Record<string, number>   // subjectId → minutes
  byDay: Record<string, number>       // YYYY-MM-DD → minutes
  byWeek: Record<string, number>      // YYYY-WW → minutes
  byMonth: Record<string, number>     // YYYY-MM → minutes
  avgDailyMinutes: number
  longestStreak: number               // consecutive study days
  currentStreak: number
}

export const STORAGE_KEY_SESSIONS = 'student_study_sessions'
