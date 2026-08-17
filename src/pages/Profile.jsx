import { useState } from 'react'
import { Plus, Minus, ArrowUpFromLine, Clock, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react'
import { Button } from '../components/ui/button'
import ContributionRing from '../components/ContributionRing'
import { useChama } from '../context/ChamaContext'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const { activeGroup, loans, withdrawals, recordContribution, repayLoan, payViaMpesa, requestWithdrawal } = useChama()

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
  const [saveMethod, setSaveMethod] = useState('Cash')
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone || '')
  const [mpesaStatus, setMpesaStatus] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawBusy, setWithdrawBusy] = useState(false)
  const [withdrawMessage, setWithdrawMessage] = useState('')

  async function handleAddSavings() {
    const amt = Number(saveAmount)
    if (!(amt > 0 && user)) return

    setSavingBusy(true)
    setMpesaStatus('')
    try {
      if (saveMethod === 'M-Pesa') {
        if (!mpesaPhone) {
          setMpesaStatus('Enter a phone number.')
          return
        }
        await payViaMpesa(user._id, amt, mpesaPhone)
        setMpesaStatus('STK push sent — check your phone to enter your M-Pesa PIN.')
      } else {
        await recordContribution(user._id, amt, 'Cash', 'self')
      }
      setSaveAmount('')
    } catch (err) {
      setMpesaStatus(err.response?.data?.message || 'Payment failed. Please try again.')
    } finally {
      setSavingBusy(false)
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

  async function handleRequestWithdrawal() {
    const amt = Number(withdrawAmount)
    if (amt <= 0) return

    setWithdrawBusy(true)
    setWithdrawMessage('')
    try {
      await requestWithdrawal(amt)
      setWithdrawAmount('')
      setWithdrawMessage('Withdrawal request submitted — awaiting treasurer approval.')
    } catch (err) {
      setWithdrawMessage(err.response?.data?.message || 'Request failed.')
    } finally {
      setWithdrawBusy(false)
    }
  }

  const myWithdrawals = withdrawals.filter((w) => w.member?._id === user._id || w.member === user._id)

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setSaveMethod('Cash')}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              saveMethod === 'Cash' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-muted'
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => setSaveMethod('M-Pesa')}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              saveMethod === 'M-Pesa' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-muted'
            }`}
          >
            <Smartphone size={12} />
            M-Pesa
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            value={saveAmount}
            onChange={(e) => setSaveAmount(e.target.value)}
            placeholder="Amount (KES)"
            className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {saveMethod === 'M-Pesa' && (
            <input
              type="tel"
              value={mpesaPhone}
              onChange={(e) => setMpesaPhone(e.target.value)}
              placeholder="0712345678"
              className="w-36 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
          )}
          <Button onClick={handleAddSavings} disabled={savingBusy} className="gap-2">
            {saveMethod === 'M-Pesa' ? <Smartphone size={16} /> : <Plus size={16} />}
            {savingBusy ? 'Sending...' : saveMethod === 'M-Pesa' ? 'Pay' : 'Save'}
          </Button>
        </div>

        {mpesaStatus && (
          <p className={`text-xs mt-2 ${mpesaStatus.includes('sent') ? 'text-accent' : 'text-danger'}`}>
            {mpesaStatus}
          </p>
        )}
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

      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium text-text mb-3">Request a withdrawal</h2>

        {myLoan ? (
          <p className="text-xs text-danger flex items-center gap-1.5">
            <AlertCircle size={13} />
            Withdrawals are locked while you have an outstanding loan. Clear your loan to unlock.
          </p>
        ) : (
          <>
            <p className="text-xs text-text-muted mb-3">
              Withdrawals need approval from your chama treasurer before funds are released — this protects everyone's collective savings.
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount (KES)"
                max={savings}
                className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button onClick={handleRequestWithdrawal} disabled={withdrawBusy} variant="outline" className="gap-2">
                <ArrowUpFromLine size={16} />
                {withdrawBusy ? 'Sending...' : 'Request'}
              </Button>
            </div>
            {withdrawMessage && (
              <p className={`text-xs mt-2 ${withdrawMessage.includes('submitted') ? 'text-accent' : 'text-danger'}`}>
                {withdrawMessage}
              </p>
            )}
          </>
        )}

        {myWithdrawals.length > 0 && (
          <div className="space-y-2 mt-4 pt-4 border-t border-border">
            {myWithdrawals.map((w) => (
              <div key={w._id} className="flex items-center justify-between py-1">
                <span className="text-sm text-text font-mono">KES {w.amount.toLocaleString()}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                  w.status === 'approved' ? 'bg-success/10 text-success' :
                  w.status === 'rejected' ? 'bg-danger/10 text-danger' :
                  'bg-warning/10 text-warning'
                }`}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}