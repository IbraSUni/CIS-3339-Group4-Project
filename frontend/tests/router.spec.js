// Task F4: the global navigation guard (requiresAuth / requiresEditor)
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// The guard shows a toast for a blocked editor page; stub it out.
vi.mock('vue-toastification', () => ({ useToast: () => ({ warning: vi.fn(), info: vi.fn() }) }))

const makeToken = (role) => {
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  return `${encode({ alg: 'HS256' })}.${encode({ role, exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`
}

async function freshRouter(role) {
  vi.resetModules()
  setActivePinia(createPinia())
  localStorage.clear()
  const { useLoggedInUserStore } = await import('../src/store/loggedInUser')
  if (role) {
    localStorage.setItem('authToken', makeToken(role))
    useLoggedInUserStore().restoreSession()
  }
  const { default: router } = await import('../src/router')
  return router
}

describe('router guard', () => {
  beforeEach(() => window.history.replaceState({}, '', '/'))

  it('sends a logged-out user to /login and remembers the page', async () => {
    const router = await freshRouter(null)
    await router.push('/findclient')
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/findclient')
  })

  it('redirects a viewer away from an editor-only page', async () => {
    const router = await freshRouter('viewer')
    await router.push('/clientform')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('lets an editor open an editor-only page', async () => {
    const router = await freshRouter('editor')
    await router.push('/clientform')
    expect(router.currentRoute.value.name).toBe('clientform')
  })
})
