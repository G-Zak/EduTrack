import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { mockGroups } from '../../data/mockData'

type Mode = 'signin' | 'signup'

export default function AuthForm() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [groupId, setGroupId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Supabase: fetch real groups; demo: use mockGroups
  const [availableGroups, setAvailableGroups] = useState<{ id: string; name: string }[]>(mockGroups)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const sorted = [...mockGroups].sort((a, b) => {
        const numA = parseInt(a.name.replace(/\D/g, ''), 10)
        const numB = parseInt(b.name.replace(/\D/g, ''), 10)
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB
        return a.name.localeCompare(b.name)
      })
      setAvailableGroups(sorted)
      return
    }
    supabase.from('groups').select('id, name').order('name').then(({ data }) => {
      if (data && data.length > 0) {
        const sorted = [...data].sort((a, b) => {
          const numA = parseInt(a.name.replace(/\D/g, ''), 10)
          const numB = parseInt(b.name.replace(/\D/g, ''), 10)
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB
          return a.name.localeCompare(b.name)
        })
        setAvailableGroups(sorted)
      }
    })
  }, [])

  // Pre-select first group when role is student
  useEffect(() => {
    if (role === 'student' && availableGroups.length > 0) {
      const exists = availableGroups.some(g => g.id === groupId)
      if (!groupId || !exists) {
        setGroupId(availableGroups[0].id)
      }
    }
    if (role === 'teacher') setGroupId('')
  }, [role, availableGroups, groupId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    let result: { error: string | null }
    if (mode === 'signup') {
      if (!name.trim()) { setError('Le nom est requis'); setLoading(false); return }
      if (role === 'student' && !groupId) { setError('Veuillez sélectionner un groupe'); setLoading(false); return }
      result = await signUp(email, password, name, role, role === 'student' ? groupId : undefined)
      if (!result.error) setSuccess(true)
    } else {
      result = await signIn(email, password)
    }

    if (result.error) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] mb-4">
            <span className="text-2xl text-white font-bold">E</span>
          </div>
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text)]">EduTrack</h1>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">Votre espace académique personnel</p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-8 shadow-sm">
          {/* Tabs */}
          <div className="flex rounded-xl bg-[var(--color-gray-bg)] p-1 mb-6">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className={`flex-1 rounded-lg py-2 text-[var(--text-sm)] font-medium transition-all ${mode === m
                    ? 'bg-[var(--color-white)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                  }`}
              >
                {m === 'signin' ? 'Se connecter' : "S'inscrire"}
              </button>
            ))}
          </div>

          {success ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center h-14 w-14 mx-auto mb-4 rounded-full bg-green-100">
                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--color-text)] mb-1">Compte créé !</h3>
              <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                Vérifiez votre email pour confirmer votre compte, puis connectez-vous.
              </p>
              <button onClick={() => { setMode('signin'); setSuccess(false) }} className="mt-4 text-[var(--text-sm)] text-[var(--color-primary)] hover:underline">
                Se connecter
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  {/* Full name */}
                  <div>
                    <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-1">Nom complet</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>

                  {/* Role selector — card style */}
                  <div>
                    <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-2">Rôle</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { value: 'student' as const, label: 'Étudiant', desc: 'Suivi personnel', icon: 'M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zm0-3a3 3 0 100-6 3 3 0 000 6z' },
                        { value: 'teacher' as const, label: 'Enseignant', desc: 'Gestion de classe', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                      ]).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRole(opt.value)}
                          className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all ${role === opt.value
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40'
                            }`}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={opt.icon} />
                          </svg>
                          <span className="text-xs font-semibold">{opt.label}</span>
                          <span className="text-[10px] opacity-70">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group selector — students only */}
                  {role === 'student' && (
                    <div>
                      <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-1">Groupe / Classe</label>
                      <select
                        value={groupId}
                        onChange={e => setGroupId(e.target.value)}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      >
                        <option value="" disabled>Sélectionnez votre groupe / classe</option>
                        {availableGroups.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="email@exemple.com"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[var(--text-xs)] text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[var(--color-primary)] py-2.5 text-[var(--text-sm)] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? 'Chargement...' : mode === 'signin' ? 'Se connecter' : 'Créer un compte'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
