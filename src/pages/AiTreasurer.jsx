import { Sparkles, AlertTriangle, TrendingDown, MessageSquare, CheckCircle2 } from 'lucide-react'
import ContributionRing from '../components/ContributionRing'
import { useChama } from '../context/ChamaContext'

export default function AiTreasurer() {
  const { members, loans, contributions, INTEREST_RATE } = useChama()

  const insights = []

  // Generate an insight for every at-risk or defaulted loan
  loans
    .filter((l) => l.status === 'at-risk' || l.status === 'defaulted')
    .forEach((loan) => {
      const totalOwed = loan.principal * (1 + INTEREST_RATE)
      const balanceRemaining = Math.max(totalOwed - loan.repaid, 0)
      const percent = totalOwed ? Math.round((loan.repaid / totalOwed) * 100) : 0

      insights.push({
        id: `loan-${loan.id}`,
        member: loan.name,
        severity: 'high',
        title: loan.status === 'defaulted' ? 'Loan defaulted' : 'Default risk pattern detected',
        detail:
          loan.status === 'defaulted'
            ? `${loan.name}'s loan was marked as defaulted. KES ${balanceRemaining.toLocaleString()} was recovered from their savings, and they are now restricted from taking new loans until their standing is reviewed.`
            : `${loan.name} has an outstanding loan balance of KES ${balanceRemaining.toLocaleString()} (${100 - percent}% unpaid) and is flagged at-risk. This matches the early-warning pattern for default.`,
        recommendation:
          loan.status === 'defaulted'
            ? 'Review whether this member should be reinstated after demonstrating improved standing.'
            : 'Schedule a check-in before the loan review deadline. Consider a revised repayment plan if hardship is confirmed.',
        percent,
        tone: 'danger',
      })
    })

  // Generate an insight for members with a pending (unconfirmed) contribution
  contributions
    .filter((c) => c.status === 'pending')
    .forEach((c) => {
      insights.push({
        id: `contrib-${c.id}`,
        member: c.name,
        severity: 'medium',
        title: 'Contribution awaiting confirmation',
        detail: `${c.name}'s contribution of KES ${c.amount.toLocaleString()} via ${c.method} is still pending reconciliation.`,
        recommendation: 'No elevated concern — routine confirmation once the payment clears.',
        percent: 60,
        tone: 'warning',
      })
    })

  const severityStyles = {
    high: { badge: 'bg-danger/10 text-danger', icon: AlertTriangle },
    medium: { badge: 'bg-warning/10 text-warning', icon: TrendingDown },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
          <Sparkles size={18} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text">AI Treasurer</h1>
          <p className="text-sm text-text-muted mt-0.5">Insights and risk patterns across your group</p>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <CheckCircle2 size={28} className="text-success mx-auto mb-3" />
          <p className="text-sm font-medium text-text">No active risks detected</p>
          <p className="text-xs text-text-muted mt-1">Every member is in good standing right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => {
            const sev = severityStyles[insight.severity]
            const SevIcon = sev.icon

            return (
              <div key={insight.id} className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <ContributionRing percent={insight.percent} tone={insight.tone} size={48} strokeWidth={4} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text">{insight.member}</p>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${sev.badge}`}>
                          <SevIcon size={11} />
                          {insight.severity} priority
                        </span>
                      </div>
                      <p className="text-sm text-text mt-1 font-medium">{insight.title}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-text-muted mt-4 leading-relaxed">{insight.detail}</p>

                <div className="mt-4 pt-4 border-t border-border bg-accent/5 -mx-5 -mb-5 px-5 py-4 rounded-b-xl">
                  <p className="text-xs font-medium text-accent flex items-center gap-1.5 mb-1">
                    <Sparkles size={12} />
                    AI recommendation
                  </p>
                  <p className="text-sm text-text">{insight.recommendation}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-3">
        <MessageSquare size={18} className="text-text-muted" />
        <div>
          <p className="text-sm text-text">Ask the AI Treasurer directly</p>
          <p className="text-xs text-text-muted mt-0.5">
            Conversational queries like "who hasn't paid this month" — coming once the backend is connected.
          </p>
        </div>
      </div>
    </div>
  )
}