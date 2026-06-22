# Taiga Backlog: Statistics & Dashboard (Performances & Absences)

Below are user stories, tasks, acceptance criteria, and suggested estimates to copy into Taiga.

---

## Epic: Student Statistics & Dashboard
Goal: Provide student and class performance insights and absence reporting for teachers, students, and admins.

---

### User Story 1: View personal performance dashboard
- As a student, I want to see my current average, subject breakdown, and performance trend so I can track progress.
- Priority: High
- Estimate: 5

Tasks:
- Create mock data for a sample student (Dev)
- Implement computeStudentAverage service (Dev)
- Implement useStudentStats hook (Dev)
- Build StudentPerformanceCard component (UI)
- Build PerformanceChart (Recharts)
- Add route /statistics/me and container

Acceptance Criteria:
- Student can open /statistics/me and see current average, subject list, and a trend chart
- Data uses mock adapter
- Unit tests cover computeStudentAverage

---

### User Story 2: View class-level statistics
- As a teacher, I want to view class averages, top/bottom performers, and grade distribution.
- Priority: High
- Estimate: 8

Tasks:
- Implement fetchClassGrades in adapter (Dev)
- Implement computeClassAverage and gradeDistribution services (Dev)
- Build ClassOverviewDashboard container & components (UI)
- Add class filters and date-range selector

Acceptance Criteria:
- Teacher can view class average and a list of top 5 and bottom 5 students
- Grade distribution chart displays buckets (A-F)
- Hook supports date range

---

### User Story 3: Track and report absences
- As a teacher/admin, I want to see student absence history and class absence patterns.
- Priority: Medium
- Estimate: 5

Tasks:
- Create Absence model & mock data
- Implement fetchAbsences adapter method (Dev)
- Implement aggregateAbsences service (Dev)
- Build AbsenceCard, AbsenceChart, AbsenceTable components (UI)

Acceptance Criteria:
- Absence timeline and summary KPIs are visible
- Can filter by justified/unjustified

---

### User Story 4: Adapter abstraction & mock implementation
- As a developer, I want a single adapter interface so backends can be swapped easily.
- Priority: High
- Estimate: 3

Tasks:
- Define adapter interface (fetchGrades, fetchAbsences, fetchClassGrades, optional watch)
- Implement mockAdapter using JSON files and msw for dev
- Document adapter usage in README

Acceptance Criteria:
- Switching adapter requires changing only the composition root import
- mockAdapter returns realistic sample data

---

### User Story 5: Unit tests for services
- As a developer, I want services to be unit tested to ensure correctness.
- Priority: High
- Estimate: 3

Tasks:
- Add tests for computeStudentAverage, computeClassAverage, gradeDistribution, detectTrend
- Configure test runner (Vitest/Jest)

Acceptance Criteria:
- Services have tests with >80% branch coverage

---

### User Story 6: Charts & export
- As a teacher, I want to export performance and absence reports as CSV.
- Priority: Medium
- Estimate: 5

Tasks:
- Add CSV export utility in services
- Add Export button to dashboards
- Implement client-side CSV generation and download

Acceptance Criteria:
- Exported CSV contains the expected columns and rows matching filters

---

### User Story 7: Role-based access (frontend gating)
- As an admin, I want role-based views so users see only allowed data.
- Priority: Medium
- Estimate: 3

Tasks:
- Add role checks in route containers
- Show/hide UI elements appropriately

Acceptance Criteria:
- Students cannot access class-level dashboards
- Teachers can access their classes only (mock enforcement)

---

## Labels and Tags
- component: adapter, service, hook, ui, tests, docs
- priority: high, medium, low

---

## How to import
Copy each User Story into Taiga as a User Story under the "Student Statistics & Dashboard" epic. Add tasks as sub-tasks and estimates as story points. Use labels to tag component and priority.
