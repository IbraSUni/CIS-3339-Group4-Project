// Task F2: useApi(apiCall) -> { data, loading, error, execute }
import { describe, it, expect } from 'vitest'
import { useApi } from '../src/composables/useApi'

// A promise we can resolve or reject from the test.
function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useApi', () => {
  it('starts empty: data null, not loading, no error', () => {
    const { data, loading, error } = useApi(() => Promise.resolve([]))
    expect(data.value).toBeNull()
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('is loading while the request is in flight, then stores the result', async () => {
    const d = deferred()
    const { data, loading, error, execute } = useApi(() => d.promise)
    const run = execute()
    expect(loading.value).toBe(true)
    d.resolve([{ _id: '1' }])
    await run
    expect(loading.value).toBe(false)
    expect(data.value).toEqual([{ _id: '1' }])
    expect(error.value).toBeNull()
  })

  it('stores a readable error string and keeps data null on failure', async () => {
    const { data, loading, error, execute } = useApi(() => Promise.reject(new Error('Unable to reach the server')))
    const result = await execute()
    expect(result).toBeNull()
    expect(loading.value).toBe(false)
    expect(data.value).toBeNull()
    expect(error.value).toBe('Unable to reach the server')
  })

  it('clears the previous error when execute() is called again (retry)', async () => {
    let fail = true
    const { data, error, execute } = useApi(() => (fail ? Promise.reject(new Error('Down')) : Promise.resolve(['ok'])))
    await execute()
    expect(error.value).toBe('Down')
    fail = false
    await execute()
    expect(error.value).toBeNull()
    expect(data.value).toEqual(['ok'])
  })

  it('ignores a slower, older response that finishes after a newer one', async () => {
    const slow = deferred()
    const fast = deferred()
    const calls = [slow, fast]
    const { data, execute } = useApi(() => calls.shift().promise)
    const first = execute()
    const second = execute()
    fast.resolve(['new search'])
    await second
    slow.resolve(['old list'])
    await first
    expect(data.value).toEqual(['new search'])
  })
})
