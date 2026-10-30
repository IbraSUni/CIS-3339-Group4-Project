// ConfirmDialog behaviour through the useConfirm() composable
import { describe, it, expect } from 'vitest'
import { useConfirm, confirmState, confirmAccept, confirmCancel } from '../src/composables/useConfirm'

describe('useConfirm', () => {
  it('opens the dialog and resolves true when confirmed', async () => {
    const confirm = useConfirm()
    const answer = confirm({ title: 'Delete client?', confirmLabel: 'Delete Client', danger: true })
    expect(confirmState.open).toBe(true)
    expect(confirmState.title).toBe('Delete client?')
    expect(confirmState.danger).toBe(true)
    confirmAccept()
    await expect(answer).resolves.toBe(true)
    expect(confirmState.open).toBe(false)
  })

  it('resolves false when cancelled', async () => {
    const answer = useConfirm()({ title: 'Remove from event?' })
    confirmCancel()
    await expect(answer).resolves.toBe(false)
  })

  it('cancels an open request when a new one starts', async () => {
    const confirm = useConfirm()
    const first = confirm({ title: 'First' })
    const second = confirm({ title: 'Second' })
    await expect(first).resolves.toBe(false)
    expect(confirmState.title).toBe('Second')
    confirmAccept()
    await expect(second).resolves.toBe(true)
  })
})
