import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await signup(name, email, phone, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size={36} />
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h1 className="text-lg font-semibold text-text mb-1">Create your account</h1>
          <p className="text-sm text-text-muted mb-6">Join or start managing a chama</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-text-muted block mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Lyndah Ajiambo"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs text-text-muted block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs text-text-muted block mb-1.5">Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="0712345678"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs text-text-muted block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {error && (
              <p className="text-xs text-danger flex items-center gap-1.5">
                <AlertCircle size={13} />
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>

          <p className="text-xs text-text-muted text-center mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}