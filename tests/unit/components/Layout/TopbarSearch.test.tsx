import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/setup/test-utils';
import { TopbarSearch } from '@/components/Layout';
import useStore from '@/store';
import { courseList } from '@/lib/data';

describe('TopbarSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    // Reset store to defaults to prevent test pollution
    const coursesWithStatus = courseList.map((course: any) => ({
      ...course,
      status: course.tab === 'finished' ? 'inactive' : (course.tab === 'upcoming' ? 'upcoming' : 'active'),
    }))
    useStore.setState({
      courses: coursesWithStatus,
      lang: 'da',
      favorites: [],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders desktop search input', () => {
    const { container } = renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const wrapper = container.querySelector('.topbar__search-wrapper')
    expect(wrapper).toBeInTheDocument()
  })

  it('renders children', () => {
    renderWithProviders(<TopbarSearch><span data-testid="child">Child</span></TopbarSearch>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('shows dropdown on input change', async () => {
    renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const input = screen.getByRole('combobox')
    await fireEvent.change(input, { target: { value: 'Algoritmer' } })
    act(() => {
      vi.runAllTimers()
    })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('shows results matching search query', async () => {
    renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const input = screen.getByRole('combobox')
    await fireEvent.change(input, { target: { value: 'Digital' } })
    act(() => {
      vi.runAllTimers()
    })
    const items = screen.getAllByRole('option')
    expect(items.length).toBeGreaterThan(0)
  })

  it('shows empty state when no results match', async () => {
    renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const input = screen.getByRole('combobox')
    await fireEvent.change(input, { target: { value: 'zzzznotfoundxxxx' } })
    act(() => {
      vi.runAllTimers()
    })
    expect(screen.getByText('Ingen resultater')).toBeInTheDocument()
  })

  it('shows result count in dropdown header', async () => {
    renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const input = screen.getByRole('combobox')
    await fireEvent.change(input, { target: { value: 'Digital' } })
    act(() => {
      vi.runAllTimers()
    })
    expect(screen.getByText(/1 resultat/i)).toBeInTheDocument()
  })

  it('closes dropdown on Escape', async () => {
    renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const input = screen.getByRole('combobox')
    await fireEvent.change(input, { target: { value: 'Algoritmer' } })
    act(() => {
      vi.runAllTimers()
    })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('navigates with ArrowDown and ArrowUp', async () => {
    renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const input = screen.getByRole('combobox')
    await fireEvent.change(input, { target: { value: 'dig' } })
    act(() => {
      vi.runAllTimers()
    })
    const options = () => screen.getAllByRole('option')
    const count = options().length
    expect(count).toBeGreaterThan(0)

    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(options()[0]).toHaveAttribute('aria-selected', 'true')

    await fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(options()[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('closes dropdown on outside click', async () => {
    renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const input = screen.getByRole('combobox')
    await fireEvent.change(input, { target: { value: 'Algoritmer' } })
    act(() => {
      vi.runAllTimers()
    })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('renders all results button in dropdown', async () => {
    renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const input = screen.getByRole('combobox')
    await fireEvent.change(input, { target: { value: 'Digital' } })
    act(() => {
      vi.runAllTimers()
    })
    expect(screen.getByText(/Alle resultater/i)).toBeInTheDocument()
  })

  it('navigates on Enter with active index', async () => {
    renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const input = screen.getByRole('combobox')
    await fireEvent.change(input, { target: { value: 'Digital' } })
    act(() => {
      vi.runAllTimers()
    })
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('highlights result on hover', async () => {
    renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const input = screen.getByRole('combobox')
    await fireEvent.change(input, { target: { value: 'Digital' } })
    act(() => {
      vi.runAllTimers()
    })
    const option = screen.getByRole('option', { name: /Digital Design og Kommunikation/i })
    fireEvent.mouseEnter(option)
    expect(option).toHaveAttribute('aria-selected', 'true')
  })

  it('does not move ArrowDown past last result', async () => {
    renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const input = screen.getByRole('combobox')
    await fireEvent.change(input, { target: { value: 'dig' } })
    act(() => {
      vi.runAllTimers()
    })
    const options = () => screen.getAllByRole('option')
    const count = options().length

    for (let i = 0; i < count + 5; i++) {
      await fireEvent.keyDown(input, { key: 'ArrowDown' })
    }
    expect(options()[count - 1]).toHaveAttribute('aria-selected', 'true')
  })

  it('does not move ArrowUp past -1', async () => {
    renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const input = screen.getByRole('combobox')
    await fireEvent.change(input, { target: { value: 'dig' } })
    act(() => {
      vi.runAllTimers()
    })
    await fireEvent.keyDown(input, { key: 'ArrowUp' })
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    await fireEvent.keyDown(input, { key: 'ArrowUp' })
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('sets aria-activedescendant to undefined when no active index', () => {
    renderWithProviders(<TopbarSearch>Child</TopbarSearch>)
    const input = screen.getByRole('combobox')
    expect(input).not.toHaveAttribute('aria-activedescendant')
  })

  it('collapses search into trigger button on mobile', () => {
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    window.dispatchEvent(new Event('resize'));

    renderWithProviders(<TopbarSearch>Child</TopbarSearch>);
    expect(screen.getByLabelText('search')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('search'));
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth });
  })
})
