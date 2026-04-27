import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/shared/Sidebar'
import Dashboard from './pages/Dashboard'
import Modules from './pages/Modules'
import Profil from './pages/Profil'
import { profile } from './data/mockData'

export default function App() {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <Sidebar />
      <div className="ml-[220px] flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-white)] px-8">
          <div className="text-[var(--text-sm)] font-semibold text-[var(--color-primary)]">Student Tracker</div>
          <div className="rounded-full bg-[var(--color-gray-bg)] px-3 py-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
            {today}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--text-xs)] font-semibold text-white">
              {profile.initials}
            </div>
            <span className="text-[var(--text-sm)] text-[var(--color-text)]">{profile.name}</span>
          </div>
        </header>
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/profil" element={<Profil />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}