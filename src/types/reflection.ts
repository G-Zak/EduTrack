/**
 * Reflection & Self-Evaluation Types
 */

export interface ReflectionEntry {
  id: string
  userId: string
  date: string             // ISO date (YYYY-MM-DD)
  subjectId?: string       // null = general reflection

  // Time Investment
  hoursStudied: number
  sessionsCount: number
  avgSessionMinutes: number

  // Productivity (1–10)
  tasksCompleted: number
  studyConsistency: number    // 1–10

  // Focus (1–10)
  concentrationLevel: number  // 1–10
  distractionsCount: number

  // Satisfaction (1–10)
  progressSatisfaction: number  // 1–10
  confidenceLevel: number       // 1–10
  motivationLevel: number       // 1–10

  // Understanding (1–10)
  selfAssessedMastery: number   // 1–10
  perceivedDifficulty: number   // 1–10

  notes?: string
  createdAt: string
}

export interface ReflectionFormData {
  date: string
  subjectId?: string
  hoursStudied: number
  sessionsCount: number
  avgSessionMinutes: number
  tasksCompleted: number
  studyConsistency: number
  concentrationLevel: number
  distractionsCount: number
  progressSatisfaction: number
  confidenceLevel: number
  motivationLevel: number
  selfAssessedMastery: number
  perceivedDifficulty: number
  notes?: string
}

/** Computed trend data for a series of reflections */
export interface ReflectionTrend {
  date: string
  satisfaction: number
  confidence: number
  motivation: number
  mastery: number
  concentration: number
  hoursStudied: number
}

export const REFLECTION_METRICS = [
  { key: 'progressSatisfaction', label: 'Satisfaction', color: '#1D9E75', description: 'Satisfaction avec ta progression (1–10)' },
  { key: 'confidenceLevel',      label: 'Confiance',    color: '#7F77DD', description: 'Niveau de confiance en toi (1–10)' },
  { key: 'motivationLevel',      label: 'Motivation',   color: '#BA7517', description: 'Niveau de motivation (1–10)' },
  { key: 'concentrationLevel',   label: 'Concentration', color: '#0E7490', description: 'Capacité de concentration (1–10)' },
  { key: 'selfAssessedMastery',  label: 'Maîtrise',     color: '#9333EA', description: 'Auto-évaluation de la maîtrise (1–10)' },
] as const

export type ReflectionMetricKey = typeof REFLECTION_METRICS[number]['key']
