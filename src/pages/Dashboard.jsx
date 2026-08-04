import { Sparkles, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { getGreeting } from '../lib/greeting'
import ContributionRing from '../components/ContributionRing'
import { Link } from 'react-router-dom'

const stats = [
  { label: 'Group balance', value: 'KES 842,300', delta: '+12.4%', up: true },
  { label: 'Active loans', value: 'KES 210,000', delta: '4 members', up: null },
  { label: 'This cycle collected', value: 'KES 68,000 / 80,000', delta: '85%', up: true },
]

const members = [
  { name: 'James Mwangi', percent: 100, tone: 'success', status: 'Paid this cycle' },
  { name: 'Grace Wanjiru', percent: 100, tone: 'success', status: 'Paid this cycle' },
  { name: 'Peter Otieno', percent: 40, tone: 'danger', status: '3 cycles behind' },
  { name: 'Susan Achieng', percent: 80, tone: 'warning', status: 'Due in 2 days' },
]

export default function Dashboard() {
  const greeting = getGreeting()

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm text-text-muted font-mono">Bumbe Genesis Savings Group</p>
        <h1 className="text-2xl font-semibold text-text mt-1">{greeting}, Lyndah</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm text-text-muted">{s.label}</p>
            <p className="text-xl font-mono font-semibold text-text mt-2">{s.value}</p>
            {s.delta && (
              <p className={`text-xs mt-1.5 flex items-center gap-1 ${s.up ? 'text-success' : 'text-text-muted'}`}>
                {s.up && <ArrowUpRight size={12} />}
                {s.delta}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-accent/10 border border-accent/25 rounded-xl p-5 flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <Sparkles size={17} className="text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">AI Treasurer flagged something</p>
          <p className="text-sm text-text-muted mt-1">
            Peter Otieno has missed 3 consecutive cycles — pattern matches early default risk. Consider a check-in
            before the next loan review.
          </p>
        </div>
        <Link
  to="/ai-treasurer"
  className="text-xs font-medium text-accent border border-accent/30 rounded-lg px-3 py-1.5 hover:bg-accent/10 transition-colors whitespace-nowrap"
>
  View details
</Link>
      </div>

      <div className="bg-surface border border-border rounded-xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-medium text-text">This cycle's contributions</h2>
          <span className="text-xs text-text-muted font-mono">4 of 12 members</span>
        </div>
        <div className="divide-y divide-border">
          {members.map((m) => (
            <div key={m.name} className="px-5 py-4 flex items-center justify-between">
              <ContributionRing percent={m.percent} tone={m.tone} label={m.name} sublabel={m.status} />
              {m.tone === 'danger' && <AlertTriangle size={16} className="text-danger" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}