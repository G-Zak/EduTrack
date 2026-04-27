export interface Lesson {
  id: string
  title: string
  duration: string
  content: string
}

export interface Chapter {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Module {
  id: string
  title: string
  description: string
  chapters: Chapter[]
  color: string
}

export interface UserProfile {
  name: string
  initials: string
  track: string
  startDate: string
}

export interface ProgressState {
  completedLessons: string[]   // lesson ids
  lastSeenLesson: string | null
}