import API from './axios'

export async function fetchMyGroups() {
  const { data } = await API.get('/groups')
  return data
}

export async function createGroupAPI(name, memberIds, cycle) {
  const { data } = await API.post('/groups', { name, memberIds, cycle })
  return data
}

export async function fetchGroupById(groupId) {
  const { data } = await API.get(`/groups/${groupId}`)
  return data
}

export async function updateGroupAPI(groupId, updates) {
  const { data } = await API.put(`/groups/${groupId}`, updates)
  return data
}

export async function assignOfficialsAPI(groupId, officials) {
  const { data } = await API.put(`/groups/${groupId}/officials`, officials)
  return data
}