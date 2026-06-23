/**
 * Task Management Types
 * Complete type definitions for task creation, management, and tracking
 */

export type TaskType = 'simple' | 'complex'
export type TaskCategory = 'study' | 'practice' | 'project' | 'reading' | 'review' | 'exam'
export type TaskCreatedBy = 'student' | 'teacher' | 'system'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'in_progress' | 'submitted' | 'graded' | 'overdue' | 'completed' | 'abandoned'
export type SelfAssessment = 1 | 2 | 3 | 4 | 5

/**
 * Subtask for complex tasks
 */
export interface Subtask {
  id: string
  taskId: string
  title: string
  description?: string
  estimatedHours: number
  dueDate?: string
  status: 'pending' | 'in_progress' | 'completed'
  completedDate?: string
  notes?: string
}

/**
 * Student-created simple task
 */
export interface StudentTask {
  id: string
  studentId: string
  type: TaskType
  title: string
  description: string
  category: TaskCategory
  createdBy: TaskCreatedBy
  createdDate: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  
  // Estimation & Tracking
  estimatedHours: number
  actualHours?: number
  
  // Subjects/Tags
  subjectIds: string[]
  tags?: string[]
  
  // Workflow dates
  startedDate?: string
  submittedDate?: string
  completedDate?: string
  
  // Self-assessment (post-completion)
  completionQuality?: SelfAssessment  // 1-5 self-rating
  learningGain?: SelfAssessment       // 1-5 before→after learning
  
  // Teacher feedback (for teacher-assigned tasks)
  grade?: number
  teacherFeedback?: string
  
  // Notes & attachments
  notes?: string
  attachmentUrls?: string[]
  
  // Complex task subtasks
  subtasks?: Subtask[]
}

/**
 * Progress score components based on tasks
 */
export interface TaskProgressMetrics {
  studentId: string
  periodStart: string
  periodEnd: string
  
  // Task-based metrics
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  completionRate: number  // %
  
  onTimeTasks: number
  consistencyScore: number  // %
  
  totalEstimatedHours: number
  totalActualHours: number
  engagementScore: number  // actual vs estimated
  
  avgCompletionQuality: number  // 1-5
  avgLearningGain: number        // 1-5
  
  totalByCategory: Record<TaskCategory, number>
  completedByCategory: Record<TaskCategory, number>
}

/**
 * Task creation form data
 */
export interface TaskFormData {
  title: string
  description: string
  category: TaskCategory
  dueDate: string
  priority: TaskPriority
  estimatedHours: number
  type: TaskType
  subjectIds: string[]
  tags?: string[]
  subtasks?: Omit<Subtask, 'id' | 'taskId' | 'completedDate' | 'status'>[]
}

/**
 * Task filter options
 */
export interface TaskFilterOptions {
  status?: TaskStatus | 'all'
  category?: TaskCategory | 'all'
  priority?: TaskPriority | 'all'
  daysLeft?: number  // show only tasks due in X days
  createdBy?: TaskCreatedBy | 'all'
  searchTerm?: string
}
