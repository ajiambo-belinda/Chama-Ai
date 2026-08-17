import { useState, useEffect } from 'react'
import { Coins, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useChama } from '../context/ChamaContext'
import { useAuth } from '../context/AuthContext'
import { previewDividendAPI, declareDividendAPI, fetchDividendHistory } from '../api/dividends'

export default function Dividends() {
  const { user } = useAuth()
  const { activeGroup } = useChama()

  const isTreasurer = activeGroup && (activeGroup.treasurer?._id === user._id || activeGroup.treasurer === user._id)

  const [preview, setPreview] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [declaring, setDeclaring] = useState(false)
  const [message, setMessage] = useState('')
  const [period, setPeriod] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    if (!activeGroup) return
    setLoading(true)
    Promise.all([previewDividendAPI(activeGroup._id), fetchDividendHistory(activeGroup._id)])
      .then(([previewData, historyData]) => {
        setPreview(previewData)
        setHistory(historyData)
      })
      .finally(() => setLoading(false))
  }, [activeGroup])

  async function handleDeclare() {
    setDeclaring(true)
    setMessage('')
    try {
      await declareDividendAPI(activeGroup._id, period)
      const [previewData, historyData] = await Promise.all([
        previewDividendAPI(activeGroup._id),
        fetchDividendHistory(activeGroup._id),
      ])
      setPreview(previewData)
      setHistory(historyData)
      setMessage('Dividend declared and credited to member savings.')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to declare dividend.')
    } finally {
      setDeclaring(false)
    }
  }

  if (!activeGroup) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted">
        No active group — create or select a group first.
      </div>
    )
  }

  if (loading) {
    return <div className="text-sm text-text-muted">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
          <Coins size={18} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text">Dividends</h1>
          <p className="text-sm text-text-muted mt-0.5">{activeGroup.name}</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-text">Available profit</h2>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <TrendingUp size={12} />
            From interest earned on cleared/repaid loans
          </span>
        </div>

        <p className="text-2xl font-mono font-semibold text-text mb-4">
          KES {(preview?.totalProfit || 0).toLocaleString()}
        </p>

        {preview?.totalProfit > 0 ? (
          <>
            <p className="text-xs text-text-muted mb-3">
              Split proportionally by each member's savings (KES {preview.totalSavings.toLocaleString()} total group savings):
            </p>
            <div className="border border-border rounded-lg divide-y divide-border mb-4">
              {preview.breakdown.map((b, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-sm text-text">{b.name}</span>
                  <span className="text-sm font-mono text-accent">+KES {b.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {isTreasurer && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="e.g. 2026 or Q1 2026"
                  className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary w-40"
                />
                <Button onClick={handleDeclare} disabled={declaring} className="gap-2">
                  <Coins size={16} />
                  {declaring ? 'Declaring...' : 'Declare Dividend'}
                </Button>
              </div>
            )}
            {message && (
              <p className={`text-xs mt-2 flex items-center gap-1.5 ${message.includes('declared') ? 'text-success' : 'text-danger'}`}>
                {message.includes('declared') ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                {message}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-text-muted">
            No profit available yet — dividends are generated from interest earned once loans are repaid beyond their principal.
          </p>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-text">Dividend history</h2>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">No dividends declared yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {history.map((d) => (
              <div key={d._id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text">{d.period}</span>
                  <span className="text-sm font-mono text-text">KES {d.totalProfit.toLocaleString()}</span>
                </div>
                <p className="text-xs text-text-muted">
                  Declared {new Date(d.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })} · Split among {d.breakdown.length} members
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}