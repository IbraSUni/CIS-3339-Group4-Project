// Task F3: reusable DataTable (sorting, pagination, empty state)
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataTable from '../src/components/DataTable.vue'

const columns = [
  { label: 'Name', field: 'name' },
  { label: 'City', field: 'address.city' }
]
// 15 rows, names A..O in order, cities in reverse order
const rows = Array.from({ length: 15 }, (_, i) => ({
  _id: String(i),
  name: String.fromCharCode(65 + i),
  address: { city: String.fromCharCode(79 - i) }
}))

const firstCell = (wrapper) => wrapper.find('tbody tr td').text()
const footer = (wrapper) => wrapper.text().replace(/\s+/g, ' ')

describe('DataTable', () => {
  it('shows 10 rows per page with a count', () => {
    const wrapper = mount(DataTable, { props: { columns, rows } })
    expect(wrapper.findAll('tbody tr.data-row')).toHaveLength(10)
    expect(footer(wrapper)).toContain('Showing 1-10 of 15')
  })

  it('pages forward and back', async () => {
    const wrapper = mount(DataTable, { props: { columns, rows } })
    await wrapper.find('button[aria-label="Next page"]').trigger('click')
    expect(wrapper.findAll('tbody tr.data-row')).toHaveLength(5)
    expect(footer(wrapper)).toContain('Showing 11-15 of 15')
    expect(firstCell(wrapper)).toBe('K')
    await wrapper.find('button[aria-label="Previous page"]').trigger('click')
    expect(firstCell(wrapper)).toBe('A')
  })

  it('cycles sorting ascending, descending, then back to unsorted', async () => {
    const wrapper = mount(DataTable, { props: { columns, rows } })
    const cityHeader = wrapper.findAll('th button')[1]
    await cityHeader.trigger('click') // ascending by city
    expect(firstCell(wrapper)).toBe('O') // city 'A' belongs to name 'O'
    await cityHeader.trigger('click') // descending
    expect(firstCell(wrapper)).toBe('A')
    await cityHeader.trigger('click') // unsorted (original order)
    expect(firstCell(wrapper)).toBe('A')
    expect(wrapper.findAll('th')[1].attributes('aria-sort')).toBe('none')
  })

  it('shows the empty message when there are no rows', () => {
    const wrapper = mount(DataTable, { props: { columns, rows: [], emptyText: 'No clients match your search.' } })
    expect(wrapper.text()).toContain('No clients match your search.')
    expect(wrapper.find('button[aria-label="Next page"]').exists()).toBe(false)
  })

  it('returns to page 1 when new rows arrive (no stale rows after a search)', async () => {
    const wrapper = mount(DataTable, { props: { columns, rows } })
    await wrapper.find('button[aria-label="Next page"]').trigger('click')
    await wrapper.setProps({ rows: rows.slice(0, 3) })
    expect(wrapper.findAll('tbody tr.data-row')).toHaveLength(3)
    expect(footer(wrapper)).toContain('Showing 1-3 of 3')
  })

  it('emits row-click with the row on click and on Enter', async () => {
    const wrapper = mount(DataTable, { props: { columns, rows } })
    await wrapper.find('tbody tr.data-row').trigger('click')
    await wrapper.findAll('tbody tr.data-row')[1].trigger('keyup', { key: 'Enter' })
    expect(wrapper.emitted('row-click').map(([row]) => row.name)).toEqual(['A', 'B'])
  })
})
