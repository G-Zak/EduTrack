import { useState, useEffect } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { 
  grades as mockGrades, 
  subjects as mockSubjects, 
  absences as mockAbsences, 
  tasks as mockTasks 
} from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getSubjects } from '../services/subjectService'

// ─── Helpers for calculations ──────────────────────────────────────────────────

function getSubjectAverage(gradesList: any[], subjectId: string) {
  const sg = gradesList.filter(g => g.subjectId === subjectId || g.subject_id === subjectId)
  if (!sg.length) return 0
  const totalWeight = sg.reduce((s, g) => s + Number(g.weight), 0)
  const weighted = sg.reduce((s, g) => s + Number(g.value) * Number(g.weight), 0)
  return +(weighted / totalWeight).toFixed(2)
}

function getGeneralAverage(gradesList: any[], subjectsList: any[]) {
  let totalCoeff = 0, weightedSum = 0
  const academicSubjects = subjectsList.filter(s => s.type === 'academic')
  if (academicSubjects.length === 0) return 0

  academicSubjects.forEach(s => {
    const avg = getSubjectAverage(gradesList, s.id)
    const coeff = s.coefficient || 1
    weightedSum += avg * coeff
    totalCoeff += coeff
  })
  return totalCoeff ? +(weightedSum / totalCoeff).toFixed(2) : 0
}

function buildRadarData(gradesList: any[], subjectsList: any[]) {
  return subjectsList.map(s => ({
    subject: s.name.split(' ')[0], // short label
    Note: getSubjectAverage(gradesList, s.id),
    fullName: s.name,
  }))
}

function buildTrendData(gradesList: any[]) {
  const sorted = [...gradesList].sort((a, b) => a.date.localeCompare(b.date))
  const byMonth: Record<string, number[]> = {}
  sorted.forEach(g => {
    const month = g.date.slice(0, 7)
    if (!byMonth[month]) byMonth[month] = []
    byMonth[month].push(g.value)
  })
  return Object.entries(byMonth).map(([month, vals]) => ({
    month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
    Moyenne: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
    Cible: 14,
  }))
}

export default function AnalyticsPage() {
  const { user, isConfigured } = useAuth()
  const studentId = user?.id?.startsWith('demo-') ? 'EMSI-2024-0142' : (user?.id || 'EMSI-2024-0142')

  const [studentGrades, setStudentGrades] = useState<any[]>([])
  const [subjectsList, setSubjectsList] = useState<any[]>([])
  const [studentAbsences, setStudentAbsences] = useState<any[]>([])
  const [studentTasks, setStudentTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      if (isConfigured && user?.id) {
        // 1. Fetch subjects
        const subjectsData = await getSubjects(user.id)
        setSubjectsList(subjectsData)

        // 2. Fetch grades
        const { data: gradesData } = await supabase
          .from('grades')
          .select('*')
          .eq('user_id', user.id)
        if (gradesData) {
          setStudentGrades(gradesData.map(g => ({
            id: g.id,
            subjectId: g.subject_id,
            value: g.value,
            weight: g.weight,
            date: g.date,
          })))
        }

        // 3. Fetch absences
        const { data: absencesData } = await supabase
          .from('absences')
          .select('*')
          .eq('user_id', user.id)
        if (absencesData) {
          setStudentAbsences(absencesData)
        }

        // 4. Fetch tasks
        const ownReq = supabase.from('tasks').select('*').eq('user_id', user.id)
        const groupReq = user.groupId
          ? supabase.from('tasks').select('*').eq('group_id', user.groupId).eq('user_id', user.id)
          : Promise.resolve({ data: [], error: null })

        const [own, grp] = await Promise.all([ownReq, groupReq])
        const allRows = [...(own.data ?? []), ...(grp.data ?? [])]
        const seen = new Set<string>()
        const unique = allRows.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true })
        setStudentTasks(unique)
      } else {
        // Fallback to offline mock data
        setSubjectsList(mockSubjects)
        setStudentGrades(mockGrades.filter(g => g.studentId === studentId))
        setStudentAbsences(mockAbsences.filter(a => a.studentId === studentId))
        setStudentTasks(mockTasks.filter(t => t.studentId === studentId))
      }
      setLoading(false)
    }

    loadData()
  }, [isConfigured, user?.id, user?.groupId, studentId])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-[var(--color-text-secondary)] text-sm">Chargement des analyses...</div>
      </div>
    )
  }

  const genAvg = getGeneralAverage(studentGrades, subjectsList)
  const radarData = buildRadarData(studentGrades, subjectsList)
  const trendData = buildTrendData(studentGrades)
  const absenceDays = studentAbsences.reduce((s, a) => s + (a.duration === 'full' ? 1 : 0.5), 0)
  const absenceRate = +((absenceDays / 120) * 100).toFixed(1)
  const overdueCount = studentTasks.filter(t => t.status === 'overdue').length
  const completionRate = studentTasks.length 
    ? +(studentTasks.filter(t => ['submitted', 'graded', 'completed'].includes(t.status)).length / studentTasks.length * 100).toFixed(0) 
    : 0

  const bestSubject = subjectsList.length 
    ? subjectsList.reduce((best, s) => getSubjectAverage(studentGrades, s.id) > getSubjectAverage(studentGrades, best.id) ? s : best, subjectsList[0])
    : null
    
  const weakestSubject = subjectsList.length 
    ? subjectsList.reduce((worst, s) => getSubjectAverage(studentGrades, s.id) < getSubjectAverage(studentGrades, worst.id) ? s : worst, subjectsList[0])
    : null

  const MENTION =
    genAvg >= 18 ? { label: 'Très Bien', color: '#1D9E75' } :
    genAvg >= 16 ? { label: 'Bien', color: '#3b82f6' } :
    genAvg >= 14 ? { label: 'Assez Bien', color: '#BA7517' } :
    genAvg >= 12 ? { label: 'Passable', color: '#9333EA' } :
                   { label: 'Insuffisant', color: '#D4537E' }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Analytics & Performance</h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Vue globale de votre progression académique.</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-[var(--color-primary)] p-5 text-white shadow-sm">
          <div className="text-[var(--text-xs)] font-medium opacity-80 uppercase tracking-wider">Moyenne Générale</div>
          <div className="mt-2 text-4xl font-bold">{genAvg}/20</div>
          <div className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[var(--text-xs)] font-medium bg-white/20 text-white">
            {MENTION.label}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 shadow-sm">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Taux de présence</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{(100 - absenceRate).toFixed(1)}%</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{absenceDays}j d'absence</div>
        </div>

        <div className="rounded-2xl border border-green-100 bg-green-50 p-5 shadow-sm">
          <div className="text-[var(--text-xs)] font-medium text-green-700 uppercase tracking-wider">Tâches complétées</div>
          <div className="mt-2 text-4xl font-bold text-green-700">{completionRate}%</div>
          <div className="mt-1 text-[var(--text-xs)] text-green-600">taux de complétion</div>
        </div>

        <div className={`rounded-2xl border p-5 shadow-sm ${overdueCount > 0 ? 'border-red-100 bg-red-50' : 'border-[var(--color-border)] bg-[var(--color-white)]'}`}>
          <div className={`text-[var(--text-xs)] font-medium uppercase tracking-wider ${overdueCount > 0 ? 'text-red-700' : 'text-[var(--color-text-secondary)]'}`}>En retard</div>
          <div className={`mt-2 text-4xl font-bold ${overdueCount > 0 ? 'text-red-500' : 'text-[var(--color-text)]'}`}>{overdueCount}</div>
          <div className={`mt-1 text-[var(--text-xs)] ${overdueCount > 0 ? 'text-red-500' : 'text-[var(--color-text-secondary)]'}`}>
            tâche{overdueCount !== 1 ? 's' : ''} en retard
          </div>
        </div>
      </div>

      {/* Radar + Trend side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Radar Chart */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-sm">
          <h2 className="mb-4 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Profil de compétences</h2>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Radar
                  name="Note /20"
                  dataKey="Note"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--color-text-secondary)] py-12 text-center">Données insuffisantes pour le profil.</p>
          )}
        </div>

        {/* Trend chart */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-sm">
          <h2 className="mb-4 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Évolution & objectif</h2>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                  formatter={(v: any) => [`${v}/20`]}
                />
                <Legend />
                <Line type="monotone" dataKey="Moyenne" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} name="Moyenne réelle" />
                <Line type="monotone" dataKey="Cible" stroke="#e5e7eb" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Objectif (14/20)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--color-text-secondary)] py-12 text-center">Données insuffisantes pour l'évolution.</p>
          )}
        </div>
      </div>

      {/* Insights */}
      {bestSubject && weakestSubject && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-sm">
          <h2 className="mb-4 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Points clés</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-green-50 border border-green-100 p-4">
              <div className="text-[var(--text-xs)] font-semibold text-green-700 uppercase tracking-wider mb-1">✨ Meilleure matière</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: bestSubject.color }} />
                <span className="font-semibold text-[var(--color-text)] truncate">{bestSubject.name}</span>
              </div>
              <div className="mt-1 text-2xl font-bold" style={{ color: bestSubject.color }}>{getSubjectAverage(studentGrades, bestSubject.id)}/20</div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <div className="text-[var(--text-xs)] font-semibold text-amber-700 uppercase tracking-wider mb-1">⚡ À renforcer</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: weakestSubject.color }} />
                <span className="font-semibold text-[var(--color-text)] truncate">{weakestSubject.name}</span>
              </div>
              <div className="mt-1 text-2xl font-bold" style={{ color: weakestSubject.color }}>{getSubjectAverage(studentGrades, weakestSubject.id)}/20</div>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
              <div className="text-[var(--text-xs)] font-semibold text-blue-700 uppercase tracking-wider mb-1">🎯 Mention visée</div>
              <div className="mt-2 text-2xl font-bold" style={{ color: MENTION.color }}>{MENTION.label}</div>
              <div className="mt-1 text-[var(--text-xs)] text-blue-600">
                {genAvg >= 18 ? 'Félicitations !' :
                 genAvg >= 16 ? `+${(18 - genAvg).toFixed(2)} pts pour Très Bien` :
                 `+${(16 - genAvg).toFixed(2)} pts pour Bien`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject-by-subject breakdown */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-sm">
        <h2 className="mb-5 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Détail par matière</h2>
        <div className="space-y-3">
          {subjectsList.map(s => {
            const avg = getSubjectAverage(studentGrades, s.id)
            const gradeCount = studentGrades.filter(g => g.subjectId === s.id || g.subject_id === s.id).length
            return (
              <div key={s.id} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-52 flex-shrink-0">
                  <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-[var(--text-sm)] font-medium text-[var(--color-text)] truncate">{s.name}</span>
                </div>
                <div className="flex-1 h-3 rounded-full bg-[var(--color-gray-bg)] overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${(avg / 20) * 100}%`, background: s.color }}
                  />
                </div>
                <div className="w-20 flex-shrink-0 text-right">
                  <span className="font-bold text-[var(--color-text)]">{avg}/20</span>
                </div>
                <div className="w-24 flex-shrink-0 text-right text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                  {gradeCount} note{gradeCount > 1 ? 's' : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
