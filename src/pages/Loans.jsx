import { useState } from 'react'
import { Plus, X, CheckCircle2, Clock, XCircle, AlertCircle, Ban } from 'lucide-react'
import { Button } from '../components/ui/button'
import ContributionRing from '../components/ContributionRing'
import { useChama } from '../context/ChamaContext'

const statusConfig = {
  active: { label: 'Active', icon: Clock, className: 'bg-primary/10 text-primary' },
  cleared: { label: 'Cleared', icon: CheckCircle2, className: 'bg-success/10 text-success' },
  'at-risk': { label: 'At risk', icon: XCircle, className: 'bg-danger/10 text-danger' },
  pending: { label: 'Pending approval', icon: Clock, className: 'bg-warning/10 text-warning' },
  defaulted: { label: 'Defaulted', icon: Ban, className: 'bg-danger/10 text-danger' },
}

export default function Loans() {
  const {
    members,
    loans,
    INTEREST_RATE,
    requestLoan,
    markDefaulted,
    getMemberLoan,
    getEligibleLimit,
  } = useChama()

  const [showForm, setShowForm] = useState(false)
  const [formMember, setFormMember] = useState(Object.keys(members)[0])
  const [formAmount, setFormAmount] = useState('')
  const [formError, setFormError] = useState('')

  const formEligibleLimit = getEligibleLimit(formMember)
  const bannedMembers = Object.entries(members).filter(([, m]) => m.banned).map(([name]) => name)

  function handleSubmitRequest() {
    const amt = Number(formAmount)

    if (!amt || amt <= 0) {
      setFormError('Enter a valid amount.')
      return
    }
    if (members[formMember]?.banned) {
      setFormError(`${formMember} is banned from borrowing due to a prior default.`)
      return
    }
    if (getMemberLoan(formMember)) {
      setFormError(`${formMember} must clear their current loan before requesting a new one.`)
      return
    }
    if (amt > formEligibleLimit) {
      setFormError(`Amount exceeds ${formMember}'s eligible limit of KES ${formEligibleLimit.toLocaleString()}.`)
      return
    }

    requestLoan(formMember, amt)
    setFormAmount('')
    setFormError('')
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Loans</h1>
          <p className="text-sm text-text-muted mt-1">
            Requests, approvals, and repayment tracking · {INTEREST_RATE * 100}% interest per cycle
          </p>
        </div>
        <Button className="gap-2" onClick={() => { setShowForm((s) => !s); setFormError('') }}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Loan Request'}
        </Button>
      </div>

      {bannedMembers.length > 0 && (
        <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 flex items-center gap-2 text-sm text-danger">
          <Ban size={15} />
          Banned from borrowing: {bannedMembers.join(', ')}
        </div>
      )}

      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <p className="text-xs text-text-muted">
            Works for first-time requests or once a member has fully cleared a previous loan.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted block mb-1.5">Member</label>
              <select
                value={formMember}
                onChange={(e) => { setFormMember(e.target.value); setFormError('') }}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {Object.keys(members).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <p className="text-[11px] text-accent mt-1.5">
                Eligible limit: KES {formEligibleLimit.toLocaleString()} (3x savings)
              </p>
            </div>

            <div>
              <label className="text-xs text-text-muted block mb-1.5">Requested amount (KES)</label>
              <input
                type="number"
                value={formAmount}
                onChange={(e) => { setFormAmount(e.target.value); setFormError('') }}
                placeholder="e.g. 20000"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {formError && (
            <p className="text-xs text-danger flex items-center gap-1.5">
              <AlertCircle size={13} />
              {formError}
            </p>
          )}

          <Button onClick={handleSubmitRequest} className="gap-2">
            <Plus size={16} />
            Submit Request
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {loans.map((loan) => {
          const savings = members[loan.name]?.savings || 0
          const interest = loan.principal * INTEREST_RATE
          const totalOwed = loan.principal + interest
          const balanceRemaining = Math.max(totalOwed - loan.repaid, 0)
          const percent = totalOwed ? Math.round((loan.repaid / totalOwed) * 100) : 0
          const eligibleLimit = getEligibleLimit(loan.name)

          const status = statusConfig[loan.status]
          const StatusIcon = status.icon

          return (
            <div key={loan.id} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <ContributionRing
                    percent={percent}
                    size={52}
                    strokeWidth={5}
                    tone={
                      loan.status === 'at-risk' || loan.status === 'defaulted'
                        ? 'danger'
                        : loan.status === 'cleared'
                        ? 'success'
                        : 'primary'
                    }
                  />
                  <div>
                    <p className="text-sm font-medium text-text">{loan.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">KES {savings.toLocaleString()} saved</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${status.className}`}>
                  <StatusIcon size={12} />
                  {status.label}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-text-muted">Principal</p>
                  <p className="text-sm font-mono text-text mt-0.5">KES {loan.principal.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Interest ({INTEREST_RATE * 100}%)</p>
                  <p className="text-sm font-mono text-text mt-0.5">KES {interest.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Total owed</p>
                  <p className="text-sm font-mono text-text mt-0.5">KES {totalOwed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Balance remaining</p>
                  <p className={`text-sm font-mono mt-0.5 ${balanceRemaining > 0 ? 'text-warning' : 'text-success'}`}>
                    KES {balanceRemaining.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs">
                <span className="text-text-muted">Due: <span className="text-text">{loan.dueDate}</span></span>
                <span className="text-accent flex items-center gap-1">
                  AI-eligible limit (3x savings): <span className="font-mono font-medium">KES {eligibleLimit.toLocaleString()}</span>
                </span>
              </div>

              {loan.status === 'at-risk' && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-danger flex items-center gap-1.5">
                    <Ban size={13} />
                    Overdue — mark as default to recover from savings and restrict borrowing
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markDefaulted(loan.id)}
                    className="text-xs h-7 border-danger/30 text-danger hover:bg-danger/10"
                  >
                    Mark as Defaulted
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}