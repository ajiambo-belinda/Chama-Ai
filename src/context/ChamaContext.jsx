import { createContext, useContext, useState } from 'react'

const ChamaContext = createContext(null)

const INTEREST_RATE = 0.1
const LOAN_LIMIT_MULTIPLIER = 3

const initialMembers = {
  'James Mwangi': { savings: 15000, banned: false },
  'Grace Wanjiru': { savings: 13000, banned: false },
  'Peter Otieno': { savings: 4000, banned: false },
  'Susan Achieng': { savings: 8300, banned: false },
}

const initialLoans = [
  { id: 1, name: 'James Mwangi', principal: 35000, repaid: 18000, status: 'active', dueDate: 'Sep 15, 2026' },
  { id: 2, name: 'Grace Wanjiru', principal: 15000, repaid: 16500, status: 'cleared', dueDate: 'Jul 1, 2026' },
  { id: 3, name: 'Peter Otieno', principal: 20000, repaid: 4000, status: 'at-risk', dueDate: 'Aug 10, 2026' },
]

const initialContributions = [
  { id: 1, name: 'James Mwangi', amount: 5000, date: 'Aug 1, 2026', method: 'M-Pesa', status: 'confirmed', recordedBy: 'self' },
  { id: 2, name: 'Grace Wanjiru', amount: 5000, date: 'Aug 1, 2026', method: 'M-Pesa', status: 'confirmed', recordedBy: 'self' },
  { id: 3, name: 'Susan Achieng', amount: 4000, date: 'Aug 3, 2026', method: 'M-Pesa', status: 'pending', recordedBy: 'self' },
  { id: 4, name: 'Peter Otieno', amount: 2000, date: 'Jul 15, 2026', method: 'Cash', status: 'confirmed', recordedBy: 'treasurer' },
]

const initialGroups = [
  { id: 1, name: 'Bumbe Genesis Savings Group', members: ['James Mwangi', 'Grace Wanjiru', 'Peter Otieno', 'Susan Achieng'], cycle: 'Monthly', active: true },
]

export function ChamaProvider({ children }) {
  const [members, setMembers] = useState(initialMembers)
  const [loans, setLoans] = useState(initialLoans)
  const [contributions, setContributions] = useState(initialContributions)
  const [groups, setGroups] = useState(initialGroups)

  function addSavings(name, amount) {
    setMembers((prev) => ({
      ...prev,
      [name]: { ...prev[name], savings: prev[name].savings + amount },
    }))
  }

  function createGroup(name, memberNames, cycle) {
  setGroups((prev) => [
    ...prev,
    { id: Date.now(), name, members: memberNames, cycle, active: false },
  ])
}

function switchActiveGroup(id) {
  setGroups((prev) => prev.map((g) => ({ ...g, active: g.id === id })))
}

function getGroupBalance(memberNames) {
  return memberNames.reduce((sum, name) => sum + (members[name]?.savings || 0), 0)
}

  function recordContribution(name, amount, method, recordedBy = 'self') {
  const status = method === 'M-Pesa' ? 'pending' : 'confirmed'

  setContributions((prev) => [
    { id: Date.now(), name, amount, date: 'Just now', method, status, recordedBy },
    ...prev,
  ])

  // Confirmed contributions immediately count toward savings; pending ones wait for reconciliation
  if (status === 'confirmed') {
    addSavings(name, amount)
  }
}

  function deductSavings(name, amount) {
    setMembers((prev) => {
      const current = prev[name]?.savings || 0
      const deducted = Math.min(current, amount)
      return { ...prev, [name]: { ...prev[name], savings: current - deducted } }
    })
  }

  function repayLoan(loanId, amount) {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId) return l
        const totalOwed = l.principal * (1 + INTEREST_RATE)
        const newRepaid = Math.min(l.repaid + amount, totalOwed)
        const status = newRepaid >= totalOwed ? 'cleared' : l.status
        return { ...l, repaid: newRepaid, status }
      })
    )
  }

  function requestLoan(name, amount) {
    setLoans((prev) => [
      { id: Date.now(), name, principal: amount, repaid: 0, status: 'pending', dueDate: '—' },
      ...prev,
    ])
  }

  function markDefaulted(loanId) {
    setLoans((prev) => {
      const loan = prev.find((l) => l.id === loanId)
      if (!loan) return prev
      const totalOwed = loan.principal * (1 + INTEREST_RATE)
      const balanceRemaining = Math.max(totalOwed - loan.repaid, 0)

      deductSavings(loan.name, balanceRemaining)
      setMembers((m) => ({ ...m, [loan.name]: { ...m[loan.name], banned: true } }))

      return prev.map((l) =>
        l.id === loanId ? { ...l, status: 'defaulted', repaid: Math.min(l.repaid + balanceRemaining, totalOwed) } : l
      )
    })
  }

  function getMemberLoan(name) {
    return loans.find(
      (l) => l.name === name && (l.status === 'active' || l.status === 'at-risk' || l.status === 'pending')
    )
  }

  function getEligibleLimit(name) {
    return (members[name]?.savings || 0) * LOAN_LIMIT_MULTIPLIER
  }

  const value = {
  members,
  loans,
  contributions,
  groups,
  INTEREST_RATE,
  LOAN_LIMIT_MULTIPLIER,
  addSavings,
  deductSavings,
  repayLoan,
  requestLoan,
  markDefaulted,
  recordContribution,
  createGroup,
  switchActiveGroup,
  getGroupBalance,
  getMemberLoan,
  getEligibleLimit,
}

  return <ChamaContext.Provider value={value}>{children}</ChamaContext.Provider>
}

export function useChama() {
  const ctx = useContext(ChamaContext)
  if (!ctx) throw new Error('useChama must be used inside a ChamaProvider')
  return ctx
}