import { useState } from 'react'
import { Sparkles, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

// Mock per-group report data — later this comes from the backend, filtered by group ID
const reportsData = {
  'Bumbe Genesis Savings Group': {
    trend: [
      { month: 'Mar', amount: 58000 },
      { month: 'Apr', amount: 62000 },
      { month: 'May', amount: 71000 },
      { month: 'Jun', amount: 65000 },
      { month: 'Jul', amount: 74000 },
      { month: 'Aug', amount: 68000 },
    ],
    loanBreakdown: [
      { name: 'Active', value: 2, color: 'var(--color-primary)' },
      { name: 'Cleared', value: 1, color: 'var(--color-success)' },
      { name: 'At risk', value: 1, color: 'var(--color-danger)' },
    ],
    stats: [
      { label: 'Total collected (6mo)', value: 'KES 398,000' },
      { label: 'Average per cycle', value: 'KES 66,333' },
      { label: 'Collection rate', value: '85%' },
    ],
    summary:
      'The group collected KES 68,000 this cycle, 85% of the KES 80,000 target. Contributions have grown 17% since March. One member (Peter Otieno) is showing early default risk and should be prioritized for follow-up. Loan repayments are on track overall, with 2 of 4 active loans in good standing.',
    trendChange: '+17%',
    trendUp: true,
  },
  'Familia Table Banking': {
    trend: [
      { month: 'Mar', amount: 21000 },
      { month: 'Apr', amount: 19500 },
      { month: 'May', amount: 22000 },
      { month: 'Jun', amount: 18000 },
      { month: 'Jul', amount: 17000 },
      { month: 'Aug', amount: 20500 },
    ],
    loanBreakdown: [
      { name: 'Active', value: 1, color: 'var(--color-primary)' },
      { name: 'Cleared', value: 2, color: 'var(--color-success)' },
    ],
    stats: [
      { label: 'Total collected (6mo)', value: 'KES 118,000' },
      { label: 'Average per cycle', value: 'KES 19,667' },
      { label: 'Collection rate', value: '92%' },
    ],
    summary:
      'This group collected KES 20,500 this cycle, 92% of target — consistently one of the more reliable groups. Contributions dipped slightly in June and July but recovered in August. No members currently at risk of default.',
    trendChange: '-2.4%',
    trendUp: false,
  },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-mono font-medium text-text">
        KES {payload[0].value.toLocaleString()}
      </p>
    </div>
  )
}

export default function Reports() {
  const groupNames = Object.keys(reportsData)
  const [activeGroup, setActiveGroup] = useState(groupNames[0])
  const data = reportsData[activeGroup]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Reports</h1>
          <p className="text-sm text-text-muted mt-1">Group performance and financial summaries</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download size={16} />
          Export PDF
        </Button>
      </div>

      {/* Group selector tabs */}
      <div className="flex gap-2 border-b border-border">
        {groupNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveGroup(name)}
            className={`text-sm px-4 py-2.5 border-b-2 transition-colors -mb-px ${
              activeGroup === name
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* AI-generated summary */}
      <div className="bg-accent/10 border border-accent/25 rounded-xl p-5 flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <Sparkles size={17} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium text-text">AI monthly summary — August 2026</p>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">{data.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {data.stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm text-text-muted">{s.label}</p>
            <p className="text-xl font-mono font-semibold text-text mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Contribution trend chart */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-text">Contribution trend</h2>
          <span className={`text-xs flex items-center gap-1 ${data.trendUp ? 'text-success' : 'text-danger'}`}>
            {data.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {data.trendChange} since March
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              dot={{ fill: 'var(--color-primary)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Loan status breakdown */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium text-text mb-4">Loan status breakdown</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data.loanBreakdown}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
            >
              {data.loanBreakdown.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              verticalAlign="middle"
              align="right"
              layout="vertical"
              iconType="circle"
              formatter={(value) => <span style={{ color: 'var(--color-text)', fontSize: 13 }}>{value}</span>}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}