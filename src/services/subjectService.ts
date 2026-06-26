/**
 * Subject Service
 * Manages both academic and personal subjects.
 * Uses Supabase when configured, falls back to localStorage.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Subject, SubjectType } from '../types'

const LS_KEY = 'student_subjects'

// ─── Default academic subjects (used as fallback seed) ────────────────────────

export const DEFAULT_ACADEMIC_SUBJECTS: Subject[] = [
  { id: 's1', user_id: 'default', created_at: '2024-09-01T00:00:00Z', name: 'Algorithmes Avancés',   color: '#7F77DD', type: 'academic', coefficient: 4, teacher: 'Pr. Khaled',   is_active: true },
  { id: 's2', user_id: 'default', created_at: '2024-09-01T00:00:00Z', name: 'Développement Web',      color: '#1D9E75', type: 'academic', coefficient: 3, teacher: 'Pr. Karimi',   is_active: true },
  { id: 's3', user_id: 'default', created_at: '2024-09-01T00:00:00Z', name: 'Base de Données',        color: '#BA7517', type: 'academic', coefficient: 3, teacher: 'Pr. Ouarrari', is_active: true },
  { id: 's4', user_id: 'default', created_at: '2024-09-01T00:00:00Z', name: 'Systèmes Distribués',    color: '#D4537E', type: 'academic', coefficient: 4, teacher: 'Pr. Nasri',    is_active: true },
  { id: 's5', user_id: 'default', created_at: '2024-09-01T00:00:00Z', name: 'Gestion de Projet',      color: '#0E7490', type: 'academic', coefficient: 2, teacher: 'Pr. Benali',   is_active: true },
  { id: 's6', user_id: 'default', created_at: '2024-09-01T00:00:00Z', name: 'Sécurité Informatique',  color: '#9333EA', type: 'academic', coefficient: 3, teacher: 'Pr. Tahiri',   is_active: true },
]

export const DEFAULT_PERSONAL_SUBJECTS: Subject[] = [
  { id: 'p1', user_id: 'default', created_at: '2024-09-01T00:00:00Z', name: 'Mathématiques',          color: '#F59E0B', type: 'personal', is_active: true },
  { id: 'p2', user_id: 'default', created_at: '2024-09-01T00:00:00Z', name: 'Intelligence Artificielle', color: '#EF4444', type: 'personal', is_active: true },
  { id: 'p3', user_id: 'default', created_at: '2024-09-01T00:00:00Z', name: 'Anglais Avancé',         color: '#06B6D4', type: 'personal', is_active: true },
  { id: 'p4', user_id: 'default', created_at: '2024-09-01T00:00:00Z', name: 'Développement Personnel', color: '#8B5CF6', type: 'personal', is_active: true },
  { id: 'p5', user_id: 'default', created_at: '2024-09-01T00:00:00Z', name: 'Réseaux & Infrastructure', color: '#10B981', type: 'personal', is_active: true },
]

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadFromStorage(): Subject[] {
  const raw = localStorage.getItem(LS_KEY)
  if (raw) return JSON.parse(raw)
  // Default to only academic subjects, so personal starts empty
  const defaults = DEFAULT_ACADEMIC_SUBJECTS
  localStorage.setItem(LS_KEY, JSON.stringify(defaults))
  return defaults
}

function saveToStorage(subjects: Subject[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(subjects))
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getSubjects(userId?: string, type?: SubjectType): Promise<Subject[]> {
  if (isSupabaseConfigured && userId) {
    let query = supabase.from('subjects').select('*').eq('user_id', userId).eq('is_active', true)
    if (type) query = query.eq('type', type)
    const { data, error } = await query.order('name')
    if (!error && data) {
      if (data.length === 0) {
        // Auto-seed default subjects in the database for this student - ONLY academic subjects
        const defaults = DEFAULT_ACADEMIC_SUBJECTS
        const toInsert = defaults.map(s => ({
          user_id: userId,
          name: s.name,
          color: s.color,
          type: s.type,
          coefficient: s.coefficient ?? null,
          teacher: s.teacher ?? null,
          is_active: true,
        }))
        const { data: inserted, error: insertError } = await supabase
          .from('subjects')
          .insert(toInsert)
          .select()
        if (!insertError && inserted) {
          const mapped = inserted.map(row => ({
            id: row.id,
            name: row.name,
            color: row.color,
            type: row.type as SubjectType,
            coefficient: row.coefficient ?? undefined,
            teacher: row.teacher ?? undefined,
            is_active: row.is_active,
            user_id: row.user_id,
            created_at: row.created_at,
          }))
          return type ? mapped.filter(s => s.type === type) : mapped
        }
      } else {
        return data.map(row => ({
          id: row.id,
          name: row.name,
          color: row.color,
          type: row.type as SubjectType,
          coefficient: row.coefficient ?? undefined,
          teacher: row.teacher ?? undefined,
          is_active: row.is_active,
          user_id: row.user_id,
          created_at: row.created_at,
        }))
      }
    }
  }

  const subjects = loadFromStorage()
  return type ? subjects.filter(s => s.type === type) : subjects
}

export async function createSubject(userId: string, subject: Omit<Subject, 'id'>): Promise<Subject> {
  const newSubject: Subject = { ...subject, id: `subj-${Date.now()}`, is_active: true, user_id: userId, created_at: new Date().toISOString() }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('subjects').insert({
      user_id: userId,
      name: subject.name,
      color: subject.color,
      type: subject.type,
      coefficient: subject.coefficient ?? null,
      teacher: subject.teacher ?? null,
      is_active: true,
    }).select().single()
    if (!error && data) {
      return { ...newSubject, id: data.id }
    }
  }

  const subjects = loadFromStorage()
  subjects.push(newSubject)
  saveToStorage(subjects)
  return newSubject
}

export async function updateSubject(userId: string, id: string, updates: Partial<Subject>): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('subjects').update({
      name: updates.name,
      color: updates.color,
      coefficient: updates.coefficient ?? null,
      teacher: updates.teacher ?? null,
      is_active: updates.is_active,
    }).eq('id', id).eq('user_id', userId)
  }

  const subjects = loadFromStorage()
  const idx = subjects.findIndex(s => s.id === id)
  if (idx >= 0) {
    subjects[idx] = { ...subjects[idx], ...updates }
    saveToStorage(subjects)
  }
}

export async function deleteSubject(userId: string, id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('subjects').update({ is_active: false }).eq('id', id).eq('user_id', userId)
  }

  const subjects = loadFromStorage()
  saveToStorage(subjects.map(s => s.id === id ? { ...s, is_active: false } : s))
}
