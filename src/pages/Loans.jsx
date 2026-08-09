import { useState } from 'react'
import { Plus, X, CheckCircle2, Clock, XCircle, AlertCircle, Ban } from 'lucide-react'
import { Button } from '../components/ui/button'
import ContributionRing from '../components/ContributionRing'
import { useChama } from '../context/ChamaContext'
import { useAuth } from '../context/AuthContext'

const statusConfig = {
  active: { label: 'Active', icon: Clock, className: 'bg-primary/10 text-primary' },
  cleared: { label: 'Cleared', icon: CheckCircle2, className: 'bg-success/10 text-success' },
  'at-risk': { label: 'At risk', icon: XCircle, className: 'bg-danger/10 text-danger' },
  pending: { label: 'Pending approval', icon: Clock, className: 'bg-warning/10 text-warning' },
  defaulted: { label: 'Defaulted', icon: Ban, className: 'bg-danger/10 text-danger' },
}

export default function Loans() {
  const { user } = useAuth()
  const { activeGroup, loans, requestLoan, repayLoan, markDefaulted } = useChama()

  const groupMembers = activeGroup?.members || []
  const isTreasurer = activeGroup && (activeGroup.treasurer?._id === user._id || activeGroup.treasurer === user._id)

  const [showForm, setShowForm] = useState(false)
  const [formAmount, setFormAmount] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const currentUserMember = groupMembers.find((m) => m._id === user._id)
  const eligibleLimit = currentUserMember ? currentUserMember.savings * (activeGroup?.loanLimitMultiplier || 3) : 0

  async function handleSubmitRequest() {
    const amt = Number(formAmount)
    setFormError('')

    if (!amt || amt <= 0) {
      setFormError('Enter a valid amount.')
      return
    }

    setSubmitting(true)
    try {
      await requestLoan(amt)
      setFormAmount('')
      setShowForm(false)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDefault(loanId) {
    await markDefaulted(loanId)
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
          <h1 className="text-2xl font-semibold text-text">Loans</h1>
          <p className="text-sm text-text-muted mt-1">
            {activeGroup.name} · {activeGroup.interestRate}% interest per cycle
          </p>
        </div>
        <Button className="gap-2" onClick={() => { setShowForm((s) => !s); setFormError('') }}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Request a Loan'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <p className="text-xs text-accent">
            Your eligible limit: KES {eligibleLimit.toLocaleString()} ({activeGroup.loanLimitMultiplier}x your savings)
          </p>

          <div>
            <label className="text-xs text-text-muted block mb-1.5">Requested amount (KES)</label>
            <input
              type="number"
              value={formAmount}
              onChange={(e) => { setFormAmount(e.target.value); setFormError('') }}
              placeholder="e.g. 10000"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {formError && (
            <p className="text-xs text-danger flex items-center gap-1.5">
              <AlertCircle size={13} />
              {formError}
            </p>
          )}

          <Button onClick={handleSubmitRequest} disabled={submitting} className="gap-2">
            <Plus size={16} />
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {loans.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted text-sm">
            No loans yet in this group.
          </div>
        ) : (
          loans.map((loan) => {
            const totalOwed = loan.principal * (1 + activeGroup.interestRate / 100)
            const balanceRemaining = Math.max(totalOwed - loan.repaid, 0)
            const percent = totalOwed ? Math.round((loan.repaid / totalOwed) * 100) : 0
            const status = statusConfig[loan.status]
            const StatusIcon = status.icon
            const isOwnLoan = loan.member._id === user._id

            return (
              <div key={loan._id} className="bg-surface border border-border rounded-xl p-5">
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
                      <p className="text-sm font-medium text-text">{loan.member.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">KES {loan.member.savings.toLocaleString()} saved</p>
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
                    <p className="text-xs text-text-muted">Total owed</p>
                    <p className="text-sm font-mono text-text mt-0.5">KES {Math.round(totalOwed).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Repaid</p>
                    <p className="text-sm font-mono text-text mt-0.5">KES {loan.repaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Balance remaining</p>
                    <p className={`text-sm font-mono mt-0.5 ${balanceRemaining > 0 ? 'text-warning' : 'text-success'}`}>
                      KES {Math.round(balanceRemaining).toLocaleString()}
                    </p>
                  </div>
                </div>

                {isTreasurer && (loan.status === 'at-risk' || loan.status === 'active') && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-danger flex items-center gap-1.5">
                      <Ban size={13} />
                      Treasurer action — mark defaulted to recover from savings
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDefault(loan._id)}
                      className="text-xs h-7 border-danger/30 text-danger hover:bg-danger/10"
                    >
                      Mark as Defaulted
                    </Button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}