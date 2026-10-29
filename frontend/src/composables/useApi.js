// useApi: one small composable for the loading / data / error state that every
// list view and the dashboard used to hand-roll (task F2).
//
//   const { data, loading, error, execute } = useApi(() => api.getClients())
//
//   data     null until the first successful call, then the result
//   loading  true while a request is in flight, false otherwise
//   error    a short, human-readable string after a failure, null otherwise
//   execute  runs the call; use it on mount and as the Retry button handler
//
// Error text comes from the Axios interceptor in api/api.js, so this file never
// translates errors itself; it only stores err.message.
import { ref, shallowRef } from 'vue'

export function useApi(apiCall) {
  // shallowRef: API results are replaced as a whole, never mutated in place,
  // so deep reactivity on large arrays is unnecessary work.
  const data = shallowRef(null)
  const loading = ref(false)
  const error = ref(null)

  // Each call gets an id. If a slower, older request finishes after a newer
  // one (for example a search typed quickly after the page load), its result
  // is ignored so stale rows never replace fresh ones.
  let latestCall = 0

  async function execute(...args) {
    const callId = ++latestCall
    loading.value = true
    error.value = null
    try {
      const result = await apiCall(...args)
      if (callId === latestCall) data.value = result
      return result
    } catch (err) {
      if (callId === latestCall) {
        error.value = err?.message || 'Something went wrong'
      }
      return null
    } finally {
      if (callId === latestCall) loading.value = false
    }
  }

  return { data, loading, error, execute }
}
