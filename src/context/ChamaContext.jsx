import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { fetchMyGroups, createGroupAPI, updateGroupAPI  } from '../api/groups'
import { fetchGroupContributions, recordContributionAPI } from '../api/contributions'
import { fetchGroupLoans, requestLoanAPI, repayLoanAPI, markDefaultedAPI } from '../api/loans'
import { triggerSTKPushAPI } from '../api/mpesa'

const ChamaContext = createContext(null)

export function ChamaProvider({ children }) {
  const { user } = useAuth()

  const [groups, setGroups] = useState([])
  const [activeGroupId, setActiveGroupId] = useState(null)
  const [contributions, setContributions] = useState([])
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  const activeGroup = groups.find((g) => g._id === activeGroupId) || groups[0]

  // Load this user's groups once logged in
  useEffect(() => {
    if (!user) return
    fetchMyGroups()
      .then((data) => {
        setGroups(data)
        if (data.length > 0) setActiveGroupId(data[0]._id)
      })
      .finally(() => setLoading(false))
  }, [user])

  // Whenever the active group changes, load its contributions and loans
  const refreshGroupData = useCallback(async () => {
    if (!activeGroup) return
    const [contribData, loanData] = await Promise.all([
      fetchGroupContributions(activeGroup._id),
      fetchGroupLoans(activeGroup._id),
    ])
    setContributions(contribData)
    setLoans(loanData)
  }, [activeGroup])

  useEffect(() => {
    refreshGroupData()
  }, [refreshGroupData])

  // Build a members lookup { name: { savings, banned, _id } } from the active group, matching the old shape
  const members = {}
  if (activeGroup) {
    activeGroup.members.forEach((m) => {
      members[m.name] = { _id: m._id, savings: m.savings, banned: m.banned || false }
    })
  }

  async function createGroup(name, memberIds, cycle) {
    const newGroup = await createGroupAPI(name, memberIds, cycle)
    setGroups((prev) => [...prev, newGroup])
  }

  function switchActiveGroup(id) {
    setActiveGroupId(id)
  }

  async function updateGroupSettings(updates) {
  if (!activeGroup) return
  const updated = await updateGroupAPI(activeGroup._id, updates)
  setGroups((prev) => prev.map((g) => (g._id === updated._id ? updated : g)))
}

  async function recordContribution(memberId, amount, method, recordedBy = 'self') {
    if (!activeGroup) return
    await recordContributionAPI(activeGroup._id, memberId, amount, method, recordedBy)
    await refreshGroupData()
    // Refresh groups too, since member savings changed
    const updatedGroups = await fetchMyGroups()
    setGroups(updatedGroups)
  }

  async function payViaMpesa(memberId, amount, phoneNumber) {
  if (!activeGroup) return
  const result = await triggerSTKPushAPI(activeGroup._id, memberId, amount, phoneNumber)
  return result
}

  async function requestLoan(amount) {
    if (!activeGroup) return
    await requestLoanAPI(activeGroup._id, amount)
    await refreshGroupData()
  }

  async function repayLoan(loanId, amount) {
    await repayLoanAPI(loanId, amount)
    await refreshGroupData()
  }

  async function markDefaulted(loanId) {
    await markDefaultedAPI(loanId)
    await refreshGroupData()
    const updatedGroups = await fetchMyGroups()
    setGroups(updatedGroups)
  }

  function getMemberLoan(memberId) {
    return loans.find(
      (l) => l.member._id === memberId && ['active', 'at-risk', 'pending'].includes(l.status)
    )
  }

  function getEligibleLimit(memberName) {
    const m = members[memberName]
    if (!m || !activeGroup) return 0
    return m.savings * activeGroup.loanLimitMultiplier
  }

  function getGroupBalance(memberNames) {
    return memberNames.reduce((sum, name) => sum + (members[name]?.savings || 0), 0)
  }

  const value = {
  loading,
  groups,
  activeGroup,
  activeGroupId,
  members,
  loans,
  contributions,
  INTEREST_RATE: activeGroup?.interestRate || 10,
  LOAN_LIMIT_MULTIPLIER: activeGroup?.loanLimitMultiplier || 3,
  createGroup,
  switchActiveGroup,
  updateGroupSettings,
  recordContribution,
  payViaMpesa,
  requestLoan,
  repayLoan,
  markDefaulted,
  getMemberLoan,
  getEligibleLimit,
  getGroupBalance,
  refreshGroupData,
}

  return <ChamaContext.Provider value={value}>{children}</ChamaContext.Provider>
}

export function useChama() {
  const ctx = useContext(ChamaContext)
  if (!ctx) throw new Error('useChama must be used inside a ChamaProvider')
  return ctx
}