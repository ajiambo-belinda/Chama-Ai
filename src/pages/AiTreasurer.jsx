import { Sparkles, AlertTriangle, TrendingDown, MessageSquare } from 'lucide-react'
import ContributionRing from '../components/ContributionRing'

const insights = [
  {
    id: 1,
    member: 'Peter Otieno',
    severity: 'high',
    title: 'Default risk pattern detected',
    detail:
      'Peter has missed 3 consecutive contribution cycles (Jun 15, Jul 1, Jul 15). His payment history shows a declining trend over the last 2 months — average contribution dropped from KES 5,000 to KES 2,000. Combined with his current loan balance of KES 17,600, this matches the early-warning pattern for default risk.',
    recommendation: 'Schedule a check-in call before his loan review on Aug 10. Consider a revised repayment plan if he confirms financial hardship.',
    percent: 40,
    tone: 'danger',
  },
  {
    id: 2,
    member: 'Susan Achieng',
    severity: 'medium',
    title: 'Contribution due soon',
    detail:
      'Susan\'s contribution for this cycle is due in 2 days. Her payment history is otherwise consistent — no prior late payments in the last 6 cycles.',
    recommendation: 'A routine reminder should suffice — no elevated concern.',
    percent: 80,
    tone: 'warning',
  },
]

const severityStyles = {
  high: { badge: 'bg-danger/10 text-danger', icon: AlertTriangle },
  medium: { badge: 'bg-warning/10 text-warning', icon: TrendingDown },
}

export default function AiTreasurer() {
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