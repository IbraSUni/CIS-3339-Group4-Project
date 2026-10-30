// Task F4: session restore, expiry and logout in the Pinia store
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLoggedInUserStore, TOKEN_STORAGE_KEY } from '../src/store/loggedInUser'
import { apiClient } from '../src/api/api'

// Builds an unsigned JWT; the frontend only decodes, the server verifies.
function makeToken(claims) {
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(claims)}.signature`
}
const inOneHour = () => Math.floor(Date.now() / 1000) + 3600
const anHourAgo = () => Math.floor(Date.now() / 1000) - 3600

describe('loggedInUser store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    delete apiClient.defaults.headers.common.Authorization
  })

  it('restores a valid saved token on startup (refresh keeps you logged in)', () => {
    const token = makeToken({ role: 'editor', username: 'admin', exp: inOneHour() })
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    const user = useLoggedInUserStore()
    expect(user.restoreSession()).toBe(true)
    expect(user.isLoggedIn).toBe(true)
    expect(user.role).toBe('editor')
    expect(user.isEditor).toBe(true)
    expect(apiClient.defaults.headers.common.Authorization).toBe(`Bearer ${token}`)
  })

  it('clears an expired token and starts logged out', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, makeToken({ role: 'editor', exp: anHourAgo() }))
    const user = useLoggedInUserStore()
    expect(user.restoreSession()).toBe(false)
    expect(user.isLoggedIn).toBe(false)
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('clears a corrupted token without throwing', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'not-a-jwt')
    const user = useLoggedInUserStore()
    expect(() => user.restoreSession()).not.toThrow()
    expect(user.isLoggedIn).toBe(false)
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('treats any role other than "editor" as read-only', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, makeToken({ role: 'guest', exp: inOneHour() }))
    const user = useLoggedInUserStore()
    user.restoreSession()
    expect(user.isLoggedIn).toBe(true)
    expect(user.isEditor).toBe(false)
  })

  it('logout removes the token, the header and the state', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, makeToken({ role: 'viewer', exp: inOneHour() }))
    const user = useLoggedInUserStore()
    user.restoreSession()
    user.logout()
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
    expect(apiClient.defaults.headers.common.Authorization).toBeUndefined()
    expect(user.isLoggedIn).toBe(false)
    expect(user.role).toBe('')
  })
})
