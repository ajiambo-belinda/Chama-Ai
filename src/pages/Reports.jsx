import { Sparkles, Download, TrendingUp } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useChama } from '../context/ChamaContext'
import jsPDF from 'jspdf'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

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
  const { activeGroup, loans, contributions } = useChama()

  if (!activeGroup) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted">
        No active group — create or select a group first.
      </div>
    )
  }

  const balance = activeGroup.members.reduce((sum, m) => sum + m.savings, 0)

  const totalCollected = contributions
    .filter((c) => c.status === 'confirmed')
    .reduce((sum, c) => sum + c.amount, 0)

  const cycleTarget = activeGroup.members.length * 5000
  const collectionRate = cycleTarget ? Math.min(Math.round((totalCollected / cycleTarget) * 100), 100) : 0

  const loanStatusCounts = loans.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1
    return acc
  }, {})

  const statusColors = {
    active: 'var(--color-primary)',
    cleared: 'var(--color-success)',
    'at-risk': 'var(--color-danger)',
    pending: 'var(--color-warning)',
    defaulted: 'var(--color-danger)',
  }

  const loanBreakdown = Object.entries(loanStatusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: statusColors[name],
  }))

  const trend = [{ month: 'This cycle', amount: totalCollected }]

  const riskyMembers = loans.filter((l) => l.status === 'at-risk' || l.status === 'defaulted')

  const summary = riskyMembers.length > 0
    ? `The group has collected KES ${totalCollected.toLocaleString()} this cycle, ${collectionRate}% of the KES ${cycleTarget.toLocaleString()} target. ${riskyMembers.map((l) => l.member.name).join(', ')} ${riskyMembers.length === 1 ? 'is' : 'are'} showing default risk and should be prioritized for follow-up.`
    : `The group has collected KES ${totalCollected.toLocaleString()} this cycle, ${collectionRate}% of the KES ${cycleTarget.toLocaleString()} target. No members are currently at risk — the group is in good standing.`

  function handleExportPDF() {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 20

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Chama AI — Monthly Report', 14, y)
    y += 8

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(activeGroup.name, 14, y)
    y += 6
    doc.text(`Generated: ${new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, y)
    y += 12

    doc.setDrawColor(220)
    doc.line(14, y, pageWidth - 14, y)
    y += 10

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20)
    doc.text('Summary', 14, y)
    y += 8

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const stats = [
      ['Group balance', `KES ${balance.toLocaleString()}`],
      ['This cycle collected', `KES ${totalCollected.toLocaleString()}`],
      ['Collection rate', `${collectionRate}%`],
    ]
    stats.forEach(([label, value]) => {
      doc.setTextColor(100)
      doc.text(label, 14, y)
      doc.setTextColor(20)
      doc.text(value, pageWidth - 14, y, { align: 'right' })
      y += 7
    })
    y += 6

    doc.setDrawColor(220)
    doc.line(14, y, pageWidth - 14, y)
    y += 10

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20)
    doc.text('AI Monthly Summary', 14, y)
    y += 8

    doc.setFontSize(10.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60)
    const summaryLines = doc.splitTextToSize(summary, pageWidth - 28)
    doc.text(summaryLines, 14, y)
    y += summaryLines.length * 5.5 + 10

    doc.setDrawColor(220)
    doc.line(14, y, pageWidth - 14, y)
    y += 10

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20)
    doc.text('Loan Status Breakdown', 14, y)
    y += 8

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    if (loanBreakdown.length > 0) {
      loanBreakdown.forEach((item) => {
        doc.setTextColor(100)
        doc.text(item.name, 14, y)
        doc.setTextColor(20)
        doc.text(`${item.value} loan${item.value !== 1 ? 's' : ''}`, pageWidth - 14, y, { align: 'right' })
        y += 7
      })
    } else {
      doc.setTextColor(120)
      doc.text('No loans recorded for this group.', 14, y)
    }

    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text('Generated by Chama AI', 14, doc.internal.pageSize.getHeight() - 10)

    const fileName = `${activeGroup.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Reports</h1>
          <p className="text-sm text-text-muted mt-1">{activeGroup.name}</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
          <Download size={16} />
          Export PDF
        </Button>
      </div>

      <div className="bg-accent/10 border border-accent/25 rounded-xl p-5 flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <Sparkles size={17} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium text-text">AI monthly summary</p>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">{summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted">Group balance</p>
          <p className="text-xl font-mono font-semibold text-text mt-2">KES {balance.toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted">This cycle collected</p>
          <p className="text-xl font-mono font-semibold text-text mt-2">KES {totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted">Collection rate</p>
          <p className="text-xl font-mono font-semibold text-text mt-2">{collectionRate}%</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-text">Contribution trend</h2>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <TrendingUp size={12} />
            Historical trend builds over time
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ fill: 'var(--color-primary)', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium text-text mb-4">Loan status breakdown</h2>
        {loanBreakdown.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={loanBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                {loanBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" formatter={(value) => <span style={{ color: 'var(--color-text)', fontSize: 13 }}>{value}</span>} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-text-muted text-center py-8">No loans recorded for this group yet.</p>
        )}
      </div>
    </div>
  )
}