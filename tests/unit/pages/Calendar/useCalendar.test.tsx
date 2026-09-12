import { useCalendar } from '@/pages/Calendar';
import useStore from '@/store';
import { STORAGE_KEYS } from '@/lib/constants';

const wrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>

describe('useCalendar hook', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('initializes with default values', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    expect(result.current.view).toBe('month')
    expect(result.current.currentDate.getMonth()).toBe(4)
  })

  it('navigates to next and prev periods', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => result.current.navigateCal('next'))
    expect(result.current.currentDate.getMonth()).toBe(5)
    act(() => result.current.navigateCal('prev'))
    expect(result.current.currentDate.getMonth()).toBe(4)
    act(() => result.current.setView('week'))
    act(() => result.current.navigateCal('next'))
    expect(result.current.currentDate.getDate()).toBe(8)
    act(() => result.current.setView('day'))
    act(() => result.current.navigateCal('prev'))
    expect(result.current.currentDate.getDate()).toBe(7)
  })

  it('goes to today', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => result.current.goToToday())
    const now = new Date()
    expect(result.current.currentDate.toDateString()).toBe(now.toDateString())
  })

  it('gets events for a specific date', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    const event = result.current.getEventsForDate('2026-4-5')
    expect(event).toBeDefined()
    expect(event?.titleDa).toBe('Studiegruppe')
  })

  it('updates events and title correctly', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    expect(result.current.getTitle).toContain('maj 2026')
    act(() => result.current.setView('week'))
    expect(result.current.getTitle).toContain('2026')
    act(() => result.current.updateEvents({ '2026-4-1': { id: 1, title: 'New Event', color: 'blue', location: 'loc', time: '10', host: 'host' } }))
    expect(result.current.getEventsForDate('2026-4-1')?.title).toBe('New Event')
  })

  it('handles bilingual event titles in futureEvents', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    const studyGroupEvent = result.current.futureEvents.find(e => e.dateKey === '2026-4-5')
    if (studyGroupEvent) {
      expect(studyGroupEvent.title).toBe('Studiegruppe')
    }
    const deadlineEvent = result.current.futureEvents.find(e => e.dateKey === '2026-4-20')
    if (deadlineEvent) {
      expect(deadlineEvent.title).toBe('Deadline')
    }
  })

  it('calculates month details correctly', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    expect(result.current.daysInMonth).toBe(31)
    expect(result.current.firstDayOfMonth).toBe(4)
  })

  it('returns future events sorted by date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 1))
    const { result } = renderHook(() => useCalendar(), { wrapper })
    const dates = result.current.futureEvents.map(e => e.date.getTime())
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1])
    }
    vi.useRealTimers()
  })

  it('filters past events from futureEvents', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 10))
    const { result } = renderHook(() => useCalendar(), { wrapper })
    const dateKeys = result.current.futureEvents.map(e => e.dateKey)
    expect(dateKeys).not.toContain('2026-4-5')
    expect(dateKeys).toContain('2026-4-12')
    expect(dateKeys).toContain('2026-4-20')
    vi.useRealTimers()
  })

  it('resolves bilingual titles in English', () => {
    useStore.setState({ lang: 'en' })
    const { result } = renderHook(() => useCalendar(), { wrapper })
    const studyGroupEvent = result.current.futureEvents.find(e => e.dateKey === '2026-4-5')
    if (studyGroupEvent) {
      expect(studyGroupEvent.title).toBe('Study Group')
    }
  })

  it('returns null for dates without events', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    expect(result.current.getEventsForDate('2099-1-1')).toBeNull()
  })

  it('calculates week number correctly', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    expect(result.current.getWeekNumber(new Date(2026, 4, 1))).toBe(18)
  })

  it('handles firstDayOfMonth when month starts on Sunday', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => result.current.setCurrentDate(new Date(2026, 1, 1)))
    expect(result.current.firstDayOfMonth).toBe(6)
  })

  it('calculates weekStart correctly', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => result.current.setCurrentDate(new Date(2026, 3, 27)))
    expect(result.current.weekStart).toBe(27)
  })

  it('restores events from localStorage on mount', () => {
    const savedEvents = { '2026-5-1': { title: 'Restored' } }
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(savedEvents))
    const { result } = renderHook(() => useCalendar(), { wrapper })
    expect(result.current.getEventsForDate('2026-5-1').title).toBe('Restored')
  })

  it('handles getWeekNumber for a Sunday (getUTCDay is 0)', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    expect(result.current.getWeekNumber(new Date(2026, 4, 3))).toBe(18)
  })

  it('does not change date when navigating with unknown view', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => result.current.setView('unknown'))
    const prevDate = result.current.currentDate.getDate()
    act(() => result.current.navigateCal('next'))
    expect(result.current.currentDate.getDate()).toBe(prevDate)
  })

  it('shows English month title', () => {
    useStore.setState({ lang: 'en' })
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => result.current.setView('month'))
    expect(result.current.getTitle).toContain('May 2026')
  })

  it('navigates months correctly', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    act(() => result.current.setCurrentDate(new Date(2026, 4, 1)))
    act(() => result.current.navigateMonth('next'))
    expect(result.current.currentDate.getMonth()).toBe(5)
    act(() => result.current.navigateMonth('prev'))
    expect(result.current.currentDate.getMonth()).toBe(4)
  })

  it('creates event successfully with title and date', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    let res: any
    act(() => {
      res = result.current.handleCreateEvent({
        title: 'Test Event', date: '2024-02-15',
        startTime: '', endTime: '', course: '', description: ''
      })
    })
    expect(res).toEqual({ success: true })
    expect(result.current.events['2024-02-15']).toBeDefined()
    expect(result.current.events['2024-02-15'].title).toBe('Test Event')
  })

  it('returns false when title is missing', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    let res: any
    act(() => {
      res = result.current.handleCreateEvent({
        title: '', date: '2024-02-15',
        startTime: '', endTime: '', course: '', description: ''
      })
    })
    expect(res).toEqual({ success: false, error: 'missing_fields' })
  })

  it('returns false when date is missing', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    let res: any
    act(() => {
      res = result.current.handleCreateEvent({
        title: 'Test Event', date: '',
        startTime: '', endTime: '', course: '', description: ''
      })
    })
    expect(res).toEqual({ success: false, error: 'missing_fields' })
  })

  it('creates event with time when provided', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    let res: any
    act(() => {
      res = result.current.handleCreateEvent({
        title: 'Test', date: '2024-02-16',
        startTime: '10:00', endTime: '11:00', course: '', description: ''
      })
    })
    expect(res).toEqual({ success: true })
    expect(result.current.events['2024-02-16']).toBeDefined()
    expect(result.current.events['2024-02-16'].time).toBe('10:00 - 11:00')
  })

  it('handles time with only start time', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper })
    let res: any
    act(() => {
      res = result.current.handleCreateEvent({
        title: 'Test', date: '2024-02-17',
        startTime: '10:00', endTime: '', course: '', description: ''
      })
    })
    expect(res).toEqual({ success: true })
    expect(result.current.events['2024-02-17']).toBeDefined()
    expect(result.current.events['2024-02-17'].time).toBe('10:00')
  })
})
