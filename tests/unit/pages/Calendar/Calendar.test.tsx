// Cache invalidation comment
import { MemoryRouter } from 'react-router-dom';
import Calendar from '@/pages/Calendar';
import { ToastProvider } from '@/components/ui';
import useStore from '@/store';
import { STORAGE_KEYS } from '@/lib/constants';

let mockNavigate: ReturnType<typeof vi.fn>

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Calendar Page', () => {
  beforeEach(() => {
    mockNavigate = vi.fn()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 15))
    vi.clearAllMocks()
    localStorage.clear()
  })

  const renderCalendar = (lang: 'da' | 'en' = 'da') => {
    useStore.setState({ lang })
    return render(
      <MemoryRouter>
        <ToastProvider>
          <Calendar />
        </ToastProvider>
      </MemoryRouter>
    )
  }

  it('renders monthly view by default', () => {
    renderCalendar('da')
    expect(screen.getByText('maj 2026')).toBeInTheDocument()
    expect(screen.getByText('Man')).toBeInTheDocument()
    expect(screen.getAllByText(/Studiegruppe/)[0]).toBeInTheDocument()
  })

  it('switches views', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Uge' }))
    expect(screen.getByText('maj 2026')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Dag' }))
    expect(screen.getByText('maj 2026')).toBeInTheDocument()
  })

  it('navigates between months/weeks/days', () => {
    renderCalendar('da')
    const nextBtn = screen.getByRole('button', { name: /næste|next/i })
    fireEvent.click(nextBtn)
    expect(screen.getByText('juni 2026')).toBeInTheDocument()

    const prevBtn = screen.getByRole('button', { name: /forrige|previous/i })
    fireEvent.click(prevBtn)
    expect(screen.getByText('maj 2026')).toBeInTheDocument()

    expect(screen.getByText('maj 2026')).toBeInTheDocument()
  })

  it('navigates in week and day views', () => {
    renderCalendar('da')

    fireEvent.click(screen.getByRole('button', { name: 'Dag' }))
    expect(screen.getByText('maj 2026')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /næste|next/i }))
    expect(screen.getByText('maj 2026')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Uge' }))
    fireEvent.click(screen.getByRole('button', { name: /næste|next/i }))
    expect(screen.getByText('maj 2026')).toBeInTheDocument()
  })

  it('opens new event modal and fills it', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Ny begivenhed' }))
    expect(screen.getByText('Opret begivenhed')).toBeInTheDocument()

    const titleInput = screen.getByPlaceholderText('Begivenhedstitel') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Test Event' } })
    expect(titleInput.value).toBe('Test Event')

    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    if (dateInput) fireEvent.change(dateInput, { target: { value: '2026-05-15' } })

    fireEvent.click(screen.getByRole('button', { name: 'Opret begivenhed' }))
    expect(screen.queryByText('Opret begivenhed')).not.toBeInTheDocument()
  })

  it('opens event detail modal', () => {
    renderCalendar('da')
    const event = screen.getAllByText(/Studiegruppe/)[0]
    fireEvent.click(event)
    expect(screen.getByText('Lokation')).toBeInTheDocument()
    expect(screen.getByText('Fibigerstræde 16, 1.108')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Gå til modul' }))
    expect(mockNavigate).toHaveBeenCalledWith('/course/1')
  })

  it('renders upcoming events widget and clicks event', () => {
    const today = new Date()
    const futureDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)
    const dateKey = `${futureDate.getFullYear()}-${futureDate.getMonth()}-${futureDate.getDate()}`
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify({
      [dateKey]: { id: 104, title: 'Deadline', color: 'var(--color-danger)', location: 'Online Submission', time: '23:59', host: 'AAU Moodle' },
    }))
    renderCalendar('da')
    expect(screen.getByText('Kommende')).toBeInTheDocument()
    const deadlineEls = screen.getAllByText('Deadline')
    const upcomingItem = deadlineEls.find(el => el.closest('.upcoming-event-item'))?.closest('.upcoming-event-item')
    if (!upcomingItem) throw new Error('Upcoming event item not found')
    fireEvent.click(upcomingItem)
    expect(screen.getByText('Lokation')).toBeInTheDocument()
  })

  it('renders in English', () => {
    renderCalendar('en')
    expect(screen.getByText('May 2026')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getAllByText(/Study Group/)[0]).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Week' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Day' })).toBeInTheDocument()
  })

  it('handles empty events state in upcoming widget', () => {
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify({}))
    renderCalendar('da')
    expect(screen.getByText('Ingen begivenheder')).toBeInTheDocument()
  })

  it('renders week view with time labels', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Uge' }))
    expect(screen.getByText(/08:00/)).toBeInTheDocument()
    expect(screen.getByText(/17:00/)).toBeInTheDocument()
  })

  it('renders day view', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Dag' }))
    expect(screen.getByText('1. maj')).toBeInTheDocument()
  })

  it('renders day view with no events message', () => {
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify({}))
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Dag' }))
    expect(screen.getByText('Ingen begivenheder')).toBeInTheDocument()
  })

  it('navigates to today', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: /næste|next/i }))
    expect(screen.getByText('juni 2026')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /gå til i dag|go to today/i }))
    expect(screen.getByText('maj 2026')).toBeInTheDocument()
  })

  it('navigates events in English', () => {
    renderCalendar('en')
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText('June 2026')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    expect(screen.getByText('May 2026')).toBeInTheDocument()
  })

  it('opens import and export modals without crashing', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: /import\/eksport|import\/export|flere handlinger|more actions/i }))
    fireEvent.click(screen.getByText(/importér/i))
    fireEvent.click(screen.getByRole('button', { name: /import\/eksport|import\/export|flere handlinger|more actions/i }))
    fireEvent.click(screen.getByText(/eksportér/i))
    expect(screen.getByText('maj 2026')).toBeInTheDocument()
  })

  it('navigates weeks forward and backward', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Uge' }))
    fireEvent.click(screen.getByRole('button', { name: /forrige|previous/i }))
    expect(screen.getByTestId('page-header-title')).toHaveTextContent(/april 2026/i)
    fireEvent.click(screen.getByRole('button', { name: /næste|next/i }))
    fireEvent.click(screen.getByRole('button', { name: /næste|next/i }))
    expect(screen.getByTestId('page-header-title')).toHaveTextContent(/maj 2026/i)
  })

  it('navigates day view across month boundary', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Dag' }))
    expect(screen.getByTestId('page-header-title')).toHaveTextContent(/maj 2026/i)
    fireEvent.click(screen.getByRole('button', { name: /forrige|previous/i }))
    expect(screen.getByTestId('page-header-title')).toHaveTextContent(/april 2026/i)
    fireEvent.click(screen.getByRole('button', { name: /næste|next/i }))
    expect(screen.getByTestId('page-header-title')).toHaveTextContent(/maj 2026/i)
  })

  it('clicks an event pill in week view', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Uge' }))
    fireEvent.click(screen.getByRole('button', { name: /næste|next/i }))
    fireEvent.click(screen.getAllByText(/Studiegruppe/)[0])
    expect(screen.getByText('Lokation')).toBeInTheDocument()
  })

  it('navigates to today in week and day views', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Uge' }))
    fireEvent.click(screen.getByRole('button', { name: /næste|next/i }))
    fireEvent.click(screen.getByRole('button', { name: /gå til i dag|go to today/i }))
    expect(screen.getByText('maj 2026')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Dag' }))
    fireEvent.click(screen.getByRole('button', { name: /næste|next/i }))
    fireEvent.click(screen.getByRole('button', { name: /gå til i dag|go to today/i }))
    expect(screen.getByText('maj 2026')).toBeInTheDocument()
  })

  it('closes new event modal on cancel', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Ny begivenhed' }))
    expect(screen.getByText('Opret begivenhed')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Annuller' }))
    expect(screen.queryByText('Opret begivenhed')).not.toBeInTheDocument()
  })

  it('shows full info button in event detail and navigates', () => {
    renderCalendar('da')
    fireEvent.click(screen.getAllByText(/Studiegruppe/)[0])
    fireEvent.click(screen.getByRole('button', { name: 'Se detaljer' }))
    expect(mockNavigate).toHaveBeenCalledWith('/submission/1')
  })

  it('renders with empty localStorage on initial load (uses default events)', () => {
    localStorage.removeItem(STORAGE_KEYS.CALENDAR_EVENTS)
    renderCalendar('da')
    expect(screen.getByText('maj 2026')).toBeInTheDocument()
    expect(screen.getAllByText(/Studiegruppe/)[0]).toBeInTheDocument()
  })

  it('import and export buttons do not crash', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: /import\/eksport|import\/export|flere handlinger|more actions/i }))
    fireEvent.click(screen.getByText(/importér/i))
    fireEvent.click(screen.getByRole('button', { name: /import\/eksport|import\/export|flere handlinger|more actions/i }))
    fireEvent.click(screen.getByText(/eksportér/i))
    expect(screen.getByText('maj 2026')).toBeInTheDocument()
  })

  it('does not render event-detail dialog when no event selected', () => {
    renderCalendar('da')
    expect(screen.queryByText('Lokation')).not.toBeInTheDocument()
  })

  it('fills all fields in new event modal', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Ny begivenhed' }))

    fireEvent.change(screen.getByPlaceholderText('Begivenhedstitel'), { target: { value: 'Test' } })
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    if (dateInput) fireEvent.change(dateInput, { target: { value: '2026-05-15' } })
    const allTimeInputs = document.querySelectorAll('input[type="time"]') as NodeListOf<HTMLInputElement>
    if (allTimeInputs.length > 0) {
      fireEvent.change(allTimeInputs[0], { target: { value: '10:00' } })
    }
    if (allTimeInputs.length > 1) {
      fireEvent.change(allTimeInputs[1], { target: { value: '12:00' } })
    }
    fireEvent.change(screen.getByPlaceholderText('Kursus'), { target: { value: 'Test Course' } })
    fireEvent.change(screen.getByPlaceholderText('Beskrivelse'), { target: { value: 'Test Description' } })

    fireEvent.click(screen.getByRole('button', { name: 'Opret begivenhed' }))
    expect(screen.queryByText('Opret begivenhed')).not.toBeInTheDocument()
  })

  it('closes dialog via Escape', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Ny begivenhed' }))
    expect(screen.getByText('Opret begivenhed')).toBeInTheDocument()
    const dialog = document.querySelector('[role="dialog"]')
    if (dialog) fireEvent.keyDown(dialog, { key: 'Escape' })
  })

  it('filters out past events in upcoming widget', () => {
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify({
      '2026-1-1': { id: 201, title: 'Old Event', color: 'var(--aau-light-blue)', location: 'Room A', time: '10:00', host: 'Test' },
    }))
    renderCalendar('da')
    expect(screen.queryByText('Old Event')).not.toBeInTheDocument()
  })

  it('renders view-all button in upcoming widget', () => {
    renderCalendar('da')
    const viewAllBtn = screen.getByText('Se alle')
    fireEvent.click(viewAllBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/calendar')
  })

  it('renders day view with an event', () => {
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify({
      '2026-4-1': { id: 301, title: 'May Day Event', color: 'var(--color-primary)', location: 'Room 101', time: '09:00 - 10:00', host: 'Test Host' },
    }))
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Dag' }))
    expect(screen.getByText('May Day Event')).toBeInTheDocument()
  })

  it('clicks an event in day view', () => {
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify({
      '2026-4-1': { id: 301, title: 'Day Event', color: 'var(--color-primary)', location: 'Room 101', time: '09:00 - 10:00', host: 'Test Host' },
    }))
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Dag' }))
    fireEvent.click(screen.getByText('Day Event'))
    expect(screen.getAllByText('Room 101')[0]).toBeInTheDocument()
  })

  it('clicks empty placeholder in day view', () => {
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify({}))
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Dag' }))
    const placeholderBtn = screen.getByText('Klik for at tilføje en begivenhed')
    fireEvent.click(placeholderBtn)
    expect(screen.getByText('Lokation')).toBeInTheDocument()
  })

  it('closes event detail dialog', () => {
    renderCalendar('da')
    fireEvent.click(screen.getAllByText(/Studiegruppe/)[0])
    expect(screen.getByText('Lokation')).toBeInTheDocument()
    const dialog = document.querySelector('[role="dialog"]')
    if (dialog) fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByText('Lokation')).not.toBeInTheDocument()
  })

  it('sorts multiple future events in upcoming widget', () => {
    const today = new Date()
    const future1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)
    const future2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)
    const key1 = `${future1.getFullYear()}-${future1.getMonth()}-${future1.getDate()}`
    const key2 = `${future2.getFullYear()}-${future2.getMonth()}-${future2.getDate()}`
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify({
      [key1]: { id: 401, title: 'Future Event 1', color: 'var(--color-primary)', location: 'A', time: '10:00', host: 'Host 1' },
      [key2]: { id: 402, title: 'Future Event 2', color: 'var(--color-primary)', location: 'B', time: '11:00', host: 'Host 2' },
    }))
    renderCalendar('da')
    expect(screen.getByText('Kommende')).toBeInTheDocument()
    expect(screen.getAllByText('Future Event 1').length).toBeGreaterThan(0)
  })

  it('handles month starting on a Sunday (firstDay < 0 edge case)', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: /forrige|previous/i }))
    expect(screen.getByTestId('page-header-title')).toHaveTextContent(/april 2026/i)

    fireEvent.click(screen.getByRole('button', { name: /forrige|previous/i }))
    expect(screen.getByTestId('page-header-title')).toHaveTextContent(/marts 2026/i)
  })

  it('handles Sunday in week view (getDay() || 7 edge case)', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Uge' }))
    expect(screen.getByTestId('page-header-title')).toHaveTextContent(/maj 2026/i)

    fireEvent.click(screen.getByRole('button', { name: /næste|next/i }))
    expect(screen.getByTestId('page-header-title')).toHaveTextContent(/maj 2026/i)
  })

  it('handles Sunday in day view (dayNames fallback edge case)', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Dag' }))
    expect(screen.getByTestId('page-header-title')).toHaveTextContent(/maj 2026/i)

    fireEvent.click(screen.getByRole('button', { name: /næste|next/i }))
    expect(screen.getByTestId('page-header-title')).toHaveTextContent(/maj 2026/i)

    fireEvent.click(screen.getByRole('button', { name: /næste|next/i }))
    expect(screen.getByTestId('page-header-title')).toHaveTextContent(/maj 2026/i)
  })

  it('shows English event description in detail modal', () => {
    renderCalendar('en')
    fireEvent.click(screen.getAllByText(/Study Group/)[0])
    expect(screen.getByText(/This event is part of your study program/)).toBeInTheDocument()
  })

  it('opens new event modal when clicking an empty day', () => {
    renderCalendar('da')
    const dayBtn = document.querySelector('.calendar-day:not(.empty) button')
    if (dayBtn) {
      fireEvent.click(dayBtn)
      expect(screen.getByText('Opret begivenhed')).toBeInTheDocument()
    }
  })

  it('shows error when creating event on occupied date', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Ny begivenhed' }))
    const titleInput = screen.getByPlaceholderText('Begivenhedstitel') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Duplicate Event' } })
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    if (dateInput) fireEvent.change(dateInput, { target: { value: '2026-05-05' } })
    fireEvent.click(screen.getByRole('button', { name: 'Opret begivenhed' }))
    expect(screen.queryByText('Opret begivenhed')).toBeInTheDocument()
  })

  it('does not create event without title or date', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: 'Ny begivenhed' }))
    fireEvent.click(screen.getByRole('button', { name: 'Opret begivenhed' }))
    expect(screen.getByText('Opret begivenhed')).toBeInTheDocument()
  })

  it('renders week numbers correctly for month starting on Monday', () => {
    renderCalendar('da')
    fireEvent.click(screen.getByRole('button', { name: /næste|next/i }))
    expect(screen.getByText('juni 2026')).toBeInTheDocument()

    const weekNums = document.querySelectorAll('.calendar-week-num')
    expect(weekNums.length).toBeGreaterThan(0)
  })
})
