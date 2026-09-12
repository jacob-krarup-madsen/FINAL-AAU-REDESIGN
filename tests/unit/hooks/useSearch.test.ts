import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { useSearch, type SearchResult } from '@/hooks';
import useStore from '@/store';

describe('useSearch', () => {
  beforeEach(() => {
    useStore.setState({
      t: (key: string) => key,
      localize: (item: any, field?: string) => String(item[field ?? ''] ?? ''),
    })
  })

  it('has empty default state when no query param', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(MemoryRouter, { initialEntries: ['/'] }, children)
    const { result } = renderHook(() => useSearch(), { wrapper: Wrapper })
    expect(result.current.query).toBe('')
    expect(result.current.results).toEqual([])
    expect(result.current.filteredResults).toEqual([])
    expect(result.current.activeFilter).toBe('all')
    expect(result.current.categories).toEqual(['all'])
  })

  it('filters results matching search query from URL', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(MemoryRouter, { initialEntries: ['/?q=Digital'] }, children)
    const { result } = renderHook(() => useSearch(), { wrapper: Wrapper })
    expect(result.current.results.length).toBeGreaterThan(0)
    result.current.results.forEach(r => {
      const matchesLabel = r.label.toLowerCase().includes('digital')
      const matchesDesc = r.description.toLowerCase().includes('digital')
      const matchesCode = (r.code ?? '').toLowerCase().includes('digital')
      const matchesProf = (r.professor ?? '').toLowerCase().includes('digital')
      expect(matchesLabel || matchesDesc || matchesCode || matchesProf).toBe(true)
    })
  })

  it('filters by category with activeFilter', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(MemoryRouter, { initialEntries: ['/?q=Digital'] }, children)
    const { result } = renderHook(() => useSearch(), { wrapper: Wrapper })
    const allResults = [...result.current.results]

    act(() => { result.current.setActiveFilter('pages') })
    expect(result.current.filteredResults.length).toBeLessThan(allResults.length)
    result.current.filteredResults.forEach(r => {
      expect(r.group.toLowerCase()).toBe('pages')
    })
  })

  it('returns empty results when query matches nothing', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(MemoryRouter, { initialEntries: ['/?q=zzzz_nonexistent'] }, children)
    const { result } = renderHook(() => useSearch(), { wrapper: Wrapper })
    expect(result.current.results).toEqual([])
    expect(result.current.filteredResults).toEqual([])
  })

  it('getActionLabel returns correct label for each group', () => {
    const courseResult: SearchResult = { label: 'Course', path: '/c', icon: 'Book' as any, group: 'courses', description: 'd' }
    const pageResult: SearchResult = { label: 'Dashboard', path: '/', icon: 'Book' as any, group: 'pages', description: 'd' }
    const fallbackResult: SearchResult = { label: 'Other', path: '/o', icon: 'Book' as any, group: 'custom', description: 'd' }

    const Wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(MemoryRouter, { initialEntries: ['/'] }, children)
    const { result } = renderHook(() => useSearch(), { wrapper: Wrapper })

    expect(result.current.getActionLabel(courseResult)).toBe('go_to_course')
    expect(result.current.getActionLabel(pageResult)).toBe('open Dashboard')
    expect(result.current.getActionLabel(fallbackResult)).toBe('go_to_content')
  })

  it('categories include all plus unique groups from results', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(MemoryRouter, { initialEntries: ['/?q=a'] }, children)
    const { result } = renderHook(() => useSearch(), { wrapper: Wrapper })
    expect(result.current.categories[0]).toBe('all')
    expect(result.current.categories.length).toBeGreaterThanOrEqual(2)
  })
})
