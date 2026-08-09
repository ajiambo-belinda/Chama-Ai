import API from './axios'

export async function fetchGroupContributions(groupId) {
  const { data } = await API.get(`/contributions/group/${groupId}`)
  return data
}

export async function recordContributionAPI(groupId, memberId, amount, method, recordedBy) {
  const { data } = await API.post('/contributions', { groupId, memberId, amount, method, recordedBy })
  return data
}