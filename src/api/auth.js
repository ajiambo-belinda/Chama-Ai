import API from './axios'

export async function loginUser(email, password) {
  const { data } = await API.post('/auth/login', { email, password })
  return data
}

export async function registerUser(name, email, phone, password) {
  const { data } = await API.post('/auth/register', { name, email, phone, password })
  return data
}