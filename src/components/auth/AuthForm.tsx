import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

type Mode = 'signin' | 'signup'

export default function AuthForm() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    let result: { error: string | null }
    if (mode === 'signup') {
      if (!name.trim()) { setError('Le nom est requis'); setLoading(false); return }
      result = await signUp(email, password, name)
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
                className={`flex-1 rounded-lg py-2 text-[var(--text-sm)] font-medium transition-all ${
                  mode === m
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
              <div className="text-4xl mb-3">✅</div>
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
                <div>
                  <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] mb-1">Nom complet</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Abdessamad Abounouh"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              )}
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
