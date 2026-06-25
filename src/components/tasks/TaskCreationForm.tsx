import { useState } from 'react'
import type { StudentTask, TaskFormData, TaskType, TaskCategory, TaskPriority } from '../../types/task'

interface TaskCreationFormProps {
  studentId: string
  onTaskCreated: (task: StudentTask) => void
  onCancel: () => void
  defaultTask?: StudentTask | null
  isEditing?: boolean
}

export default function TaskCreationForm({
  studentId,
  onTaskCreated,
  onCancel,
  defaultTask,
  isEditing = false,
}: TaskCreationFormProps) {
  const [taskType, setTaskType] = useState<TaskType>(defaultTask?.type || 'simple')
  const [formData, setFormData] = useState<TaskFormData>({
    title: defaultTask?.title || '',
    description: defaultTask?.description || '',
    category: defaultTask?.category || 'study',
    dueDate: defaultTask?.dueDate || '',
    priority: defaultTask?.priority || 'medium',
    estimatedHours: defaultTask?.estimatedHours || 1,
    type: defaultTask?.type || 'simple',
    subjectIds: defaultTask?.subjectIds || [],
    tags: defaultTask?.tags || [],
    subtasks: defaultTask?.subtasks?.map(s => ({
      title: s.title,
      description: s.description,
      estimatedHours: s.estimatedHours,
      dueDate: s.dueDate,
    })) || [],
  })

  const [newSubtask, setNewSubtask] = useState({ title: '', estimatedHours: 1 })
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories: { value: TaskCategory; label: string }[] = [
    { value: 'study', label: 'Étude / Cours' },
    { value: 'practice', label: 'TP / Pratique' },
    { value: 'project', label: 'Projet' },
    { value: 'reading', label: 'Lecture' },
    { value: 'review', label: 'Révision' },
    { value: 'exam', label: 'Examen' },
  ]

  const priorities: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Basse' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Haute' },
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Le titre est requis'
    if (!formData.description.trim()) newErrors.description = 'La description est requise'
    if (!formData.dueDate) newErrors.dueDate = "La date d'échéance est requise"
    if (new Date(formData.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
      newErrors.dueDate = "La date d'échéance ne peut pas être passée"
    }
    if (formData.estimatedHours <= 0) newErrors.estimatedHours = 'Les heures estimées doivent être supérieures à 0'

    if (taskType === 'complex' && (!formData.subtasks || formData.subtasks.length === 0)) {
      newErrors.subtasks = 'Un devoir complexe doit avoir au moins 1 sous-tâche'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const task: StudentTask = {
      id: defaultTask?.id || `task-${Date.now()}`,
      studentId,
      type: taskType,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      createdBy: 'teacher', // Usually created by teacher in teacher view
      createdDate: defaultTask?.createdDate || new Date().toISOString(),
      dueDate: formData.dueDate,
      priority: formData.priority,
      status: defaultTask?.status || 'pending',
      estimatedHours: formData.estimatedHours,
      subjectIds: formData.subjectIds,
      tags: formData.tags,
      subtasks: taskType === 'complex' 
        ? formData.subtasks?.map((st, idx) => ({
            id: `subtask-${defaultTask?.id || 'new'}-${idx}-${Date.now()}`,
            taskId: defaultTask?.id || `task-${Date.now()}`,
            title: st.title,
            description: st.description,
            estimatedHours: st.estimatedHours,
            dueDate: st.dueDate,
            status: 'pending' as const,
          }))
        : undefined,
    }

    onTaskCreated(task)
  }

  const addSubtask = () => {
    if (!newSubtask.title.trim()) return

    setFormData(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), { title: newSubtask.title, estimatedHours: newSubtask.estimatedHours }],
    }))
    setNewSubtask({ title: '', estimatedHours: 1 })
  }

  const removeSubtask = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks?.filter((_, i) => i !== idx),
    }))
  }

  const addTag = () => {
    if (!tagInput.trim()) return

    const newTag = tagInput.trim().toLowerCase()
    if (!formData.tags?.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag],
      }))
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 sm:p-6 space-y-5 shadow-lg max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text)]">
        {isEditing ? 'Modifier le Devoir' : 'Créer un Nouveau Devoir'}
      </h2>

      {/* Task Type Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Type de devoir</label>
        <div className="flex flex-col sm:flex-row gap-3">
          {(['simple', 'complex'] as const).map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-gray-bg)] flex-1 transition-colors">
              <input
                type="radio"
                name="taskType"
                value={type}
                checked={taskType === type}
                onChange={() => {
                  setTaskType(type)
                  setFormData(prev => ({ ...prev, type }))
                }}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs sm:text-sm font-medium text-[var(--color-text)]">
                {type === 'simple' ? 'Devoir Simple' : 'Devoir Complexe (avec sous-tâches)'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Titre *</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className={`w-full rounded-xl border px-3 py-2 text-sm text-[var(--color-text)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-[var(--color-border)]'
          }`}
          placeholder="Ex. TP Graphes, Rapport de stage"
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Description *</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className={`w-full rounded-xl border px-3 py-2 text-sm text-[var(--color-text)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20 sm:min-h-24 ${
            errors.description ? 'border-red-500' : 'border-[var(--color-border)]'
          }`}
          placeholder="Décrire le travail demandé..."
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
      </div>

      {/* Category & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Catégorie</label>
          <select
            value={formData.category}
            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as TaskCategory }))}
            className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Priorité</label>
          <select
            value={formData.priority}
            onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
            className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {priorities.map(pri => (
              <option key={pri.value} value={pri.value}>
                {pri.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date & Estimated Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Date d'échéance *</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            className={`w-full rounded-xl border px-3 py-2 text-sm text-[var(--color-text)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dueDate ? 'border-red-500' : 'border-[var(--color-border)]'
            }`}
          />
          {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Heures Estimées *</label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={formData.estimatedHours}
            onChange={e => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) }))}
            className={`w-full rounded-xl border px-3 py-2 text-sm text-[var(--color-text)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.estimatedHours ? 'border-red-500' : 'border-[var(--color-border)]'
            }`}
          />
          {errors.estimatedHours && <p className="text-xs text-red-500">{errors.estimatedHours}</p>}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Tags / Mots-clés</label>
        <div className="flex flex-wrap gap-1.5 mb-1">
          {formData.tags?.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-blue-950 font-bold"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ajouter un mot-clé (Entrée)"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-semibold"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Subtasks (for complex tasks) */}
      {taskType === 'complex' && (
        <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Sous-tâches</h3>
          
          {errors.subtasks && <p className="text-xs text-red-500">{errors.subtasks}</p>}

          {/* Subtasks List */}
          {formData.subtasks && formData.subtasks.length > 0 && (
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {formData.subtasks.map((subtask, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2.5 bg-[var(--color-gray-bg)] rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-[var(--color-text)] truncate">{subtask.title}</p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">{subtask.estimatedHours}h estimées</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSubtask(idx)}
                    className="text-red-500 hover:text-red-700 font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Subtask */}
          <div className="space-y-2 border-t border-[var(--color-border)] pt-2">
            <input
              type="text"
              value={newSubtask.title}
              onChange={e => setNewSubtask(prev => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Titre de la sous-tâche"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={newSubtask.estimatedHours}
                onChange={e => setNewSubtask(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) }))}
                className="w-24 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Heures"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors text-sm font-semibold"
              >
                + Ajouter sous-tâche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 justify-end border-t border-[var(--color-border)] pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] hover:bg-[var(--color-gray-bg)] transition-colors font-semibold"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm shadow-md"
        >
          {isEditing ? 'Mettre à jour' : 'Créer le Devoir'}
        </button>
      </div>
    </form>
  )
}
