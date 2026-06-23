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
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories: TaskCategory[] = ['study', 'practice', 'project', 'reading', 'review', 'exam']
  const priorities: TaskPriority[] = ['low', 'medium', 'high']

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required'
    if (new Date(formData.dueDate) < new Date()) newErrors.dueDate = 'Due date must be in the future'
    if (formData.estimatedHours <= 0) newErrors.estimatedHours = 'Estimated hours must be greater than 0'

    if (taskType === 'complex' && (!formData.subtasks || formData.subtasks.length === 0)) {
      newErrors.subtasks = 'Complex tasks must have at least 1 subtask'
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
      createdBy: 'student',
      createdDate: defaultTask?.createdDate || new Date().toISOString(),
      dueDate: formData.dueDate,
      priority: formData.priority,
      status: defaultTask?.status || 'pending',
      estimatedHours: formData.estimatedHours,
      subjectIds: formData.subjectIds,
      tags: formData.tags,
      subtasks: taskType === 'complex' 
        ? formData.subtasks?.map((st, idx) => ({
            id: `subtask-${defaultTask?.id}-${idx}`,
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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto rounded-xl border bg-[var(--color-white)] p-6 space-y-6">
      <h2 className="text-xl font-bold text-[var(--color-text)]">
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </h2>

      {/* Task Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--color-text)]">Task Type</label>
        <div className="flex gap-4">
          {(['simple', 'complex'] as const).map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="taskType"
                value={type}
                checked={taskType === type}
                onChange={() => {
                  setTaskType(type)
                  setFormData(prev => ({ ...prev, type }))
                }}
                className="w-4 h-4"
              />
              <span className="text-sm capitalize text-[var(--color-text)]">
                {type === 'simple' ? 'Simple Task' : 'Complex Task (with subtasks)'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--color-text)]">Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className={`w-full rounded-lg border px-3 py-2 text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-[var(--color-border)]'
          }`}
          placeholder="Enter task title"
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--color-text)]">Description *</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className={`w-full rounded-lg border px-3 py-2 text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24 ${
            errors.description ? 'border-red-500' : 'border-[var(--color-border)]'
          }`}
          placeholder="Describe what needs to be done"
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
      </div>

      {/* Category & Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--color-text)]">Category</label>
          <select
            value={formData.category}
            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as TaskCategory }))}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--color-text)]">Priority</label>
          <select
            value={formData.priority}
            onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {priorities.map(pri => (
              <option key={pri} value={pri}>
                {pri.charAt(0).toUpperCase() + pri.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date & Estimated Hours */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--color-text)]">Due Date *</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            className={`w-full rounded-lg border px-3 py-2 text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dueDate ? 'border-red-500' : 'border-[var(--color-border)]'
            }`}
          />
          {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--color-text)]">Estimated Hours *</label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={formData.estimatedHours}
            onChange={e => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) }))}
            className={`w-full rounded-lg border px-3 py-2 text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.estimatedHours ? 'border-red-500' : 'border-[var(--color-border)]'
            }`}
          />
          {errors.estimatedHours && <p className="text-xs text-red-500">{errors.estimatedHours}</p>}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--color-text)]">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags?.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-blue-900 font-bold"
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
            className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add tag (press Enter)"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
          >
            Add
          </button>
        </div>
      </div>

      {/* Subtasks (for complex tasks) */}
      {taskType === 'complex' && (
        <div className="space-y-3 border-t pt-4">
          <h3 className="font-semibold text-[var(--color-text)]">Subtasks</h3>
          
          {errors.subtasks && <p className="text-xs text-red-500">{errors.subtasks}</p>}

          {/* Subtasks List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {formData.subtasks?.map((subtask, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{subtask.title}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{subtask.estimatedHours}h estimated</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSubtask(idx)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask */}
          <div className="space-y-2 border-t pt-2">
            <input
              type="text"
              value={newSubtask.title}
              onChange={e => setNewSubtask(prev => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Subtask title"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={newSubtask.estimatedHours}
                onChange={e => setNewSubtask(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) }))}
                className="w-24 rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-text)] bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hours"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              >
                + Add Subtask
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 justify-end border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {isEditing ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}
