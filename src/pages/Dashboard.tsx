import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  grades as mockGrades, 
  absences as mockAbsences, 
  tasks as mockTasks, 
  feedbacks as mockFeedbacks, 
  subjects as mockSubjects, 
  modules, 
  profile, 
  mockGroups, 
  mockGroupStudents 
} from '../data/mockData'
import { useProgress } from '../context/ProgressContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getSubjects } from '../services/subjectService'
import RadialProgress from '../components/shared/RadialProgress'

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
  subjectsList.forEach(s => {
    const avg = getSubjectAverage(gradesList, s.id)
    const coeff = s.coefficient ?? 1
    weightedSum += avg * coeff
    totalCoeff += coeff
  })
  return totalCoeff ? +(weightedSum / totalCoeff).toFixed(2) : 0
}

// ─── Teacher Dashboard ────────────────────────────────────────────────────────

function TeacherDashboard() {
  const navigate = useNavigate()
  const { user, isConfigured } = useAuth()
  const teacherName = user?.user_metadata?.name ?? user?.email ?? 'Enseignant'

  const [totalStudents, setTotalStudents] = useState(0)
  const [totalGroups, setTotalGroups] = useState(0)
  const [pendingReview, setPendingReview] = useState(0)
  const [totalGrades, setTotalGrades] = useState(0)
  const [completedAssigned, setCompletedAssigned] = useState(0)
  const [excellent, setExcellent] = useState(0)
  const [satisfactory, setSatisfactory] = useState(0)
  const [failing, setFailing] = useState(0)
  
  const [assignedTasks, setAssignedTasks] = useState<any[]>([])
  const [groupsList, setGroupsList] = useState<any[]>([])

  useEffect(() => {
    if (isConfigured && user?.id) {
      // 1. Fetch groups teacher is assigned to
      supabase.from('group_teachers')
        .select('group_id, groups(id, name, description)')
        .eq('teacher_id', user.id)
        .then(({ data: gtData }) => {
          if (gtData) {
            const mappedGroups = gtData
              .filter((g: any) => g.groups)
              .map((g: any) => ({
                id: g.groups.id,
                name: g.groups.name,
                description: g.groups.description,
              }))
              .sort((a, b) => {
                const numA = parseInt(a.name.replace(/\D/g, ''), 10)
                const numB = parseInt(b.name.replace(/\D/g, ''), 10)
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB
                return a.name.localeCompare(b.name)
              })
            setGroupsList(mappedGroups)
            setTotalGroups(mappedGroups.length)

            const groupIds = mappedGroups.map(g => g.id)
            if (groupIds.length > 0) {
              // 2. Fetch student count in these groups
              supabase.from('group_students')
                .select('student_id', { count: 'exact', head: true })
                .in('group_id', groupIds)
                .then(({ count }) => {
                  setTotalStudents(count || 0)
                })

              // 3. Fetch tasks in these groups
              supabase.from('tasks')
                .select('*')
                .in('group_id', groupIds)
                .then(({ data: tData }) => {
                  if (tData) {
                    setAssignedTasks(tData)
                    setPendingReview(tData.filter(t => t.status === 'submitted').length)
                    setCompletedAssigned(tData.filter(t => t.status === 'completed' || t.status === 'graded').length)
                  }
                })

              // 4. Fetch grades in these groups
              supabase.from('grades')
                .select('*')
                .in('group_id', groupIds)
                .then(({ data: gData }) => {
                  if (gData) {
                    setTotalGrades(gData.length)
                    setExcellent(gData.filter(g => g.value >= 16).length)
                    setSatisfactory(gData.filter(g => g.value >= 12 && g.value < 16).length)
                    setFailing(gData.filter(g => g.value < 12).length)
                  }
                })
            }
          }
        })
    } else {
      // Demo mode fallbacks
      setGroupsList(mockGroups)
      setTotalGroups(mockGroups.length)
      setTotalStudents(mockGroupStudents.length)

      const fallbackTasks = mockTasks.filter(t => (t as any).createdBy === 'teacher' || (t as any).created_by === 'teacher')
      setAssignedTasks(fallbackTasks)
      setPendingReview(fallbackTasks.filter(t => t.status === 'submitted').length)
      setCompletedAssigned(fallbackTasks.filter(t => t.status === 'completed' || t.status === 'graded').length)

      setTotalGrades(mockGrades.length)
      setExcellent(mockGrades.filter(g => g.value >= 16).length)
      setSatisfactory(mockGrades.filter(g => g.value >= 12 && g.value < 16).length)
      setFailing(mockGrades.filter(g => g.value < 12).length)
    }
  }, [isConfigured, user?.id])

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          Bonjour, {teacherName.split(' ')[0]}
        </h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          Espace Enseignant · {today}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-[var(--color-primary)] p-5 text-white">
          <div className="text-[var(--text-xs)] font-medium opacity-75 uppercase tracking-wider">Groupes</div>
          <div className="mt-2 text-4xl font-bold">{totalGroups}</div>
          <div className="mt-1 text-[var(--text-xs)] opacity-60">classes actives</div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Étudiants</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{totalStudents}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">inscrits au total</div>
        </div>

        <button
          onClick={() => navigate('/taches')}
          className={`rounded-2xl border p-5 text-left transition-transform hover:scale-[1.02] ${
            pendingReview > 0 ? 'border-amber-200 bg-amber-50' : 'border-[var(--color-border)] bg-[var(--color-white)]'
          }`}
        >
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">À corriger</div>
          <div className={`mt-2 text-4xl font-bold ${pendingReview > 0 ? 'text-amber-600' : 'text-[var(--color-text)]'}`}>
            {pendingReview}
          </div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">travaux soumis</div>
        </button>

        <button
          onClick={() => navigate('/notes')}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-left transition-transform hover:scale-[1.02]"
        >
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Notes saisies</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{totalGrades}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{completedAssigned} devoirs terminés</div>
        </button>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Groups overview */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Mes groupes</h2>
            <button onClick={() => navigate('/taches')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Gérer</button>
          </div>
          <div className="space-y-3">
            {groupsList.map(g => {
              // Note: approximate count in demo mode vs database fetch
              return (
                <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors cursor-pointer" onClick={() => navigate('/taches')}>
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold text-sm">
                    {g.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--color-text)]">{g.name}</div>
                    {g.description && <div className="text-xs text-[var(--color-text-secondary)] truncate">{g.description}</div>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-[var(--color-text-secondary)]">classe active</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Grade distribution */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Répartition des notes</h2>
            <button onClick={() => navigate('/notes')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Voir tout</button>
          </div>
          {totalGrades === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">Aucune note saisie pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Excellent (≥ 16)', count: excellent, color: '#16a34a', bg: 'bg-green-100' },
                { label: 'Satisfaisant (12–16)', count: satisfactory, color: '#d97706', bg: 'bg-amber-100' },
                { label: 'Insuffisant (< 12)', count: failing, color: '#dc2626', bg: 'bg-red-100' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0`} style={{ background: item.color }} />
                  <span className="flex-1 text-[var(--text-sm)] text-[var(--color-text)]">{item.label}</span>
                  <div className="w-28 h-2 rounded-full bg-[var(--color-gray-bg)] flex-shrink-0">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${(item.count / totalGrades) * 100}%`, background: item.color }} />
                  </div>
                  <span className="w-8 text-right text-[var(--text-sm)] font-bold text-[var(--color-text)]">{item.count}</span>
                </div>
              ))}
              <div className="mt-2 pt-3 border-t border-[var(--color-border)] flex justify-between text-xs text-[var(--color-text-secondary)]">
                <span>Total : {totalGrades} notes</span>
                <span>Taux de réussite : {totalGrades ? Math.round(((excellent + satisfactory) / totalGrades) * 100) : 0}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task completion overview */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Suivi des devoirs assignés</h2>
          <button onClick={() => navigate('/taches')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Gérer</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { label: 'À faire', count: assignedTasks.filter(t => t.status === 'pending').length, style: 'bg-gray-50 border-gray-200 text-gray-600' },
            { label: 'En cours', count: assignedTasks.filter(t => t.status === 'in_progress').length, style: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: 'Soumis', count: pendingReview, style: 'bg-amber-50 border-amber-200 text-amber-700' },
            { label: 'Terminés', count: completedAssigned, style: 'bg-green-50 border-green-200 text-green-700' },
          ]).map(item => (
            <div key={item.label} className={`rounded-xl border p-4 text-center ${item.style}`}>
              <div className="text-3xl font-bold">{item.count}</div>
              <div className="mt-1 text-[var(--text-xs)] font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Student Dashboard ────────────────────────────────────────────────────────

function StudentDashboard() {
  const navigate = useNavigate()
  const { user, isConfigured } = useAuth()
  const { progress, isCompleted } = useProgress()

  const [studentGrades, setStudentGrades] = useState<any[]>([])
  const [subjectsList, setSubjectsList] = useState<any[]>([])
  const [studentAbsences, setStudentAbsences] = useState<any[]>([])
  const [studentTasks, setStudentTasks] = useState<any[]>([])

  const studentId = user?.id?.startsWith('demo-') ? 'EMSI-2024-0142' : (user?.id || 'EMSI-2024-0142')

  useEffect(() => {
    if (isConfigured && user?.id) {
      // 1. Fetch subjects
      getSubjects(user.id).then(list => {
        setSubjectsList(list)
      })

      // 2. Fetch grades
      supabase.from('grades')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setStudentGrades(data)
        })

      // 3. Fetch absences
      supabase.from('absences')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setStudentAbsences(data)
        })

      // 4. Fetch tasks (own + group-assigned)
      const ownReq = supabase.from('tasks').select('*').eq('user_id', user.id)
      const groupReq = user.groupId
        ? supabase.from('tasks').select('*').eq('group_id', user.groupId).eq('user_id', user.id)
        : Promise.resolve({ data: [], error: null })

      Promise.all([ownReq, groupReq]).then(([own, grp]) => {
        const allRows = [...(own.data ?? []), ...(grp.data ?? [])]
        const seen = new Set<string>()
        const unique = allRows.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true })
        setStudentTasks(unique)
      })
    } else {
      // Offline fallback
      setSubjectsList(mockSubjects)
      setStudentGrades(mockGrades.filter(g => g.studentId === studentId))
      setStudentAbsences(mockAbsences.filter(a => a.studentId === studentId))
      setStudentTasks(mockTasks.filter(t => t.studentId === studentId))
    }
  }, [isConfigured, user?.id, user?.groupId, studentId])

  const genAvg = getGeneralAverage(studentGrades, subjectsList)
  const totalAbsenceDays = studentAbsences.reduce((s, a) => s + (a.duration === 'full' ? 1 : 0.5), 0)
  const absenceRate = +((totalAbsenceDays / 120) * 100).toFixed(1)
  
  const overdueCount = studentTasks.filter(t => t.status === 'overdue').length
  const pendingCount = studentTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length


  const MENTION =
    genAvg >= 18 ? 'Très Bien' :
    genAvg >= 16 ? 'Bien' :
    genAvg >= 14 ? 'Assez Bien' :
    genAvg >= 12 ? 'Passable' : 'Insuffisant'

  const studentName = user?.user_metadata?.name ?? user?.email ?? profile.name
  const groupLabel = user?.groupName ?? profile.year

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          Bonjour, {studentName.split(' ')[0]}
        </h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {groupLabel} · {profile.institution} · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </div>

      {/* Academic KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <button
          onClick={() => navigate('/notes')}
          className="group rounded-2xl bg-[var(--color-primary)] p-5 text-white text-left transition-transform hover:scale-[1.02]"
        >
          <div className="text-[var(--text-xs)] font-medium opacity-80 uppercase tracking-wider">Moyenne Générale</div>
          <div className="mt-2 text-4xl font-bold">{genAvg}</div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[var(--text-xs)] opacity-70">/ 20</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[var(--text-xs)]">{MENTION}</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/absences')}
          className={`group rounded-2xl border p-5 text-left transition-transform hover:scale-[1.02] ${
            absenceRate > 10 ? 'border-red-200 bg-red-50' : 'border-[var(--color-border)] bg-[var(--color-white)]'
          }`}
        >
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Absences</div>
          <div className={`mt-2 text-4xl font-bold ${absenceRate > 10 ? 'text-red-500' : 'text-[var(--color-text)]'}`}>
            {absenceRate}%
          </div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{totalAbsenceDays}j · {studentAbsences.length} entrées</div>
        </button>

        <button
          onClick={() => navigate('/taches')}
          className={`group rounded-2xl border p-5 text-left transition-transform hover:scale-[1.02] ${
            overdueCount > 0 ? 'border-orange-200 bg-orange-50' : 'border-[var(--color-border)] bg-[var(--color-white)]'
          }`}
        >
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Tâches</div>
          <div className={`mt-2 text-4xl font-bold ${overdueCount > 0 ? 'text-orange-500' : 'text-[var(--color-text)]'}`}>
            {overdueCount > 0 ? overdueCount : pendingCount}
          </div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
            {overdueCount > 0 ? `${overdueCount} en retard` : `${pendingCount} en cours / à faire`}
          </div>
        </button>

        <button
          onClick={() => navigate('/notes')}
          className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-left transition-transform hover:scale-[1.02]"
        >
          <div className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Matières</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{subjectsList.length}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">actives · {studentGrades.length} notes</div>
        </button>
      </div>

      {/* Middle row: Subject averages */}
      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Notes par matière</h2>
            <button onClick={() => navigate('/notes')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Voir tout</button>
          </div>
          <div className="space-y-3">
            {subjectsList.map(s => {
              const avg = getSubjectAverage(studentGrades, s.id)
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="flex-1 text-[var(--text-sm)] text-[var(--color-text)] truncate">{s.name}</span>
                  <div className="w-32 h-1.5 rounded-full bg-[var(--color-gray-bg)] flex-shrink-0">
                    <div className="h-1.5 rounded-full" style={{ width: `${(avg / 20) * 100}%`, background: s.color }} />
                  </div>
                  <span className="w-10 text-right text-[var(--text-sm)] font-bold text-[var(--color-text)]">{avg}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tasks quick view */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Tâches récentes</h2>
          <button onClick={() => navigate('/taches')} className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">Voir tout</button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['overdue', 'in_progress', 'pending', 'graded'] as const).map(status => {
            const count = studentTasks.filter(t => t.status === status).length
            const cfg = {
              overdue:     { label: 'En retard',  bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-600' },
              in_progress: { label: 'En cours',   bg: 'bg-blue-50',  border: 'border-blue-200',  text: 'text-blue-600' },
              pending:     { label: 'À faire',    bg: 'bg-gray-50',  border: 'border-gray-200',  text: 'text-gray-600' },
              graded:      { label: 'Notées',     bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
            }[status]
            return (
              <div key={status} className={`rounded-xl border p-4 text-center ${cfg.bg} ${cfg.border}`}>
                <div className={`text-3xl font-bold ${cfg.text}`}>{count}</div>
                <div className={`mt-1 text-[var(--text-xs)] font-medium ${cfg.text}`}>{cfg.label}</div>
              </div>
            )
          })}
        </div>
      </div>    </div>
  )
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth()
  const isTeacher = user?.role === 'teacher'
  return isTeacher ? <TeacherDashboard /> : <StudentDashboard />
}