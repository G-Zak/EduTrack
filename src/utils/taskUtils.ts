/**
 * Task utilities and helper functions
 */

import type { StudentTask, TaskStatus, Subtask } from '../types/task'

const STORAGE_KEY = 'student_tasks'

// ─── Local Storage Operations ────────────────────────────────────────────────

export function getStudentTasks(studentId: string): StudentTask[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(`${STORAGE_KEY}_${studentId}`)
  return stored ? JSON.parse(stored) : []
}

export function saveStudentTasks(studentId: string, tasks: StudentTask[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${STORAGE_KEY}_${studentId}`, JSON.stringify(tasks))
}

export function saveTask(studentId: string, task: StudentTask): void {
  const tasks = getStudentTasks(studentId)
  const existing = tasks.findIndex(t => t.id === task.id)
  if (existing >= 0) {
    tasks[existing] = task
  } else {
    tasks.push(task)
  }
  saveStudentTasks(studentId, tasks)
}

export function deleteTask(studentId: string, taskId: string): void {
  const tasks = getStudentTasks(studentId)
  saveStudentTasks(studentId, tasks.filter(t => t.id !== taskId))
}

// ─── Task Status & Time Logic ────────────────────────────────────────────────

export function getTaskStatus(task: StudentTask): TaskStatus {
  if (task.status === 'abandoned' || task.status === 'graded') return task.status
  
  const now = new Date()
  const dueDate = new Date(task.dueDate)
  
  // Check if overdue
  if (dueDate < now && task.status === 'pending') {
    return 'overdue'
  }
  
  return task.status
}

export function getDaysUntilDue(dueDate: string): number {
  const now = new Date()
  const due = new Date(dueDate)
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function isOverdue(task: StudentTask): boolean {
  return getTaskStatus(task) === 'overdue'
}

export function isOverdueWithinDays(dueDate: string, days: number): boolean {
  const daysLeft = getDaysUntilDue(dueDate)
  return daysLeft <= days && daysLeft > 0
}

// ─── Subtask Management ──────────────────────────────────────────────────────

export function getSubtaskCompletionPercentage(subtasks?: Subtask[]): number {
  if (!subtasks || subtasks.length === 0) return 0
  const completed = subtasks.filter(s => s.status === 'completed').length
  return Math.round((completed / subtasks.length) * 100)
}

export function updateSubtask(task: StudentTask, subtaskId: string, updates: Partial<Subtask>): StudentTask {
  if (!task.subtasks) return task
  return {
    ...task,
    subtasks: task.subtasks.map(s => 
      s.id === subtaskId ? { ...s, ...updates } : s
    ),
  }
}

export function addSubtask(task: StudentTask, subtask: Omit<Subtask, 'id'>): StudentTask {
  const id = `subtask-${Date.now()}`
  return {
    ...task,
    subtasks: [...(task.subtasks || []), { ...subtask, id } as Subtask],
  }
}

// ─── Task Filtering ─────────────────────────────────────────────────────────

export function filterTasks(
  tasks: StudentTask[],
  filters: {
    status?: TaskStatus | 'all'
    category?: string | 'all'
    priority?: string | 'all'
    searchTerm?: string
    createdBy?: string | 'all'
  }
): StudentTask[] {
  let filtered = tasks

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(t => getTaskStatus(t) === filters.status)
  }

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(t => t.category === filters.category)
  }

  if (filters.priority && filters.priority !== 'all') {
    filtered = filtered.filter(t => t.priority === filters.priority)
  }

  if (filters.createdBy && filters.createdBy !== 'all') {
    filtered = filtered.filter(t => t.createdBy === filters.createdBy)
  }

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase()
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term) ||
      t.tags?.some(tag => tag.toLowerCase().includes(term))
    )
  }

  return filtered
}

// ─── Task Sorting ───────────────────────────────────────────────────────────

export type SortOption = 'dueDate' | 'priority' | 'created' | 'status'

export function sortTasks(tasks: StudentTask[], sortBy: SortOption = 'dueDate'): StudentTask[] {
  const sorted = [...tasks]
  
  switch (sortBy) {
    case 'dueDate':
      return sorted.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    case 'priority':
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    case 'created':
      return sorted.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    case 'status':
      const statusOrder = { overdue: 0, in_progress: 1, pending: 2, submitted: 3, graded: 4, completed: 5, abandoned: 6 }
      return sorted.sort((a, b) => statusOrder[getTaskStatus(a)] - statusOrder[getTaskStatus(b)])
    default:
      return sorted
  }
}

// ─── Task Statistics ────────────────────────────────────────────────────────

export function calculateTaskStats(tasks: StudentTask[]) {
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'completed' || t.status === 'graded').length
  const overdue = tasks.filter(t => isOverdue(t)).length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const pending = tasks.filter(t => t.status === 'pending').length
  
  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0)
  const actualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)
  
  const avgQuality = tasks
    .filter(t => t.completionQuality !== undefined)
    .reduce((sum, t) => sum + (t.completionQuality || 0), 0) / 
    tasks.filter(t => t.completionQuality !== undefined).length || 0
  
  const avgLearning = tasks
    .filter(t => t.learningGain !== undefined)
    .reduce((sum, t) => sum + (t.learningGain || 0), 0) / 
    tasks.filter(t => t.learningGain !== undefined).length || 0

  return {
    total,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    overdue,
    inProgress,
    pending,
    totalHours,
    actualHours,
    engagementRate: totalHours > 0 ? Math.min(Math.round((actualHours / totalHours) * 100), 100) : 0,
    avgQuality: Math.round(avgQuality * 10) / 10,
    avgLearning: Math.round(avgLearning * 10) / 10,
  }
}

export function countByStatus(tasks: StudentTask[]): Record<TaskStatus, number> {
  return tasks.reduce((acc, task) => {
    const status = getTaskStatus(task)
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<TaskStatus, number>)
}

export function countByCategory(tasks: StudentTask[]): Record<string, number> {
  return tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

// ─── Task Scoring & Metrics ────────────────────────────────────────────────

export function calculateTaskCompletionScore(tasks: StudentTask[]): number {
  if (tasks.length === 0) return 0
  const completed = tasks.filter(t => t.status === 'completed' || t.status === 'graded').length
  return Math.round((completed / tasks.length) * 100)
}

export function calculateConsistencyScore(tasks: StudentTask[]): number {
  if (tasks.length === 0) return 0
  
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'graded')
  if (completedTasks.length === 0) return 0
  
  const onTime = completedTasks.filter(t => {
    const due = new Date(t.dueDate)
    const completed = new Date(t.completedDate || new Date())
    return completed <= due
  }).length
  
  return Math.round((onTime / completedTasks.length) * 100)
}

export function calculateEngagementScore(tasks: StudentTask[]): number {
  const totalEstimated = tasks.reduce((sum, t) => sum + t.estimatedHours, 0)
  const totalActual = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)
  
  if (totalEstimated === 0) return 0
  return Math.min(Math.round((totalActual / totalEstimated) * 100), 100)
}

export function calculateQualityScore(tasks: StudentTask[]): number {
  const withQuality = tasks.filter(t => t.completionQuality !== undefined)
  if (withQuality.length === 0) return 0
  
  const avg = withQuality.reduce((sum, t) => sum + (t.completionQuality || 0), 0) / withQuality.length
  return Math.round(avg * 20)  // Convert 1-5 to 0-100
}
