import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TableSkeleton from '../src/components/TableSkeleton.vue';

describe('TableSkeleton Component', () => {
  it('renders the default number of rows and label', () => {
    const wrapper = mount(TableSkeleton);
    
    const rows = wrapper.findAll('.flex');
    expect(rows.length).toBe(7);
    
    expect(wrapper.attributes('aria-label')).toBe('Loading');
  });

  it('accepts and renders custom props', () => {
    const wrapper = mount(TableSkeleton, {
      props: { rows: 2, columns: 4, label: 'Fetching data' }
    });
    

    const rows = wrapper.findAll('.flex');
    expect(rows.length).toBe(3);
    

    expect(wrapper.attributes('aria-label')).toBe('Fetching data');
  });
});