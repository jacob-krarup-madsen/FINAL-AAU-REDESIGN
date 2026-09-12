import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '@/components/Layout';
import useStore from '@/store';

describe('Sidebar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useStore.setState({
      isCollapsed: false,
      lang: 'da',
      theme: 'light',
      isDarkMode: false,
      t: (key: string) => {
        if (key === 'aau_logo_center_src') {
          return useStore.getState().lang === 'da'
            ? '/images/logos/aau-center-white.webp'
            : '/images/logos/aau-center-white-uk.webp'
        }
        if (key === 'aau_logo_left_src') {
          return useStore.getState().lang === 'da'
            ? '/images/logos/aau-left-white.webp'
            : '/images/logos/aau-left-white-uk.webp'
        }
        return key
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders navigation items', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )
    expect(screen.getByText('dashboard')).toBeDefined()
    expect(screen.getByText('calendar')).toBeDefined()
    expect(screen.getByText('courses')).toBeDefined()
    expect(screen.getByText('resources')).toBeDefined()
    expect(screen.getByText('contact_its_support')).toBeDefined()
  })

  it('applies collapsed class when isCollapsed is true', () => {
    useStore.setState({ isCollapsed: true })
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )
    const aside = container.querySelector('aside')
    expect(aside?.getAttribute('data-collapsed')).toBe('true')
  })

  it('changes logo based on language', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )
    const logo = screen.getByAltText('aau_logo_alt')
    expect(logo.getAttribute('src')).toContain('aau-left-white.webp')
  })

  it('renders collapsed logo (symbol)', () => {
    useStore.setState({ isCollapsed: true, lang: 'da' })
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )
    const logo = screen.getByAltText('aau_logo_alt')
    expect(logo.getAttribute('src')).toContain('aau-center-white.webp')
  })

  it('renders collapsed EN logo', () => {
    useStore.setState({ isCollapsed: true, lang: 'en' })
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )
    const logo = screen.getByAltText('aau_logo_alt')
    expect(logo.getAttribute('src')).toContain('aau-center-white-uk.webp')
  })

  it('renders expanded EN logo', () => {
    useStore.setState({ isCollapsed: false, lang: 'en' })
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )
    const logo = screen.getByAltText('aau_logo_alt')
    expect(logo.getAttribute('src')).toContain('aau-left-white-uk.webp')
  })
})
