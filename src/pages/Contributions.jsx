import { useState, useRef, useEffect } from 'react'
import { Search, Plus, X, UserCheck, ChevronDown } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useChama } from '../context/ChamaContext'

const statusStyles = {
  confirmed: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  flagged: 'bg-danger/10 text-danger',
}

export default function Contributions() {
  const { activeGroup, contributions, recordContribution } = useChama()

  const groupMembers = activeGroup?.members || []

  const [showForm, setShowForm] = useState(false)
  const [formMemberId, setFormMemberId] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formMethod, setFormMethod] = useState('Cash')
  const [submitting, setSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (groupMembers.length > 0 && !formMemberId) {
      setFormMemberId(groupMembers[0]._id)
    }
  }, [groupMembers, formMemberId])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredMembers = groupMembers.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const visibleContributions = searchQuery
    ? contributions.filter((c) => c.member?.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : contributions

  async function handleRecord() {
    const amt = Number(formAmount)
    if (!amt || amt <= 0 || !formMemberId) return

    setSubmitting(true)
    try {
      await recordContribution(formMemberId, amt, formMethod, 'treasurer')
      setFormAmount('')
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (!activeGroup) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted">
        No active group — create or select a group first.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Contributions</h1>
          <p className="text-sm text-text-muted mt-1">{activeGroup.name}</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Record Contribution'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs text-accent">
            <UserCheck size={14} />
            Recording on behalf of a member — for members without smartphone/app access
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-text-muted block mb-1.5">Member</label>
              <select
                value={formMemberId}
                onChange={(e) => setFormMemberId(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {groupMembers.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-text-muted block mb-1.5">Amount (KES)</label>
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="5000"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs text-text-muted block mb-1.5">Method</label>
              <select
                value={formMethod}
                onChange={(e) => setFormMethod(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Cash">Cash</option>
                <option value="M-Pesa">M-Pesa (paybill, entered manually)</option>
                <option value="Bank">Bank transfer</option>
              </select>
            </div>
          </div>

          <Button onClick={handleRecord} disabled={submitting} className="gap-2">
            <Plus size={16} />
            {submitting ? 'Recording...' : 'Confirm & Record'}
          </Button>
        </div>
      )}

      <div className="relative max-w-sm" ref={dropdownRef}>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search members..."
          className="w-full bg-surface border border-border rounded-lg pl-9 pr-9 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <ChevronDown
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted cursor-pointer"
          onClick={() => setShowDropdown((s) => !s)}
        />

        {showDropdown && (
          <div className="absolute z-10 mt-1.5 w-full bg-surface border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((m) => (
                <button
                  key={m._id}
                  onClick={() => {
                    setSearchQuery(m.name)
                    setShowDropdown(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-text hover:bg-surface-hover transition-colors"
                >
                  {m.name}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-text-muted">No members found</p>
            )}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setShowDropdown(false)
                }}
                className="w-full text-left px-3 py-2 text-xs text-primary border-t border-border hover:bg-surface-hover transition-colors"
              >
                Clear filter — show all
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wide">
              <th className="text-left font-medium px-5 py-3">Member</th>
              <th className="text-left font-medium px-5 py-3">Amount</th>
              <th className="text-left font-medium px-5 py-3">Date</th>
              <th className="text-left font-medium px-5 py-3">Method</th>
              <th className="text-left font-medium px-5 py-3">Recorded by</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleContributions.length > 0 ? (
              visibleContributions.map((c) => (
                <tr key={c._id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-4 text-text font-medium">{c.member?.name || 'Unknown'}</td>
                  <td className="px-5 py-4 font-mono text-text">KES {c.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-text-muted">
                    {new Date(c.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-text-muted">{c.method}</td>
                  <td className="px-5 py-4">
                    {c.recordedBy === 'treasurer' ? (
                      <span className="text-xs text-accent flex items-center gap-1">
                        <UserCheck size={12} /> Treasurer
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">Self</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusStyles[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-text-muted text-sm">
                  {searchQuery ? `No contributions found for "${searchQuery}"` : 'No contributions recorded yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}