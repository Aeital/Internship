import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ems_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) { //security token expire hogya
      localStorage.removeItem('ems_token')
      window.location.href = '/login'
    }
    return Promise.reject(err) //koi or msg
  }
)
