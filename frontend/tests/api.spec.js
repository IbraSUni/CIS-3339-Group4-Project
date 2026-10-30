// Task F2: the single Axios response interceptor in src/api/api.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosError } from 'axios'
import { apiClient, getClients, loginUser, onUnauthorized, messageOf, ApiError } from '../src/api/api'

// Replace the HTTP layer so no real network call is made.
function respondWith(status, data) {
  apiClient.defaults.adapter = async (config) => {
    const response = { status, data, config, headers: {}, statusText: String(status) }
    if (status >= 200 && status < 300) return response
    throw new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, {}, response)
  }
}

describe('api interceptor', () => {
  beforeEach(() => onUnauthorized(null))

  it('turns a network failure into "Unable to reach the server"', async () => {
    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config, {})
    }
    await expect(getClients()).rejects.toMatchObject({ name: 'ApiError', message: 'Unable to reach the server', status: null })
  })

  it('uses the server message for { error }, { message } and plain text bodies', async () => {
    respondWith(400, { error: 'Last name is required' })
    await expect(getClients()).rejects.toThrow('Last name is required')
    respondWith(404, { message: 'Client not found' })
    await expect(getClients()).rejects.toThrow('Client not found')
    respondWith(406, "Client is signed up for events and can't be deleted.")
    await expect(getClients()).rejects.toThrow("Client is signed up for events and can't be deleted.")
  })

  it('never produces [object Object] for an unexpected body', async () => {
    respondWith(500, { unexpected: true })
    const err = await getClients().catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.message).toBe('Request failed (500)')
  })

  it('calls the 401 handler for an expired session, but not for a failed login', async () => {
    const handler = vi.fn()
    onUnauthorized(handler)
    respondWith(401, { message: 'Token is not valid' })
    await getClients().catch(() => {})
    expect(handler).toHaveBeenCalledTimes(1)

    await loginUser('user', 'wrong').catch(() => {})
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('messageOf() reads plain-text and { message } success bodies', () => {
    expect(messageOf('Client updated successfully')).toBe('Client updated successfully')
    expect(messageOf({ message: 'Already registered' })).toBe('Already registered')
    expect(messageOf({ _id: 'x' }, 'Done')).toBe('Done')
  })
})
