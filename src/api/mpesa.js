import API from './axios'

export async function triggerSTKPushAPI(groupId, memberId, amount, phoneNumber) {
  const { data } = await API.post('/mpesa/stkpush', { groupId, memberId, amount, phoneNumber })
  return data
}