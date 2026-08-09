import API from './axios'

export async function fetchGroupLoans(groupId) {
  const { data } = await API.get(`/loans/group/${groupId}`)
  return data
}

export async function requestLoanAPI(groupId, amount) {
  const { data } = await API.post('/loans', { groupId, amount })
  return data
}

export async function repayLoanAPI(loanId, amount) {
  const { data } = await API.put(`/loans/${loanId}/repay`, { amount })
  return data
}

export async function markDefaultedAPI(loanId) {
  const { data } = await API.put(`/loans/${loanId}/default`)
  return data
}