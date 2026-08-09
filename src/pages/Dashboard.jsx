import { Link } from 'react-router-dom'
import { Sparkles, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { getGreeting } from '../lib/greeting'
import ContributionRing from '../components/ContributionRing'
import { useChama } from '../context/ChamaContext'

export default function Dashboard() {
  const greeting = getGreeting()
  const { activeGroup, loans, contributions } = useChama()

  if (!activeGroup) {
    return (
      <div className="space-y-7">
        <div>
          <h1 className="text-2xl font-semibold text-text">{greeting}, Lyndah</h1>
        </div>
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted">
          No active group yet — head to Groups to create or join one.
        </div>
      </div>
    )
  }

  const groupMembers = activeGroup.members
  const groupBalance = groupMembers.reduce((sum, m) => sum + m.savings, 0)

  const activeLoans = loans.filter((l) => l.status === 'active' || l.status === 'at-risk')
  const activeLoanTotal = activeLoans.reduce((sum, l) => sum + l.principal, 0)

  const cycleTarget = groupMembers.length * 5000
  const cycleCollected = contributions
    .filter((c) => c.status === 'confirmed')
    .reduce((sum, c) => sum + c.amount, 0)
  const cyclePercent = cycleTarget ? Math.min(Math.round((cycleCollected / cycleTarget) * 100), 100) : 0

  const atRiskLoan = loans.find((l) => l.status === 'at-risk')

  const memberStatus = groupMembers.map((member) => {
    const memberContributions = contributions.filter((c) => c.member?._id === member._id)
    const hasConfirmedThisCycle = memberContributions.some((c) => c.status === 'confirmed')
    const hasPending = memberContributions.some((c) => c.status === 'pending')
    const memberLoan = loans.find(
      (l) => l.member._id === member._id && (l.status === 'at-risk' || l.status === 'defaulted')
    )

    let percent = 0
    let tone = 'primary'
    let status = 'No contribution yet'

    if (memberLoan) {
      percent = 40
      tone = 'danger'
      status = memberLoan.status === 'defaulted' ? 'Defaulted' : 'Behind on loan'
    } else if (hasConfirmedThisCycle) {
      percent = 100
      tone = 'success'
      status = 'Paid this cycle'
    } else if (hasPending) {
      percent = 60
      tone = 'warning'
      status = 'Payment pending'
    }

    return { name: member.name, percent, tone, status }
  })

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm text-text-muted font-mono">{activeGroup.name}</p>
        <h1 className="text-2xl font-semibold text-text mt-1">{greeting}, Lyndah</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted">Group balance</p>
          <p className="text-xl font-mono font-semibold text-text mt-2">KES {groupBalance.toLocaleString()}</p>
          <p className="text-xs mt-1.5 flex items-center gap-1 text-success">
            <ArrowUpRight size={12} />
            Live from member savings
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted">Active loans</p>
          <p className="text-xl font-mono font-semibold text-text mt-2">KES {activeLoanTotal.toLocaleString()}</p>
          <p className="text-xs mt-1.5 text-text-muted">{activeLoans.length} member{activeLoans.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted">This cycle collected</p>
          <p className="text-xl font-mono font-semibold text-text mt-2">
            KES {cycleCollected.toLocaleString()} / {cycleTarget.toLocaleString()}
          </p>
          <p className="text-xs mt-1.5 flex items-center gap-1 text-success">
            <ArrowUpRight size={12} />
            {cyclePercent}%
          </p>
        </div>
      </div>

      {atRiskLoan && (
        <div className="bg-accent/10 border border-accent/25 rounded-xl p-5 flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
            <Sparkles size={17} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text">AI Treasurer flagged something</p>
            <p className="text-sm text-text-muted mt-1">
              {atRiskLoan.member.name} is behind on their loan repayment — pattern matches early default risk.
              Consider a check-in before further action.
            </p>
          </div>
          <Link
            to="/ai-treasurer"
            className="text-xs font-medium text-accent border border-accent/30 rounded-lg px-3 py-1.5 hover:bg-accent/10 transition-colors whitespace-nowrap"
          >
            View details
          </Link>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-medium text-text">This cycle's contributions</h2>
          <span className="text-xs text-text-muted font-mono">
            {memberStatus.filter((m) => m.tone === 'success').length} of {groupMembers.length} members
          </span>
        </div>
        <div className="divide-y divide-border">
          {memberStatus.map((m) => (
            <div key={m.name} className="px-5 py-4 flex items-center justify-between">
              <ContributionRing percent={m.percent} tone={m.tone} label={m.name} sublabel={m.status} size={44} strokeWidth={4} />
              {m.tone === 'danger' && <AlertTriangle size={16} className="text-danger" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}