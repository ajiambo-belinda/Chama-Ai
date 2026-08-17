import API from './axios'

export async function previewDividendAPI(groupId) {
  const { data } = await API.get(`/dividends/group/${groupId}/preview`)
  return data
}

export async function declareDividendAPI(groupId, period) {
  const { data } = await API.post(`/dividends/group/${groupId}/declare`, { period })
  return data
}

export async function fetchDividendHistory(groupId) {
  const { data } = await API.get(`/dividends/group/${groupId}`)
  return data
}