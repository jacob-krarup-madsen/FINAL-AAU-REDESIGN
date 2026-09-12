import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { QuickOverviewWidget } from '@/components/Widgets';
import { todayEvents } from '@/lib/data';
import { renderWithProviders } from '@/__tests__/setup/test-utils';
import useStore from '@/store';

const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('QuickOverviewWidget', () => {
  const originalEvents = [...todayEvents]

  beforeEach(() => {
    vi.clearAllMocks()
    useStore.setState({ lang: 'da' })
    // Reset todayEvents to original state
    todayEvents.length = 0
    todayEvents.push(...originalEvents)
  })

  afterEach(() => {
    todayEvents.length = 0
    todayEvents.push(...originalEvents)
  })

  it('renders today events', () => {
    renderWithProviders(<QuickOverviewWidget />)
    expect(screen.getAllByText('Dagens program')[0]).toBeInTheDocument()
    expect(screen.getByText('08:15')).toBeInTheDocument()
    expect(screen.getByText(/Forelæsning/i)).toBeInTheDocument()
    expect(screen.getByText('23:59')).toBeInTheDocument()
    expect(screen.getByText(/Projektrapport skal afleveres/i)).toBeInTheDocument()
    expect(screen.getByText('Undervisning')).toBeInTheDocument()
    expect(screen.getByText('Studiegruppe')).toBeInTheDocument()
  })

  it('navigates to calendar when link is clicked', () => {
    renderWithProviders(<QuickOverviewWidget />)
    const link = screen.getByText(/Se kalender/i)
    fireEvent.click(link)
    expect(mockNavigate).toHaveBeenCalledWith('/calendar')
  })

  it('renders correct number of interactive items', () => {
    const { container } = renderWithProviders(<QuickOverviewWidget />)
    const items = container.querySelectorAll('[role="button"]')
    // 3 event items = 3 total role=button elements
    expect(items.length).toBe(3)
  })

  it('renders room-based tags correctly based on todayEvents mock in Danish', () => {
    todayEvents.length = 0
    todayEvents.push(
      { time: '10:00', titleKey: 'lecture', moduleKey: 'course_1_title', location: 'Room 1' },
      { time: '23:59', titleKey: 'project_report', moduleKey: 'course_4_title' }
    )

    useStore.setState({ lang: 'da' })
    renderWithProviders(<QuickOverviewWidget />)
    expect(screen.getByText('Undervisning')).toBeInTheDocument()
    expect(screen.getByText('Aflevering')).toBeInTheDocument()
  })

  it('renders room-based tags correctly based on todayEvents mock in English', () => {
    todayEvents.length = 0
    todayEvents.push(
      { time: '10:00', titleKey: 'lecture', moduleKey: 'course_1_title', location: 'Room 1' },
      { time: '23:59', titleKey: 'project_report', moduleKey: 'course_4_title' }
    )

    useStore.setState({ lang: 'en' })
    renderWithProviders(<QuickOverviewWidget />)
    expect(screen.getByText('Class')).toBeInTheDocument()
    expect(screen.getByText('Submission')).toBeInTheDocument()
  })
})
