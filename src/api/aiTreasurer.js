import API from './axios'

export async function askAiTreasurerAPI(groupId, question) {
  const { data } = await API.post('/ai-treasurer/ask', { groupId, question })
  return data
}
export async function getWithdrawalRecommendationAPI(withdrawalId) {
  const { data } = await API.post('/ai-treasurer/withdrawal-recommendation', { withdrawalId })
  return data
}