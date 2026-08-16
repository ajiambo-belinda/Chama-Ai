
import API from './axios'

export async function requestWithdrawalAPI(groupId, amount) {
  const { data } = await API.post('/withdrawals', { groupId, amount })
  return data
}

export async function fetchGroupWithdrawals(groupId) {
  const { data } = await API.get(`/withdrawals/group/${groupId}`)
  return data
}

export async function approveWithdrawalAPI(withdrawalId) {
  const { data } = await API.put(`/withdrawals/${withdrawalId}/approve`)
  return data
}

export async function rejectWithdrawalAPI(withdrawalId) {
  const { data } = await API.put(`/withdrawals/${withdrawalId}/reject`)
  return data
}