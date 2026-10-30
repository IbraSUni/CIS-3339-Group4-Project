// useConfirm: promise-based confirmation dialog that replaces window.confirm().
//
//   const confirm = useConfirm()
//   if (!(await confirm({ title: 'Delete client?', message: '...', confirmLabel: 'Delete', danger: true }))) return
//
// There is one dialog for the whole app (<ConfirmDialog /> is mounted once in
// App.vue). This module holds its state, so any view can open it.
import { reactive, readonly } from 'vue'

const state = reactive({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: false
})

let resolver = null

function settle(result) {
  state.open = false
  const resolve = resolver
  resolver = null
  if (resolve) resolve(result)
}

function ask(options = {}) {
  // A second request while one is open cancels the first.
  if (resolver) settle(false)
  Object.assign(state, {
    title: options.title || 'Are you sure?',
    message: options.message || '',
    confirmLabel: options.confirmLabel || 'Confirm',
    cancelLabel: options.cancelLabel || 'Cancel',
    danger: Boolean(options.danger),
    open: true
  })
  return new Promise((resolve) => {
    resolver = resolve
  })
}

// Used by ConfirmDialog.vue
export const confirmState = readonly(state)
export const confirmAccept = () => settle(true)
export const confirmCancel = () => settle(false)

export function useConfirm() {
  return ask
}
