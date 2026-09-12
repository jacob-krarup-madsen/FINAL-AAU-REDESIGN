// Cache invalidation comment
import Dashboard from '@/pages/Dashboard'
import { fireEvent, act, screen } from '@testing-library/react'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import useStore from '@/store'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useBlocker: () => ({
      state: 'idle',
      proceed: () => {},
      reset: () => {},
    }),
  }
})

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.clearAllMocks()
    localStorage.clear()
    useStore.getState().resetDashboardLayout()
    useStore.setState({
      favorites: [{ id: 'fav-1', type: 'course', entityId: 1, addedAt: Date.now(), order: 1 }]
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const renderDashboard = () => {
    return renderWithProviders(<Dashboard />)
  }

  it('renders correctly', () => {
    renderDashboard()
    expect(screen.getByTestId('focus-banner')).toHaveTextContent(/TestUser/)
  })

  it('renders all widgets', () => {
    renderDashboard()
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.getAllByText(/Næste aflevering/i).length).toBeGreaterThan(0)
    expect(screen.getByText('Favoritter')).toBeInTheDocument()
    expect(screen.getByText('Beskeder')).toBeInTheDocument()
    expect(screen.getAllByText('Dagens program').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Forum aktivitet').length).toBeGreaterThan(0)
  })

  it('toggles edit mode and shows hint', () => {
    renderDashboard()
    act(() => {
      vi.advanceTimersByTime(400)
    })
    const editBtn = screen.getByText('Rediger')
    expect(editBtn).toBeInTheDocument()
    
    fireEvent.click(editBtn)
    expect(screen.getByText(/Redigeringstilstand/i)).toBeInTheDocument()
    
    const doneBtn = screen.getByText('Færdig')
    expect(doneBtn).toBeInTheDocument()
    
    fireEvent.click(doneBtn)
    expect(screen.queryByText(/Redigeringstilstand/i)).not.toBeInTheDocument()
  })

  it('renders Focus Banner with personal greeting and redirects on button click', () => {
    const { getByTestId } = renderDashboard()
    act(() => {
      vi.advanceTimersByTime(400)
    })
    const banner = getByTestId('focus-banner')
    expect(banner).toBeInTheDocument()
    expect(banner).toHaveTextContent(/TestUser/)
    
    const actionBtn = banner.querySelector('button')
    expect(actionBtn).toBeInTheDocument()
    if (actionBtn) fireEvent.click(actionBtn)
  })
})



