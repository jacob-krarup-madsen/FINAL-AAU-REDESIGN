import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilteredCollection, type FilteredCollectionConfig } from '@/hooks';

interface SampleItem {
  id: number
  title: string
  code: string
  category: string
  weight: number
}

const SAMPLE: SampleItem[] = [
  { id: 1, title: 'Alpha Course', code: 'A001', category: 'Science', weight: 1 },
  { id: 2, title: 'Beta Course',  code: 'B002', category: 'Arts',    weight: 2 },
  { id: 3, title: 'Gamma Course', code: 'C003', category: 'Science', weight: 3 },
]

describe('useFilteredCollection', () => {
  const baseConfig: FilteredCollectionConfig<SampleItem> = {
    searchKeys: item => [item.title, item.code],
    filterKey:  item => item.category,
    filterDefault: null,
    filterOptions: items => Array.from(new Set(items.map(i => i.category))).sort(),
    sortComparator: (a, b, dir) =>
      dir === 'asc' ? a.weight - b.weight : b.weight - a.weight,
  }

  it('returns all items by default', () => {
    const { result } = renderHook(() => useFilteredCollection(SAMPLE, baseConfig))
    expect(result.current.items.map(i => i.id)).toEqual([1, 2, 3])
  })

  it('filters by searchQuery (title)', () => {
    const { result } = renderHook(() => useFilteredCollection(SAMPLE, baseConfig))
    act(() => { result.current.setSearchQuery('Alpha') })
    expect(result.current.items.map(i => i.id)).toEqual([1])
  })

  it('filters by searchQuery (code)', () => {
    const { result } = renderHook(() => useFilteredCollection(SAMPLE, baseConfig))
    act(() => { result.current.setSearchQuery('B002') })
    expect(result.current.items.map(i => i.id)).toEqual([2])
  })

  it('filters by activeFilter', () => {
    const { result } = renderHook(() => useFilteredCollection(SAMPLE, baseConfig))
    act(() => { result.current.setActiveFilter('Science') })
    expect(result.current.items.map(i => i.id)).toEqual([1, 3])
  })

  it('combines search and filter', () => {
    const { result } = renderHook(() => useFilteredCollection(SAMPLE, baseConfig))
    act(() => {
      result.current.setSearchQuery('Gamma')
      result.current.setActiveFilter('Science')
    })
    expect(result.current.items.map(i => i.id)).toEqual([3])
  })

  it('returns empty when nothing matches', () => {
    const { result } = renderHook(() => useFilteredCollection(SAMPLE, baseConfig))
    act(() => { result.current.setSearchQuery('ZZZNOMATCH') })
    expect(result.current.items).toEqual([])
  })

  it('sorts descending when sortDirection is desc', () => {
    const { result } = renderHook(() => useFilteredCollection(SAMPLE, baseConfig))
    act(() => { result.current.setSortDirection('desc') })
    expect(result.current.items.map(i => i.id)).toEqual([3, 2, 1])
  })

  it('exposes derived filterOptions', () => {
    const { result } = renderHook(() => useFilteredCollection(SAMPLE, baseConfig))
    expect(result.current.filterOptions).toEqual(['Arts', 'Science'])
  })

  it('works without filterKey (search-only mode)', () => {
    const cfg: FilteredCollectionConfig<SampleItem> = {
      searchKeys: item => [item.title],
    }
    const { result } = renderHook(() => useFilteredCollection(SAMPLE, cfg))
    act(() => { result.current.setSearchQuery('beta') })
    expect(result.current.items.map(i => i.id)).toEqual([2])
  })

  it('supports filterDefault all sentinel', () => {
    const cfg: FilteredCollectionConfig<SampleItem> = {
      searchKeys: item => [item.title],
      filterKey: item => item.category,
      filterDefault: 'all',
    }
    const { result } = renderHook(() => useFilteredCollection(SAMPLE, cfg))
    expect(result.current.items.length).toBe(3)
    act(() => { result.current.setActiveFilter('Arts') })
    expect(result.current.items.map(i => i.id)).toEqual([2])
    act(() => { result.current.setActiveFilter('all') })
    expect(result.current.items.length).toBe(3)
  })
})
