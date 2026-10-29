// Formats an ISO date (as stored by MongoDB) as MM/DD/YYYY.
// UTC getters are used on purpose: event dates are saved as midnight UTC, and
// local getters would show the previous day for users west of Greenwich.
//
// This replaces four identical copies that lived inside home.vue,
// findevents.vue, clientdetails.vue and servicedetails.vue.
export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${month}/${day}/${date.getUTCFullYear()}`
}

// YYYY-MM-DD for <input type="date"> v-models.
export function toDateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().substring(0, 10)
}
