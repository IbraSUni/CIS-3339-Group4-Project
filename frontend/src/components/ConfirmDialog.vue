<!--
  App-wide confirmation dialog (mounted once in App.vue, opened with useConfirm()).
  - Teleported to <body> so it sits above every layout.
  - Focus moves to the Cancel button when it opens (the safe choice for
    destructive actions), Tab stays inside the dialog, Escape cancels, and
    focus returns to the element that opened it.
-->
<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="state.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-zinc-900/50" @click="confirmCancel"></div>
        <div ref="panel" role="alertdialog" aria-modal="true" :aria-labelledby="titleId" :aria-describedby="messageId"
          class="dialog-panel card relative w-full max-w-md p-6" @keydown="onKeydown">
          <div class="flex gap-4">
            <span class="material-icons mt-0.5 text-2xl" :class="state.danger ? 'text-brand-600' : 'text-zinc-500'"
              aria-hidden="true">{{ state.danger ? 'warning' : 'help_outline' }}</span>
            <div>
              <h2 :id="titleId" class="text-lg font-semibold text-zinc-900">{{ state.title }}</h2>
              <p v-if="state.message" :id="messageId" class="mt-2 text-sm text-zinc-600">{{ state.message }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button ref="cancelButton" type="button" class="btn btn-secondary" @click="confirmCancel">
              {{ state.cancelLabel }}
            </button>
            <button type="button" class="btn" :class="state.danger ? 'btn-danger-solid' : 'btn-primary'"
              @click="confirmAccept">
              {{ state.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { confirmState as state, confirmAccept, confirmCancel } from '../composables/useConfirm'

const titleId = 'confirm-dialog-title'
const messageId = 'confirm-dialog-message'
const panel = ref(null)
const cancelButton = ref(null)
let returnFocusTo = null

watch(
  () => state.open,
  async (open) => {
    if (open) {
      returnFocusTo = document.activeElement
      await nextTick()
      cancelButton.value?.focus()
    } else if (returnFocusTo && typeof returnFocusTo.focus === 'function') {
      returnFocusTo.focus()
      returnFocusTo = null
    }
  }
)

// Escape cancels; Tab / Shift+Tab cycle between the dialog's buttons only.
function onKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    confirmCancel()
    return
  }
  if (event.key !== 'Tab') return
  const focusable = panel.value?.querySelectorAll('button') ?? []
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 150ms ease;
}

.dialog-enter-active .dialog-panel,
.dialog-leave-active .dialog-panel {
  transition: transform 150ms ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-panel,
.dialog-leave-to .dialog-panel {
  transform: translateY(8px) scale(0.98);
}
</style>
