/**
 * Study Session Service
 * Logs and retrieves study sessions.
 * Uses Supabase when configured, falls back to localStorage.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { StudySession, StudySessionFormData, StudyStats } from '../types/studySession'
import { STORAGE_KEY_SESSIONS } from '../types/studySession'

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadSessions(userId: string): StudySession[] {
  const raw = localStorage.getItem(`${STORAGE_KEY_SESSIONS}_${userId}`)
  return raw ? JSON.parse(raw) : []
}

function saveSessions(userId: string, sessions: StudySession[]) {
  localStorage.setItem(`${STORAGE_KEY_SESSIONS}_${userId}`, JSON.stringify(sessions))
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getSessions(userId: string): Promise<StudySession[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
    if (!error && data) {
      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        subjectId: row.subject_id ?? undefined,
        taskId: row.task_id ?? undefined,
        startTime: row.start_time,
        endTime: row.end_time ?? undefined,
        durationMinutes: row.duration_minutes,
        notes: row.notes ?? undefined,
        quality: row.quality ?? undefined,
        createdAt: row.created_at,
      }))
    }
  }
  return loadSessions(userId)
}

export async function logSession(userId: string, data: StudySessionFormData): Promise<StudySession> {
  const startTime = new Date(data.date).toISOString()
  const endTime = new Date(new Date(data.date).getTime() + data.durationMinutes * 60000).toISOString()

  const session: StudySession = {
    id: `session-${Date.now()}`,
    userId,
    subjectId: data.subjectId,
    taskId: data.taskId,
    startTime,
    endTime,
    durationMinutes: data.durationMinutes,
    notes: data.notes,
    quality: data.quality,
    createdAt: new Date().toISOString(),
  }

  if (isSupabaseConfigured) {
    const { data: row, error } = await supabase.from('study_sessions').insert({
      user_id: userId,
      subject_id: data.subjectId ?? null,
      task_id: data.taskId ?? null,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: data.durationMinutes,
      notes: data.notes ?? null,
      quality: data.quality ?? null,
    }).select().single()
    if (!error && row) return { ...session, id: row.id }
  }

  const sessions = loadSessions(userId)
  sessions.unshift(session)
  saveSessions(userId, sessions)
  return session
}

export async function deleteSession(userId: string, sessionId: string): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('study_sessions').delete().eq('id', sessionId).eq('user_id', userId)
  }
  const sessions = loadSessions(userId)
  saveSessions(userId, sessions.filter(s => s.id !== sessionId))
}

// ─── Analytics Aggregation ───────────────────────────────────────────────────

export function computeStudyStats(sessions: StudySession[]): StudyStats {
  const bySubject: Record<string, number> = {}
  const byDay: Record<string, number> = {}
  const byWeek: Record<string, number> = {}
  const byMonth: Record<string, number> = {}

  let totalMinutes = 0

  for (const s of sessions) {
    totalMinutes += s.durationMinutes
    if (s.subjectId) bySubject[s.subjectId] = (bySubject[s.subjectId] || 0) + s.durationMinutes

    const d = new Date(s.startTime)
    const dayKey = d.toISOString().slice(0, 10)
    const monthKey = d.toISOString().slice(0, 7)

    // ISO week
    const jan1 = new Date(d.getFullYear(), 0, 1)
    const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
    const weekKey = `${d.getFullYear()}-W${String(week).padStart(2, '0')}`

    byDay[dayKey] = (byDay[dayKey] || 0) + s.durationMinutes
    byWeek[weekKey] = (byWeek[weekKey] || 0) + s.durationMinutes
    byMonth[monthKey] = (byMonth[monthKey] || 0) + s.durationMinutes
  }

  const totalHours = +(totalMinutes / 60).toFixed(1)
  const sessionCount = sessions.length
  const avgSessionMinutes = sessionCount ? Math.round(totalMinutes / sessionCount) : 0

  const dayCount = Object.keys(byDay).length
  const avgDailyMinutes = dayCount ? Math.round(totalMinutes / dayCount) : 0

  // Streak calculation
  const sortedDays = Object.keys(byDay).sort()
  let currentStreak = 0, longestStreak = 0, streak = 0
  const today = new Date().toISOString().slice(0, 10)

  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) { streak = 1; continue }
    const prev = new Date(sortedDays[i - 1])
    const curr = new Date(sortedDays[i])
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000)
    streak = diff === 1 ? streak + 1 : 1
    longestStreak = Math.max(longestStreak, streak)
    if (sortedDays[i] === today) currentStreak = streak
  }

  return { totalMinutes, totalHours, sessionCount, avgSessionMinutes, bySubject, byDay, byWeek, byMonth, avgDailyMinutes, longestStreak, currentStreak }
}
