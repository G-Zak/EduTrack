/**
 * Reflection Service
 * Manages periodic self-evaluation entries.
 * Uses Supabase when configured, falls back to localStorage.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { ReflectionEntry, ReflectionFormData } from '../types/reflection'

const LS_KEY = 'student_reflections'

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadReflections(userId: string): ReflectionEntry[] {
  const raw = localStorage.getItem(`${LS_KEY}_${userId}`)
  return raw ? JSON.parse(raw) : []
}

function saveReflections(userId: string, entries: ReflectionEntry[]) {
  localStorage.setItem(`${LS_KEY}_${userId}`, JSON.stringify(entries))
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getReflections(userId: string): Promise<ReflectionEntry[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (!error && data) {
      return data.map(mapRowToEntry)
    }
  }
  return loadReflections(userId)
}

export async function createReflection(userId: string, form: ReflectionFormData): Promise<ReflectionEntry> {
  const entry: ReflectionEntry = {
    id: `refl-${Date.now()}`,
    userId,
    date: form.date,
    subjectId: form.subjectId,
    hoursStudied: form.hoursStudied,
    sessionsCount: form.sessionsCount,
    avgSessionMinutes: form.avgSessionMinutes,
    tasksCompleted: form.tasksCompleted,
    studyConsistency: form.studyConsistency,
    concentrationLevel: form.concentrationLevel,
    distractionsCount: form.distractionsCount,
    progressSatisfaction: form.progressSatisfaction,
    confidenceLevel: form.confidenceLevel,
    motivationLevel: form.motivationLevel,
    selfAssessedMastery: form.selfAssessedMastery,
    perceivedDifficulty: form.perceivedDifficulty,
    notes: form.notes,
    createdAt: new Date().toISOString(),
  }

  if (isSupabaseConfigured) {
    const { data: row, error } = await supabase.from('reflections').insert({
      user_id: userId,
      date: form.date,
      subject_id: form.subjectId ?? null,
      hours_studied: form.hoursStudied,
      sessions_count: form.sessionsCount,
      avg_session_minutes: form.avgSessionMinutes,
      tasks_completed: form.tasksCompleted,
      study_consistency: form.studyConsistency,
      concentration_level: form.concentrationLevel,
      distractions_count: form.distractionsCount,
      progress_satisfaction: form.progressSatisfaction,
      confidence_level: form.confidenceLevel,
      motivation_level: form.motivationLevel,
      self_assessed_mastery: form.selfAssessedMastery,
      perceived_difficulty: form.perceivedDifficulty,
      notes: form.notes ?? null,
    }).select().single()
    if (!error && row) return { ...entry, id: row.id }
  }

  const reflections = loadReflections(userId)
  reflections.unshift(entry)
  saveReflections(userId, reflections)
  return entry
}

export async function deleteReflection(userId: string, id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('reflections').delete().eq('id', id).eq('user_id', userId)
  }
  const reflections = loadReflections(userId)
  saveReflections(userId, reflections.filter(r => r.id !== id))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapRowToEntry(row: Record<string, unknown>): ReflectionEntry {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    date: row.date as string,
    subjectId: (row.subject_id as string) ?? undefined,
    hoursStudied: row.hours_studied as number,
    sessionsCount: row.sessions_count as number,
    avgSessionMinutes: row.avg_session_minutes as number,
    tasksCompleted: row.tasks_completed as number,
    studyConsistency: row.study_consistency as number,
    concentrationLevel: row.concentration_level as number,
    distractionsCount: row.distractions_count as number,
    progressSatisfaction: row.progress_satisfaction as number,
    confidenceLevel: row.confidence_level as number,
    motivationLevel: row.motivation_level as number,
    selfAssessedMastery: row.self_assessed_mastery as number,
    perceivedDifficulty: row.perceived_difficulty as number,
    notes: (row.notes as string) ?? undefined,
    createdAt: row.created_at as string,
  }
}
