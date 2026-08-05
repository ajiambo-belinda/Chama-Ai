import { useState } from 'react'
import { Plus, Minus, ArrowUpFromLine, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import ContributionRing from '../components/ContributionRing'
import { useChama } from '../context/ChamaContext'

const CURRENT_USER = 'James Mwangi' // stand-in for logged-in user until auth exists

export default function Profile() {
  const { members, INTEREST_RATE, addSavings, repayLoan, getMemberLoan, getEligibleLimit } = useChama()

  const savings = members[CURRENT_USER]?.savings || 0
  const loan = getMemberLoan(CURRENT_USER)
  const eligibleLimit = getEligibleLimit(CURRENT_USER)

  const [withdrawals, setWithdrawals] = useState([
    { id: 1, amount: 3000, status: 'approved', date: 'Jul 20, 2026' },
  ])

  const [saveAmount, setSaveAmount] = useState('')
  const [repayAmount, setRepayAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const totalOwed = loan ? loan.principal * (1 + INTEREST_RATE) : 0
  const balanceRemaining = loan ? Math.max(totalOwed - loan.repaid, 0) : 0
  const percentRepaid = loan && totalOwed ? Math.round((loan.repaid / totalOwed) * 100) : 0

  function handleAddSavings() {
    const amt = Number(saveAmount)
    if (amt > 0) {
      addSavings(CURRENT_USER, amt)
      setSaveAmount('')
    }
  }

  function handleRepayLoan() {
    const amt = Number(repayAmount)
    if (amt > 0 && loan) {
      repayLoan(loan.id, amt)
      setRepayAmount('')
    }
  }

  function handleRequestWithdrawal() {
    const amt = Number(withdrawAmount)
    if (balanceRemaining > 0) return
    if (amt > 0 && amt <= savings) {
      setWithdrawals((w) => [
        { id: Date.now(), amount: amt, status: 'pending', date: 'Just now' },
        ...w,
      ])
      setWithdrawAmount('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">My Account</h1>
        <p className="text-sm text-text-muted mt-1">{CURRENT_USER} · Member</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted">My savings</p>
          <p className="text-xl font-mono font-semibold text-text mt-2">KES {savings.toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted">Loan balance remaining</p>
          <p className={`text-xl font-mono font-semibold mt-2 ${balanceRemaining > 0 ? 'text-warning' : 'text-success'}`}>
            KES {balanceRemaining.toLocaleString()}
          </p>
        </div>
        <div className="bg-surface border border-accent/25 bg-accent/5 rounded-xl p-5">
          <p className="text-sm text-text-muted">Eligible loan limit</p>
          <p className="text-xl font-mono font-semibold text-accent mt-2">KES {eligibleLimit.toLocaleString()}</p>
          <p className="text-[11px] text-text-muted mt-1">3x your savings, updates automatically</p>
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
          <Button onClick={handleAddSavings} className="gap-2">
            <Plus size={16} />
            Save
          </Button>
        </div>
      </div>

      {loan && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-4 mb-3">
            <ContributionRing percent={percentRepaid} size={44} strokeWidth={4} tone="primary" />
            <div>
              <h2 className="text-sm font-medium text-text">Repay my loan</h2>
              <p className="text-xs text-text-muted">
                KES {loan.repaid.toLocaleString()} paid of {totalOwed.toLocaleString()} total owed (incl. {INTEREST_RATE * 100}% interest)
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
            <Button onClick={handleRepayLoan} variant="secondary" className="gap-2">
              <Minus size={16} />
              Repay
            </Button>
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium text-text mb-3">Request a withdrawal</h2>

        {balanceRemaining > 0 ? (
          <p className="text-xs text-danger mb-4 flex items-center gap-1.5">
            <AlertCircle size={13} />
            Withdrawals are locked while you have an outstanding loan balance of KES {balanceRemaining.toLocaleString()}. Clear your loan to unlock.
          </p>
        ) : (
          <p className="text-xs text-text-muted mb-3">
            Withdrawals need approval from your chama officials before funds are released — this protects everyone's collective savings.
          </p>
        )}

        <div className="flex gap-2 mb-4">
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Amount (KES)"
            max={savings}
            disabled={balanceRemaining > 0}
            className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button onClick={handleRequestWithdrawal} variant="outline" disabled={balanceRemaining > 0} className="gap-2">
            <ArrowUpFromLine size={16} />
            Request
          </Button>
        </div>

        <div className="space-y-2">
          {withdrawals.map((w) => (
            <div key={w.id} className="flex items-center justify-between py-2 border-t border-border first:border-t-0">
              <div>
                <p className="text-sm text-text font-mono">KES {w.amount.toLocaleString()}</p>
                <p className="text-xs text-text-muted">{w.date}</p>
              </div>
              {w.status === 'pending' ? (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-warning/10 text-warning">
                  <Clock size={12} />
                  Awaiting approval
                </span>
              ) : (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-success/10 text-success">
                  <CheckCircle2 size={12} />
                  Approved
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}