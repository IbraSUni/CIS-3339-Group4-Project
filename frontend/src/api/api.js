// All HTTP calls to the backend REST API live in this file.
//
// Sprint 2 refactor (task F2):
// - Every function used to wrap its call in try { ... } catch (error) { throw ... },
//   and the wrappers did not agree with each other (some rethrew the Axios error,
//   some rethrew error.response.data, which crashed with a TypeError when the
//   server was down). Those wrappers are gone.
// - ONE response interceptor below is now the only place that turns a failed
//   request into a message. Every rejected promise from this module is an
//   ApiError whose .message is a short, human-readable string.
// - A 401 response triggers the handler registered with onUnauthorized(), which
//   main.js uses to clear the session and send the user to /login.
import axios from 'axios'

// The API base URL comes only from VITE_ROOT_API (see frontend/.env). There is
// no hard-coded API host anywhere in src/.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_ROOT_API,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

// Error type every API function rejects with. `status` is the HTTP status, or
// null when the server could not be reached at all.
export class ApiError extends Error {
  constructor(message, status = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const NETWORK_ERROR_MESSAGE = 'Unable to reach the server'

// Pull one short message out of whatever the server sent back. The current
// backend answers with plain strings or { message }; the Sprint 3 backend will
// answer with { error }. All of those shapes are handled here and only here.
function messageFromResponse(response) {
  const body = response.data
  if (typeof body === 'string' && body.trim() !== '') {
    // An HTML error page (for example a proxy 502) is not a useful message.
    if (body.trim().startsWith('<')) return `Request failed (${response.status})`
    return body.trim()
  }
  if (body && typeof body === 'object') {
    if (typeof body.error === 'string') return body.error
    if (typeof body.message === 'string') return body.message
    if (Array.isArray(body.errors) && body.errors[0]?.msg) return body.errors[0].msg
  }
  return `Request failed (${response.status})`
}

// Called on any 401 except the login request itself (a failed login is not an
// expired session). Registered by main.js so this module does not need to
// import the router or the Pinia store.
let unauthorizedHandler = null
export function onUnauthorized(handler) {
  unauthorizedHandler = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response at all: backend down, wrong VITE_ROOT_API, CORS refusal, etc.
    if (!error.response) {
      return Promise.reject(new ApiError(NETWORK_ERROR_MESSAGE, null))
    }

    const { status, config } = error.response
    const isLoginRequest = config?.url?.includes('/users/login')
    if (status === 401 && !isLoginRequest && unauthorizedHandler) {
      unauthorizedHandler()
    }

    return Promise.reject(new ApiError(messageFromResponse(error.response), status))
  }
)

// Success bodies are sometimes a plain string ("Client updated successfully")
// and, for register/deregister in Sprint 3, { message }. Views use this to get
// a toast-ready string from either shape.
export function messageOf(body, fallback = 'Done') {
  if (typeof body === 'string' && body.trim() !== '') return body
  if (body && typeof body.message === 'string') return body.message
  return fallback
}

const data = (response) => response.data

// ---------------------------------------------------------------------------
// Auth header (set at login and on session restore, removed at logout)
// ---------------------------------------------------------------------------

export function setAuthHeader(token) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export function removeAuthHeader() {
  delete apiClient.defaults.headers.common['Authorization']
}

// ---------------------------------------------------------------------------
// Users and org
// ---------------------------------------------------------------------------

// Returns the JWT. Storing it and decoding it is the Pinia store's job.
export const loginUser = (username, password) =>
  apiClient.post('/users/login', { username, password }).then((res) => res.data.token)

export const getOrgName = () => apiClient.get('/org').then(data)

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const getEvents = () => apiClient.get('/events').then(data)

export const getEventById = (id) => apiClient.get(`/events/id/${id}`).then(data)

// query: { searchBy: 'name', name } or { searchBy: 'date', eventDate: 'YYYY-MM-DD' }
export const searchEvents = (query) => {
  const params = { searchBy: query.searchBy }
  if (query.searchBy === 'name') params.name = query.name || ''
  if (query.searchBy === 'date') params.eventDate = query.eventDate || ''
  return apiClient.get('/events/search', { params }).then(data)
}

export const getClientEvents = (clientId) => apiClient.get(`/events/client/${clientId}`).then(data)

export const getNonClientEvents = (clientId) =>
  apiClient.get(`/events/client/${clientId}/not-registered`).then(data)

export const getEventAttendees = (eventId) => apiClient.get(`/events/attendees/${eventId}`).then(data)

export const getEventsByServiceId = (serviceId) => apiClient.get(`/events/service/${serviceId}`).then(data)

export const createEvent = (eventData) => apiClient.post('/events', eventData).then(data)

export const updateEvent = (id, eventData) => apiClient.put(`/events/update/${id}`, eventData).then(data)

// Register / deregister keep the template's route names and query parameters
// (task B1). The reply is a string today and { message } or the updated event
// after Sprint 3; callers pass it through messageOf().
export const registerAttendee = (eventId, clientId) =>
  apiClient.put('/events/register', {}, { params: { event: eventId, client: clientId } }).then(data)

export const deregisterAttendee = (eventId, clientId) =>
  apiClient.put('/events/deregister', {}, { params: { event: eventId, client: clientId } }).then(data)

export const deleteEvent = (id) => apiClient.delete(`/events/${id}`).then(data)

// Events from the last two months, for the dashboard.
export const getAttendance = () => apiClient.get('/events/attendance').then(data)

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export const getClients = () => apiClient.get('/clients').then(data)

export const getClientById = (id) => apiClient.get(`/clients/id/${id}`).then(data)

// query: { searchBy: 'name', firstName, lastName } or { searchBy: 'number', phoneNumber }
export const searchClients = (query) => {
  const params = { searchBy: query.searchBy }
  if (query.searchBy === 'name') {
    params.firstName = query.firstName || ''
    params.lastName = query.lastName || ''
  }
  if (query.searchBy === 'number') params.phoneNumber = query.phoneNumber || ''
  return apiClient.get('/clients/search', { params }).then(data)
}

export const createClient = (newClient) => apiClient.post('/clients', newClient).then(data)

export const updateClient = (id, updatedClient) =>
  apiClient.put(`/clients/update/${id}`, updatedClient).then(data)

export const deleteClientById = (id) => apiClient.delete(`/clients/${id}`).then(data)

// Client counts per ZIP code, for the dashboard.
export const getClientsByZipCode = () => apiClient.get('/clients/byzip').then(data)

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export const getServices = () => apiClient.get('/services').then(data)

export const getServiceById = (id) => apiClient.get(`/services/id/${id}`).then(data)

// query: { searchBy: 'name', name } or { searchBy: 'description', description }
export const searchServices = (query) => {
  const params = { searchBy: query.searchBy }
  if (query.searchBy === 'name') params.name = query.name || ''
  if (query.searchBy === 'description') params.description = query.description || ''
  return apiClient.get('/services/search', { params }).then(data)
}

export const createService = (newService) => apiClient.post('/services', newService).then(data)

export const updateService = (id, updatedService) =>
  apiClient.put(`/services/update/${id}`, updatedService).then(data)

export const deleteService = (id) => apiClient.delete(`/services/${id}`).then(data)
