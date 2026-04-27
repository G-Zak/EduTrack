import { NavLink } from 'react-router-dom'
import { profile } from '../../data/mockData'

const links = [
  { to: '/',            label: 'Dashboard' },
  { to: '/modules',     label: 'Mes modules' },
  { to: '/profil',      label: 'Mon profil' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[220px] flex-shrink-0 flex-col border-r border-white/10 bg-[var(--color-primary)] text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="text-[var(--text-xl)] font-bold">EduTrack</div>
        <div className="mt-1 text-[var(--text-xs)] text-white/70">mon espace d'apprentissage</div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center border-l-4 px-5 py-3 text-[var(--text-sm)] transition-colors ${
                isActive
                  ? 'border-l-white bg-white/15 font-semibold text-white'
                  : 'border-l-transparent text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[var(--text-xs)] font-semibold">
            {profile.initials}
          </div>
          <div>
            <div className="text-[var(--text-xs)] font-medium text-white">{profile.name.split(' ')[0]}</div>
            <div className="text-[var(--text-xs)] text-white/70">Étudiant</div>
          </div>
        </div>
        <div>
          <div className="mt-3 text-[var(--text-xs)] text-white/60">EduTrack v1.0</div>
        </div>
      </div>
    </aside>
  )
}