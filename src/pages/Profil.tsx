import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { 
  modules, 
  grades as mockGrades, 
  tasks as mockTasks, 
  mockGroups, 
  mockGroupStudents 
} from '../data/mockData'
import { supabase } from '../lib/supabase'
import { getSubjects } from '../services/subjectService'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
      <span className="w-36 flex-shrink-0 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <span className="text-sm text-[var(--color-text)] font-semibold">{value}</span>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 text-center shadow-sm">
      <div className="text-3xl font-bold text-[var(--color-text)]">{value}</div>
      <div className="mt-1 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{sub}</div>}
    </div>
  )
}

function RoleBadge({ role }: { role: 'student' | 'teacher' }) {
  return role === 'teacher' ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Enseignant
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zm0-3a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
      Étudiant
    </span>
  )
}

// ─── Student profile ───────────────────────────────────────────────────────────

function StudentProfile({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const { progress, isCompleted } = useProgress()
  const { isConfigured } = useAuth()

  const [studentGrades, setStudentGrades] = useState<any[]>([])
  const [studentTasks, setStudentTasks] = useState<any[]>([])
  const studentId = user?.id?.startsWith('demo-') ? 'EMSI-2024-0142' : (user?.id || 'EMSI-2024-0142')
  const [groupName, setGroupName] = useState<string | undefined>(
    user.groupName || (mockGroupStudents.find(gs => gs.studentId === studentId)
      ? mockGroups.find(g => g.id === (user.groupId ?? 'g1'))?.name
      : undefined)
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let gradesSubscription: any = null
    let tasksSubscription: any = null
    let groupSubscription: any = null

    const fetchTasks = async () => {
      if (!user?.id) return []
      const ownReq = supabase.from('tasks').select('*').eq('user_id', user.id)
      const groupReq = user.groupId
        ? supabase.from('tasks').select('*').eq('group_id', user.groupId).eq('user_id', user.id)
        : Promise.resolve({ data: [], error: null })

      const [own, grp] = await Promise.all([ownReq, groupReq])
      const allRows = [...(own.data ?? []), ...(grp.data ?? [])]
      const seen = new Set<string>()
      return allRows.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true })
    }

    const loadStudentData = async () => {
      setLoading(true)
      try {
        if (isConfigured && user?.id) {
          // Fetch group
          const { data: groupRows } = await supabase
            .from('group_students')
            .select('group_id, groups(id, name)')
            .eq('student_id', user.id)
            .limit(1)
          if (groupRows && groupRows[0]) {
            const firstGroup = groupRows[0] as any
            if (firstGroup.groups?.name) {
              setGroupName(firstGroup.groups.name)
            }
          }

          // Fetch grades
          const { data: gradesData } = await supabase
            .from('grades')
            .select('*')
            .eq('user_id', user.id)
          if (gradesData) setStudentGrades(gradesData)

          // Fetch tasks
          const unique = await fetchTasks()
          setStudentTasks(unique)

          // Subscribe to grades changes
          gradesSubscription = supabase
            .channel(`profile-grades-${user.id}`)
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'grades', filter: `user_id=eq.${user.id}` },
              async () => {
                const { data: updatedGrades } = await supabase
                  .from('grades')
                  .select('*')
                  .eq('user_id', user.id)
                if (updatedGrades) setStudentGrades(updatedGrades)
              }
            )
            .subscribe()

          // Subscribe to tasks changes
          tasksSubscription = supabase
            .channel(`profile-tasks-${user.id}`)
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'tasks' },
              async () => {
                const uniqueTasks = await fetchTasks()
                setStudentTasks(uniqueTasks)
              }
            )
            .subscribe()

          // Subscribe to group_students changes
          groupSubscription = supabase
            .channel(`profile-group-${user.id}`)
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'group_students', filter: `student_id=eq.${user.id}` },
              async () => {
                const { data: grpRows } = await supabase
                  .from('group_students')
                  .select('group_id, groups(id, name)')
                  .eq('student_id', user.id)
                  .limit(1)
                if (grpRows && grpRows[0]) {
                  const first = grpRows[0] as any
                  if (first.groups?.name) {
                    setGroupName(first.groups.name)
                  }
                } else {
                  setGroupName(undefined)
                }
              }
            )
            .subscribe()
        } else {
          setStudentGrades(mockGrades.filter(g => g.studentId === studentId))
          setStudentTasks(mockTasks.filter(t => t.studentId === studentId))
        }
      } catch (err) {
        console.error("Error loading student profile:", err)
      } finally {
        setLoading(false)
      }
    }

    loadStudentData()

    return () => {
      if (gradesSubscription) supabase.removeChannel(gradesSubscription)
      if (tasksSubscription) supabase.removeChannel(tasksSubscription)
      if (groupSubscription) supabase.removeChannel(groupSubscription)
    }
  }, [isConfigured, user?.id, user?.groupId, studentId])

  const displayName = user.user_metadata?.name ?? user.email ?? 'Étudiant'
  const initials = displayName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'ET'

  // Lesson progress
  const allLessons = modules.flatMap(m => m.chapters.flatMap(c => c.lessons))
  const totalLessons = allLessons.length
  const completedLessons = progress.completedLessons.length
  const lessonPct = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0

  const modulesDone = modules.filter(m => {
    const ids = m.chapters.flatMap(c => c.lessons.map(l => l.id))
    return ids.every(id => isCompleted(id))
  }).length

  // Grade average calculations
  const totalWeight = studentGrades.reduce((s, g) => s + Number(g.weight), 0)
  const weightedSum = studentGrades.reduce((s, g) => s + Number(g.value) * Number(g.weight), 0)
  const avgGrade = totalWeight ? +(weightedSum / totalWeight).toFixed(1) : 0

  // Task stats
  const completedTasks = studentTasks.filter(t => t.status === 'completed' || t.status === 'graded').length
  const pendingTasks = studentTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Mode Démo'

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-[var(--color-text-secondary)] text-sm">Chargement des données du profil...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-sm">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="flex h-18 w-18 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold text-xl select-none" style={{ height: 72, width: 72 }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-[var(--color-text)] truncate">{displayName}</h1>
              <RoleBadge role="student" />
              {groupName && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {groupName}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-6 divide-y divide-[var(--color-border)]">
          <InfoRow label="Nom complet" value={displayName} />
          <InfoRow label="Email" value={user.email ?? '—'} />
          <InfoRow label="Rôle" value={<RoleBadge role="student" />} />
          {groupName && <InfoRow label="Groupe" value={groupName} />}
          <InfoRow label="Membre depuis" value={joinedDate} />
          <InfoRow
            label="Compte"
            value={
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Actif
              </span>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Progression" value={`${lessonPct}%`} sub={`${completedLessons}/${totalLessons} leçons`} />
        <StatCard label="Modules" value={modulesDone} sub="terminés" />
        <StatCard label="Moyenne" value={`${avgGrade}/20`} sub={`${studentGrades.length} notes`} />
        <StatCard label="Tâches" value={completedTasks} sub={`${pendingTasks} en cours`} />
      </div>

      {/* Read-only notice */}
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-3 shadow-sm">
        <svg className="h-4 w-4 text-[var(--color-text-secondary)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Ces informations sont en lecture seule. Pour modifier vos données, contactez votre administrateur.
        </p>
      </div>
    </div>
  )
}

// ─── Teacher profile ───────────────────────────────────────────────────────────

function TeacherProfile({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const { isConfigured } = useAuth()
  
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalGroups, setTotalGroups] = useState(0)
  const [assignedTasks, setAssignedTasks] = useState(0)
  const [totalGrades, setTotalGrades] = useState(0)
  const [teacherGroups, setTeacherGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTeacherData = async () => {
      setLoading(true)
      if (isConfigured && user?.id) {
        // Fetch groups
        const { data: gtData } = await supabase.from('group_teachers')
          .select('group_id, groups(id, name, description)')
          .eq('teacher_id', user.id)

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

          setTeacherGroups(mappedGroups)
          setTotalGroups(mappedGroups.length)

          const groupIds = mappedGroups.map(g => g.id)
          if (groupIds.length > 0) {
            // Count students
            const { count: studCount } = await supabase.from('group_students')
              .select('student_id', { count: 'exact', head: true })
              .in('group_id', groupIds)
            setTotalStudents(studCount || 0)

            // Count tasks
            const { count: tasksCount } = await supabase.from('tasks')
              .select('id', { count: 'exact', head: true })
              .in('group_id', groupIds)
            setAssignedTasks(tasksCount || 0)

            // Count grades
            const { count: gradesCount } = await supabase.from('grades')
              .select('id', { count: 'exact', head: true })
              .in('group_id', groupIds)
            setTotalGrades(gradesCount || 0)
          }
        }
      } else {
        // Fallbacks
        setTeacherGroups(mockGroups)
        setTotalGroups(mockGroups.length)
        setTotalStudents(mockGroupStudents.length)
        setAssignedTasks(mockTasks.filter(t => (t as any).createdBy === 'teacher' || (t as any).created_by === 'teacher').length)
        setTotalGrades(mockGrades.length)
      }
      setLoading(false)
    }

    loadTeacherData()
  }, [isConfigured, user?.id])

  const displayName = user.user_metadata?.name ?? user.email ?? 'Enseignant'
  const initials = displayName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'EN'

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Mode Démo'

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-[var(--color-text-secondary)] text-sm">Chargement du profil enseignant...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="flex h-18 w-18 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xl select-none" style={{ height: 72, width: 72 }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-[var(--color-text)] truncate">{displayName}</h1>
              <RoleBadge role="teacher" />
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-6 divide-y divide-[var(--color-border)]">
          <InfoRow label="Nom complet" value={displayName} />
          <InfoRow label="Email" value={user.email ?? '—'} />
          <InfoRow label="Rôle" value={<RoleBadge role="teacher" />} />
          <InfoRow label="Membre depuis" value={joinedDate} />
          <InfoRow
            label="Compte"
            value={
              <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Actif
              </span>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Groupes" value={totalGroups} sub="classes" />
        <StatCard label="Étudiants" value={totalStudents} sub="inscrits" />
        <StatCard label="Devoirs" value={assignedTasks} sub="assignés" />
        <StatCard label="Notes" value={totalGrades} sub="saisies" />
      </div>

      {/* Assigned groups */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Groupes assignés</h2>
        <div className="space-y-2">
          {teacherGroups.map(g => {
            return (
              <div key={g.id} className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {g.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--color-text)] truncate">{g.name}</div>
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

      {/* Read-only notice */}
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-3 shadow-sm">
        <svg className="h-4 w-4 text-[var(--color-text-secondary)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Ces informations sont en lecture seule. Pour modifier vos données, contactez votre administrateur.
        </p>
      </div>
    </div>
  )
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function Profil() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-[var(--color-text-secondary)] text-sm">Chargement du profil...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-[var(--color-text-secondary)] text-sm">Veuillez vous connecter.</div>
      </div>
    )
  }

  const isTeacher = user.role === 'teacher'
  return isTeacher ? <TeacherProfile user={user} /> : <StudentProfile user={user} />
}