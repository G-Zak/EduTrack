import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { absences, subjects } from '../data/mockData'

const TOTAL_SCHOOL_DAYS = 120 // approximate semester days

function countDays(abs: typeof absences) {
  return abs.reduce((s, a) => s + (a.duration === 'full' ? 1 : 0.5), 0)
}

function buildMonthlyData() {
  const byMonth: Record<string, { excused: number; unexcused: number }> = {}
  absences.forEach(a => {
    const month = a.date.slice(0, 7)
    if (!byMonth[month]) byMonth[month] = { excused: 0, unexcused: 0 }
    const val = a.duration === 'full' ? 1 : 0.5
    if (a.excused) byMonth[month].excused += val
    else byMonth[month].unexcused += val
  })
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      Excusé: data.excused,
      'Non excusé': data.unexcused,
    }))
}

export default function AbsencesPage() {
  const totalDays = countDays(absences)
  const excusedDays = countDays(absences.filter(a => a.excused))
  const unexcusedDays = countDays(absences.filter(a => !a.excused))
  const absenceRate = +((totalDays / TOTAL_SCHOOL_DAYS) * 100).toFixed(1)
  const monthlyData = buildMonthlyData()

  const rateColor =
    absenceRate > 15 ? 'text-red-500' :
    absenceRate > 8  ? 'text-amber-500' :
    'text-green-600'

  const sorted = [...absences].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text)]">📍 Suivi des Absences</h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Historique et statistiques de présence.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
          <div className="text-[var(--text-xs)] text-[var(--color-text-secondary)] uppercase tracking-wider">Taux d'absence</div>
          <div className={`mt-2 text-4xl font-bold ${rateColor}`}>{absenceRate}%</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">sur {TOTAL_SCHOOL_DAYS} jours</div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--color-gray-bg)]">
            <div className={`h-1.5 rounded-full ${absenceRate > 15 ? 'bg-red-400' : absenceRate > 8 ? 'bg-amber-400' : 'bg-green-500'}`}
              style={{ width: `${Math.min(absenceRate, 100)}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-5">
          <div className="text-[var(--text-xs)] text-[var(--color-text-secondary)] uppercase tracking-wider">Jours totaux</div>
          <div className="mt-2 text-4xl font-bold text-[var(--color-text)]">{totalDays}</div>
          <div className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{absences.length} entrées</div>
        </div>

        <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
          <div className="text-[var(--text-xs)] text-green-700 font-medium uppercase tracking-wider">Excusées</div>
          <div className="mt-2 text-4xl font-bold text-green-700">{excusedDays}j</div>
          <div className="mt-1 text-[var(--text-xs)] text-green-600">{absences.filter(a => a.excused).length} absences</div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <div className="text-[var(--text-xs)] text-red-700 font-medium uppercase tracking-wider">Non excusées</div>
          <div className="mt-2 text-4xl font-bold text-red-500">{unexcusedDays}j</div>
          <div className="mt-1 text-[var(--text-xs)] text-red-500">{absences.filter(a => !a.excused).length} absences</div>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6">
        <h2 className="mb-6 text-[var(--text-base)] font-semibold text-[var(--color-text)]">Absences par mois</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
              formatter={(v: number) => [`${v}j`]}
            />
            <Bar dataKey="Excusé" stackId="a" fill="#86efac" radius={[0, 0, 4, 4]} />
            <Bar dataKey="Non excusé" stackId="a" fill="#fca5a5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex gap-4 justify-center text-[var(--text-xs)]">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-green-300 inline-block" />Excusées</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-300 inline-block" />Non excusées</span>
        </div>
      </div>

      {/* Absence list */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">Historique des absences</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[var(--text-sm)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-gray-bg)]">
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Durée</th>
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Matière</th>
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Raison</th>
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Certificat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {sorted.map(a => {
                const subj = subjects.find(s => s.id === a.subjectId)
                return (
                  <tr key={a.id} className="hover:bg-[var(--color-gray-bg)] transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-[var(--color-text-secondary)]">
                      {new Date(a.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[var(--text-xs)] font-medium ${
                        a.duration === 'full' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {a.duration === 'full' ? 'Journée complète' : 'Demi-journée'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {subj ? (
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: subj.color }} />
                          <span className="text-[var(--color-text)]">{subj.name}</span>
                        </div>
                      ) : <span className="text-[var(--color-text-secondary)]">—</span>}
                    </td>
                    <td className="px-6 py-3 text-[var(--color-text)]">{a.reason ?? '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[var(--text-xs)] font-medium ${
                        a.excused ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {a.excused ? '✓ Excusée' : '✗ Non excusée'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {a.certificateProvided
                        ? <span className="text-[var(--text-xs)] text-green-600 font-medium">✓ Fourni</span>
                        : <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">—</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
