import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// Products
export const getProducts = (params = {}) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

// Categories
export const getCategories = (params = {}) => api.get('/categories', { params })
export const createCategory = (data) => api.post('/categories', data)
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data)
export const deleteCategory = (id) => api.delete(`/categories/${id}`)

// Offers
export const getOffers = (params = {}) => api.get('/offers', { params })
export const createOffer = (data) => api.post('/offers', data)
export const updateOffer = (id, data) => api.put(`/offers/${id}`, data)
export const deleteOffer = (id) => api.delete(`/offers/${id}`)

// Messages
export const getMessages = (params = {}) => api.get('/messages', { params })
export const sendMessage = (data) => api.post('/messages', data)
export const createMessage = (data) => api.post('/messages', data)
export const updateMessage = (id, data) => api.put(`/messages/${id}`, data)
export const deleteMessage = (id) => api.delete(`/messages/${id}`)

// Settings
export const getSettings = () => api.get('/settings')
export const updateSettings = (data) => api.put('/settings', data)

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password })
export const logout = () => api.post('/auth/logout')
export const getMe = () => api.get('/auth/me')

// Stats
export const getStats = () => api.get('/stats')

// Upload
export const uploadImage = (file) => {
  const fd = new FormData()
  fd.append('image', file)
  return api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export const uploadSingleImage = (file) => {
  const fd = new FormData()
  fd.append('image', file)
  return api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export const uploadImages = (files) => {
  const fd = new FormData()
  Array.from(files).forEach(f => fd.append('images', f))
  return api.post('/upload/multiple', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export default api
