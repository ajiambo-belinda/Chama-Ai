import API from './axios'

export async function lookupUser(email) {
  const { data } = await API.get(`/users/lookup?email=${encodeURIComponent(email)}`)
  return data
}