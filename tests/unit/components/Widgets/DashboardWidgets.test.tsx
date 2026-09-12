import { vi, describe, beforeEach, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  DeadlinesWidget,
  FavoritesWidget
} from '@/components/Widgets';
import { renderWithProviders } from '@/__tests__/setup/test-utils';
import useStore from '@/store';
import { mockDashboardDeadlines } from '@/lib/data';
import { resolveFavorite } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('@/lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/utils')>()
  return {
    ...actual,
    resolveFavorite: vi.fn(),
    sortFavorites: vi.fn((f) => f),
  }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('DeadlinesWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useStore.setState({ lang: 'da' })
  })
  it('renders correctly', () => {
    renderWithProviders(<DeadlinesWidget size="large" />)
    expect(screen.getByText('Næste afleveringer')).toBeInTheDocument()
    expect(screen.getByText('To-Do App')).toBeInTheDocument()
    expect(screen.getByText('Designskitse')).toBeInTheDocument()
    expect(screen.getByText('Analyseopgave')).toBeInTheDocument()
  })
  it('navigates to submission when item is clicked', () => {
    renderWithProviders(<DeadlinesWidget />)
    fireEvent.click(screen.getByText('To-Do App'))
    expect(mockNavigate).toHaveBeenCalledWith('/submission/2/204')
  })
  it('navigates to calendar when header button is clicked', () => {
    renderWithProviders(<DeadlinesWidget />)
    fireEvent.click(screen.getAllByText(/Se alle/i)[0])
    expect(mockNavigate).toHaveBeenCalledWith('/calendar')
  })
  it('renders correctly in English', () => {
    useStore.setState({ lang: 'en' })
    renderWithProviders(<DeadlinesWidget />)
    expect(screen.getAllByText(/In \d+ days/i)[0]).toBeInTheDocument()
  })
  it('handles past deadline urgency color', () => {
    const orig = [...mockDashboardDeadlines]
    mockDashboardDeadlines[0] = { ...mockDashboardDeadlines[0], deadlineHoursFromNow: -24 }
    renderWithProviders(<DeadlinesWidget />)
    const matches = screen.getAllByText(/Overskredet/i)
    const visibleEl = matches.find(el => !el.className.includes('sr-only'))
    expect(visibleEl).toHaveClass('text-danger')
    mockDashboardDeadlines.splice(0, mockDashboardDeadlines.length, ...orig)
  })
  it('handles overdue deadlines', () => {
    const orig = [...mockDashboardDeadlines]
    mockDashboardDeadlines[0] = { ...mockDashboardDeadlines[0], deadlineHoursFromNow: -24 }
    renderWithProviders(<DeadlinesWidget />)
    const button = screen.getByRole('button', { name: /To-Do App/i })
    expect(button.className).toContain('bg-danger/5')
    mockDashboardDeadlines.splice(0, mockDashboardDeadlines.length, ...orig)
  })
  it('renders empty state when there are no deadlines', () => {
    useStore.setState({ lang: 'en' })
    const orig = [...mockDashboardDeadlines]
    mockDashboardDeadlines.splice(0, mockDashboardDeadlines.length)
    renderWithProviders(<DeadlinesWidget />)
    expect(screen.getByText(/caught up/i)).toBeInTheDocument()
    mockDashboardDeadlines.push(...orig)
  })
})

describe('FavoritesWidget', () => {
  const mockCourses = [
    { id: 1, title: 'Course 1', titleEn: 'Course 1', sections: [], status: 'active', label: 'Course 1', labelEn: 'Course 1', img: '' },
  ] as any
  const mockFavorites = [
    { id: 'fav1', type: 'course', entityId: 1, order: 0, addedAt: Date.now() },
  ] as any
  const mockResolvedCourse = {
    id: 'fav1', type: 'course' as const, entityId: 1, title: 'Course 1', icon: BookOpen, iconBg: 'blue', iconColor: 'white', link: '/course/1',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useStore.setState({ lang: 'da', favorites: mockFavorites, courses: mockCourses })
    const resolveFav = resolveFavorite as any
    vi.mocked(resolveFav).mockImplementation((fav: any) => ({ ...mockResolvedCourse, id: fav?.id || 'fav1' }))
  })

  it('renders favorites correctly', () => {
    render(<MemoryRouter><FavoritesWidget /></MemoryRouter>)
    expect(screen.getByText('Course 1')).toBeInTheDocument()
  })
  it('navigates to favorites page when see_all is clicked', () => {
    render(<MemoryRouter><FavoritesWidget /></MemoryRouter>)
    fireEvent.click(screen.getAllByText(/Se alle favoritter/i)[0])
    expect(mockNavigate).toHaveBeenCalledWith('/favorites')
  })
  it('renders empty state when no favorites', () => {
    useStore.setState({ favorites: [] })
    const resolveFav = resolveFavorite as any
    vi.mocked(resolveFav).mockReturnValue(null)
    render(<MemoryRouter><FavoritesWidget /></MemoryRouter>)
    expect(screen.getByText(/Ingen favoritter endnu/i)).toBeInTheDocument()
  })
  it('shows overflow message when more than 12 favorites', () => {
    const manyFavorites = Array.from({ length: 15 }, (_, i) => ({ id: `fav${i}`, type: 'course', entityId: i, order: i, addedAt: Date.now() })) as any
    useStore.setState({ favorites: manyFavorites, courses: mockCourses })
    render(<MemoryRouter><FavoritesWidget /></MemoryRouter>)
    expect(screen.getByText(/flere favoritter/i)).toBeInTheDocument()
  })
  it('handles external links', () => {
    const windowSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const resolveFav = resolveFavorite as any
    vi.mocked(resolveFav).mockReturnValue({ ...mockResolvedCourse, title: 'External Tool', link: 'https://example.com', external: true })
    render(<MemoryRouter><FavoritesWidget /></MemoryRouter>)
    fireEvent.click(screen.getByText('External Tool'))
    expect(windowSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer')
  })
})
