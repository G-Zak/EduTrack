import { useState, useEffect } from 'react'
import TaskCreationForm from '../components/tasks/TaskCreationForm'
import TaskCard from '../components/tasks/TaskCard'
import type { StudentTask, TaskStatus, TaskCategory, TaskPriority } from '../types/task'
import {
  getStudentTasks,
  saveStudentTasks,
  sortTasks,
  filterTasks,
  calculateTaskStats,
  countByStatus,
} from '../utils/taskUtils'

export default function TasksPage() {
  // Mock student ID (in production, get from auth context)
  const studentId = 'student-1'

  const [tasks, setTasks] = useState<StudentTask[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<StudentTask | null>(null)

  // Filter & Sort states
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('dueDate')

  // Load tasks from localStorage
  useEffect(() => {
    const stored = getStudentTasks(studentId)
    setTasks(stored)
  }, [])

  // Filter & sort tasks
  const filteredTasks = filterTasks(tasks, {
    status: filterStatus,
    category: filterCategory,
    priority: filterPriority,
    searchTerm,
  })

  const sortedTasks = sortTasks(filteredTasks, sortBy)
  const stats = calculateTaskStats(tasks)
  const statusCounts = countByStatus(tasks)

  const handleTaskCreated = (task: StudentTask) => {
    if (editingTask) {
      const updated = tasks.map(t => (t.id === editingTask.id ? task : t))
      setTasks(updated)
      saveStudentTasks(studentId, updated)
      setEditingTask(null)
    } else {
      const newTasks = [...tasks, task]
      setTasks(newTasks)
      saveStudentTasks(studentId, newTasks)
    }
    setShowForm(false)
  }

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const completedDate = newStatus === 'completed' || newStatus === 'graded' ? new Date().toISOString() : t.completedDate
        return { ...t, status: newStatus, completedDate }
      }
      return t
    })
    setTasks(updated)
    saveStudentTasks(studentId, updated)
  }

  const handleEditTask = (task: StudentTask) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId)
    setTasks(updated)
    saveStudentTasks(studentId, updated)
  }

  const handleAssessment = (taskId: string, quality: number, learning: number) => {
    const updated = tasks.map(t =>
      t.id === taskId
        ? { ...t, completionQuality: quality as 1 | 2 | 3 | 4 | 5, learningGain: learning as 1 | 2 | 3 | 4 | 5 }
        : t
    )
    setTasks(updated)
    saveStudentTasks(studentId, updated)
  }

  const resetFilters = () => {
    setFilterStatus('all')
    setFilterCategory('all')
    setFilterPriority('all')
    setSearchTerm('')
    setSortBy('dueDate')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">📝 Mes Tâches</h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">Créez et suivez vos tâches personnelles</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingTask(null)
              setShowForm(true)
            }}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Nouvelle Tâche
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-[var(--color-white)] rounded-xl p-6 max-w-2xl w-full my-8">
            <TaskCreationForm
              studentId={studentId}
              onTaskCreated={handleTaskCreated}
              onCancel={() => {
                setShowForm(false)
                setEditingTask(null)
              }}
              defaultTask={editingTask}
              isEditing={!!editingTask}
            />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-lg bg-[var(--color-white)] border border-[var(--color-border)] p-3">
          <p className="text-xs text-[var(--color-text-secondary)] font-medium">Total</p>
          <p className="text-2xl font-bold text-[var(--color-text)]">{stats.total}</p>
        </div>
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-xs text-blue-700 font-medium">En cours</p>
          <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
        </div>
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-xs text-green-700 font-medium">Complétées</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-xs text-red-700 font-medium">En retard</p>
          <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
        </div>
        <div className="rounded-lg bg-purple-50 border border-purple-200 p-3">
          <p className="text-xs text-purple-700 font-medium">Complétion</p>
          <p className="text-2xl font-bold text-purple-700">{stats.completionRate}%</p>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs text-amber-700 font-medium">Temps</p>
          <p className="text-2xl font-bold text-amber-700">{stats.engagementRate}%</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-4 bg-[var(--color-white)] border border-[var(--color-border)] rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <h3 className="font-semibold text-[var(--color-text)]">Filtres</h3>
          {(filterStatus !== 'all' || filterCategory !== 'all' || filterPriority !== 'all' || searchTerm) && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:underline"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Rechercher une tâche..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Statut</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as TaskStatus | 'all')}
              className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-xs text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="pending">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="submitted">Soumis</option>
              <option value="completed">Complété</option>
              <option value="overdue">En retard</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Catégorie</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value as TaskCategory | 'all')}
              className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-xs text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="study">Étude</option>
              <option value="practice">Pratique</option>
              <option value="project">Projet</option>
              <option value="reading">Lecture</option>
              <option value="review">Révision</option>
              <option value="exam">Examen</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Priorité</label>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value as TaskPriority | 'all')}
              className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-xs text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Trier par</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'dueDate' | 'priority' | 'status')}
              className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-xs text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dueDate">Échéance</option>
              <option value="priority">Priorité</option>
              <option value="status">Statut</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.length > 0 ? (
          sortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onAssessment={handleAssessment}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center text-[var(--color-text-secondary)]">
            <p className="text-lg font-medium mb-1">Aucune tâche trouvée</p>
            <p className="text-sm">
              {filterStatus !== 'all' || filterCategory !== 'all' || filterPriority !== 'all' || searchTerm
                ? 'Essayez de modifier vos filtres'
                : 'Créez votre première tâche!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
