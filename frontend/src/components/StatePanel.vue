<!--
  Empty or error message for a list or dashboard section.
  variant 'error' is announced to screen readers (role="alert");
  variant 'empty' is a calm, neutral message.
  The default slot holds an optional action, e.g. a Retry button.
-->
<template>
  <div class="card flex flex-col items-center px-6 py-10 text-center" :class="variant === 'error' ? 'border-brand-200 bg-brand-50/40' : ''"
    :role="variant === 'error' ? 'alert' : 'status'">
    <span class="material-icons mb-3 text-4xl" :class="variant === 'error' ? 'text-brand-600' : 'text-zinc-400'"
      aria-hidden="true">{{ icon || (variant === 'error' ? 'cloud_off' : 'inbox') }}</span>
    <p class="font-semibold text-zinc-900">{{ title }}</p>
    <p v-if="message" class="mt-1 max-w-md text-sm text-zinc-600">{{ message }}</p>
    <div v-if="$slots.default" class="mt-5">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'empty' }, // 'empty' | 'error'
  title: { type: String, required: true },
  message: { type: String, default: '' },
  icon: { type: String, default: '' } // Material Icons name
})
</script>
