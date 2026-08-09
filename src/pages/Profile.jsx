import { useState } from 'react'
import { Plus, Minus, ArrowUpFromLine, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import ContributionRing from '../components/ContributionRing'
import { useChama } from '../context/ChamaContext'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const { activeGroup, loans, recordContribution, repayLoan } = useChama()

  const currentUserMember = activeGroup?.members.find((m) => m._id === user._id)
  const savings = currentUserMember?.savings || 0
  const eligibleLimit = activeGroup ? savings * activeGroup.loanLimitMultiplier : 0

  const myLoan = loans.find(
    (l) => l.member._id === user._id && ['active', 'at-risk', 'pending'].includes(l.status)
  )

  const totalOwed = myLoan && activeGroup ? myLoan.principal * (1 + activeGroup.interestRate / 100) : 0
  const balanceRemaining = myLoan ? Math.max(totalOwed - myLoan.repaid, 0) : 0
  const percentRepaid = myLoan && totalOwed ? Math.round((myLoan.repaid / totalOwed) * 100) : 0

  const [saveAmount, setSaveAmount] = useState('')
  const [repayAmount, setRepayAmount] = useState('')
  const [savingBusy, setSavingBusy] = useState(false)
  const [repayBusy, setRepayBusy] = useState(false)

  async function handleAddSavings() {
    const amt = Number(saveAmount)
    if (amt > 0 && user) {
      setSavingBusy(true)
      try {
        await recordContribution(user._id, amt, 'Cash', 'self')
        setSaveAmount('')
      } finally {
        setSavingBusy(false)
      }
    }
  }

  async function handleRepayLoan() {
    const amt = Number(repayAmount)
    if (amt > 0 && myLoan) {
      setRepayBusy(true)
      try {
        await repayLoan(myLoan._id, amt)
        setRepayAmount('')
      } finally {
        setRepayBusy(false)
      }
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
      <div>
        <h1 className="text-2xl font-semibold text-text">My Account</h1>
        <p className="text-sm text-text-muted mt-1">{user?.name} · {activeGroup.name}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted">My savings</p>
          <p className="text-xl font-mono font-semibold text-text mt-2">KES {savings.toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted">Loan balance remaining</p>
          <p className={`text-xl font-mono font-semibold mt-2 ${balanceRemaining > 0 ? 'text-warning' : 'text-success'}`}>
            KES {Math.round(balanceRemaining).toLocaleString()}
          </p>
        </div>
        <div className="bg-surface border border-accent/25 bg-accent/5 rounded-xl p-5">
          <p className="text-sm text-text-muted">Eligible loan limit</p>
          <p className="text-xl font-mono font-semibold text-accent mt-2">KES {eligibleLimit.toLocaleString()}</p>
          <p className="text-[11px] text-text-muted mt-1">{activeGroup.loanLimitMultiplier}x your savings, updates automatically</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium text-text mb-3">Add to my savings</h2>
        <p className="text-xs text-text-muted mb-3">Save any amount, any time — your balance updates instantly.</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={saveAmount}
            onChange={(e) => setSaveAmount(e.target.value)}
            placeholder="Amount (KES)"
            className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button onClick={handleAddSavings} disabled={savingBusy} className="gap-2">
            <Plus size={16} />
            {savingBusy ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {myLoan && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-4 mb-3">
            <ContributionRing percent={percentRepaid} size={44} strokeWidth={4} tone="primary" />
            <div>
              <h2 className="text-sm font-medium text-text">Repay my loan</h2>
              <p className="text-xs text-text-muted">
                KES {myLoan.repaid.toLocaleString()} paid of {Math.round(totalOwed).toLocaleString()} total owed (incl. {activeGroup.interestRate}% interest)
              </p>
            </div>
          </div>
          <p className="text-xs text-text-muted mb-3">Pay any amount, any time — no fixed installment required.</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              placeholder="Amount (KES)"
              className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button onClick={handleRepayLoan} disabled={repayBusy} variant="secondary" className="gap-2">
              <Minus size={16} />
              {repayBusy ? 'Repaying...' : 'Repay'}
            </Button>
          </div>
        </div>
      )}

      {!myLoan && (
        <div className="bg-surface border border-border rounded-xl p-5 text-center text-sm text-text-muted">
          No active loan.
        </div>
      )}
    </div>
  )
}