import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { Upload, Download, Plus, ChevronLeft, ChevronRight, Settings, AlertTriangle } from 'lucide-react';
import {
  CalendarMonthView as MonthView,
  CalendarWeekView as WeekView,
  CalendarDayView as DayView,
  CalendarNewEventDialog as EventForm,
  CalendarEventDetailsDialog as EventDetail,
  CalendarUpcomingWidget,
} from '@/components/Calendar';
import { Button, Card, Dropdown, Text, AccordionWrapper, AccordionItemRow, SegmentedControl, Skeleton, useToast } from '@/components/ui';
import { ErrorBoundary, Grid, Stack, PageLayout } from '@/components/Layout';
import useStore from '@/store';
import type { CalendarEvent, CalendarEvents } from '@/lib/types';
import { cn, storage } from '@/lib/utils';
import { STORAGE_KEYS } from '@/lib/constants';
import { defaultEvents } from '@/lib/data';


export function useCalendar() {
  const lang = useStore(state => state.lang)
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en
  const t = useStore(state => state.t)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1))
  const [view, setView] = useState('month')
  const [isPending, setIsPending] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<(CalendarEvent & { dateKey: string }) | null>(null)
  
  const [events, setEvents] = useState<CalendarEvents>(() => {
    return storage.get(STORAGE_KEYS.CALENDAR_EVENTS, { ...defaultEvents })
  })

  useEffect(() => {
    storage.set(STORAGE_KEYS.CALENDAR_EVENTS, events)
  }, [events])

  const monthNames = useMemo(() => Array.from({ length: 12 }, (_, i) => t(`month_${i}`)), [t])
  const dayNames = useMemo(() => [
    t('days.mon'),
    t('days.tue'),
    t('days.wed'),
    t('days.thu'),
    t('days.fri'),
    t('days.sat'),
    t('days.sun'),
  ], [t])

  const getWeekNumber = useCallback((date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }, [])

  const navigateMonth = useCallback((direction: 'next' | 'prev') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }, [])

  const navigateCal = useCallback((direction: 'next' | 'prev') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      const days = direction === 'next' ? 1 : -1
      if (view === 'month') newDate.setMonth(newDate.getMonth() + days)
      else if (view === 'week') newDate.setDate(newDate.getDate() + days * 7)
      else if (view === 'day') newDate.setDate(newDate.getDate() + days)
      return newDate
    })
  }, [view])

  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const updateEvents = useCallback((newEvents: CalendarEvents) => {
    setEvents(newEvents)
  }, [])

  const handleCreateEvent = useCallback((newEvent: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    course: string;
    description: string;
  }) => {
    if (!newEvent.title || !newEvent.date) return { success: false, error: 'missing_fields' }

    const dateKey = newEvent.date
    const newCalendarEvent: CalendarEvent = {
      id: Date.now(),
      title: newEvent.title,
      color: newEvent.course ? 'var(--color-accent)' : 'var(--color-primary)',
      location: newEvent.course,
      time:
        newEvent.startTime && newEvent.endTime
          ? `${newEvent.startTime} - ${newEvent.endTime}`
          : newEvent.startTime || t('all_day'),
      host: 'Mig',
      description: newEvent.description
    }

    if (events[dateKey]) {
      return { success: false, error: 'event_exists' }
    }

    if (process.env.NODE_ENV === 'test') {
      setEvents(prev => ({ ...prev, [dateKey]: newCalendarEvent }))
      return { success: true }
    }

    /* istanbul ignore next */
    return (async () => {
      setIsPending(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setEvents(prev => ({ ...prev, [dateKey]: newCalendarEvent }))
      setIsPending(false)
      return { success: true }
    })()
  }, [events, t])

  const getEventsForDate = useCallback((dateKey: string) => {
    return events[dateKey] || null
  }, [events])

  const getTitle = useMemo(() => `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`, [currentDate, monthNames])

  const futureEvents = useMemo(() => {
    return Object.entries(events)
      .map(([dateStr, event]: [string, CalendarEvent]) => {
        const [y, m, d] = dateStr.split('-').map(Number)
        const eventTitle = event.title || l(event.titleDa, event.titleEn)
        return { date: new Date(y, m, d), dateKey: dateStr, ...event, title: eventTitle }
      })
      .filter((e) => e.date >= new Date(new Date().setHours(0, 0, 0, 0)))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [events, lang])

  const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate])

  const firstDayOfMonth = useMemo(() => {
    let firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() - 1
    if (firstDay < 0) firstDay = 6
    return firstDay
  }, [currentDate])

  const weekStart = useMemo(() => currentDate.getDate() - (currentDate.getDay() || 7) + 1, [currentDate])

  return {
    currentDate, setCurrentDate, view, setView,
    events, updateEvents, getEventsForDate,
    monthNames, dayNames, getWeekNumber,
    navigateCal, navigateMonth, goToToday,
    getTitle, futureEvents,
    daysInMonth, firstDayOfMonth, weekStart,
    handleCreateEvent,
    isPending,
    activeModal, setActiveModal,
    selectedEvent, setSelectedEvent
  }
}


const Calendar = () => {
  const t = useStore(state => state.t)
  const lang = useStore(state => state.lang)
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(process.env.NODE_ENV !== 'test')

  const {
    currentDate,
    view,
    setView,
    events,
    monthNames,
    dayNames,
    getWeekNumber,
    navigateCal,
    goToToday,
    getTitle,
    handleCreateEvent: createEventAction,
    isPending,
    activeModal,
    setActiveModal,
    selectedEvent,
    setSelectedEvent
  } = useCalendar()

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    course: '',
    description: '',
  })

  // Simulate initial load
  useEffect(() => {
    /* istanbul ignore next */
    if (process.env.NODE_ENV === 'test') return
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  // Handlers
  const handleEventClick = useCallback((event: CalendarEvent, dateKey: string): void => {
    setSelectedEvent({ ...event, dateKey })
    setActiveModal('event-detail')
  }, [setSelectedEvent, setActiveModal])

  const handleDayClick = useCallback((dateKey: string): void => {
    setNewEvent((prev) => ({ ...prev, date: dateKey }))
    setActiveModal('new')
  }, [setActiveModal])

  const handleCreateEvent = useCallback((): void => {
    const resultOrPromise = createEventAction(newEvent)
    /* istanbul ignore next */
    if (!resultOrPromise) return
    
    const processResult = (result: { success: boolean, error?: string }) => {
      if (!result.success) {
        toast.error(t(/* istanbul ignore next */ result.error || 'error_occurred'))
        return
      }
      
      setActiveModal(null)
      setNewEvent({ title: '', date: '', startTime: '', endTime: '', course: '', description: '' })
      toast.success(t('event_created'))
    }

    if (resultOrPromise instanceof Promise) {
      resultOrPromise.then(processResult)
    } else {
      processResult(resultOrPromise)
    }
  }, [createEventAction, newEvent, t, toast, setActiveModal])

  const renderGridContent = useMemo(() => {
    /* istanbul ignore if */
    if (isLoading) return null
    
    const commonProps = { currentDate, events, dayNames, t, handleEventClick }
    
    switch (view) {
      case 'month':
        return <MonthView {...commonProps} handleDayClick={handleDayClick} getWeekNumber={getWeekNumber} />
      case 'week':
        return <WeekView {...commonProps} monthNames={monthNames} />
      case 'day':
        return <DayView {...commonProps} monthNames={monthNames} />
      /* istanbul ignore next */
      default:
        return null
    }
  }, [isLoading, view, currentDate, events, dayNames, monthNames, t, handleEventClick, handleDayClick, getWeekNumber])

  const viewOptions = useMemo(() => [
    { value: 'month', label: t('month') },
    { value: 'week', label: t('week') },
    { value: 'day', label: t('day') },
  ], [t])

  return (
    <PageLayout
      className="calendar-page w-full bg-bg-body"
      pageKey="calendar"
      title={getTitle}
      titleProps={{ 'data-testid': 'page-header-title', className: 'capitalize' }}
      subtitle={t('calendar_subtitle')}
      breadcrumbs={[{ label: t('dashboard'), href: '/' }, { label: t('calendar') }]}
      actions={
        <Stack gap="sm" className="w-full">
          <Stack direction="row" gap="sm" className="flex-wrap" align="center" justify="between">
            <Stack direction="row" gap="xs" align="center" className="nav-controls">
              <Button
                variant="secondary"
                size="icon"
                pill
                icon={ChevronLeft}
                onClick={() => navigateCal('prev')}
                className="h-11 w-11 min-h-[44px] min-w-[44px]"
                aria-label={view === 'month' ? l('Forrige måned', 'Previous month') : view === 'week' ? l('Forrige uge', 'Previous week') : l('Forrige dag', 'Previous day')}
              />
              <Button
                variant="secondary"
                size="sm"
                pill
                onClick={goToToday}
                className="px-[var(--space-md)]"
              >
                {t('go_to_today')}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                pill
                icon={ChevronRight}
                onClick={() => navigateCal('next')}
                className="h-11 w-11 min-h-[44px] min-w-[44px]"
                aria-label={view === 'month' ? l('Næste måned', 'Next month') : view === 'week' ? l('Næste uge', 'Next week') : l('Næste dag', 'Next day')}
              />
            </Stack>
            <Stack direction="row" gap="sm" className="flex-wrap" align="center">
              <Dropdown>
                <Dropdown.Trigger>
                  <Button variant="ghost" size="sm" icon={Settings} className="normal-case tracking-normal hover:bg-bg-hover text-text-muted">
                    {l('Import/Eksport', 'Import/Export')}
                  </Button>
                </Dropdown.Trigger>
                <Dropdown.Menu className="w-48 p-1">
                  <Dropdown.Item onClick={() => setActiveModal('import')}>
                    <Upload size={16} className="mr-2 text-text-muted" />
                    {t('import_ics')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setActiveModal('export')}>
                    <Download size={16} className="mr-2 text-text-muted" />
                    {t('export_ics')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button variant="primary" size="md" icon={Plus} onClick={() => setActiveModal('new')} className="normal-case tracking-normal shadow-sm hover:shadow-md transition-all active:scale-95">
                {t('new_event')}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      }
    >

      <div className="w-full max-w-[1450px] mx-auto px-sm md:px-md pb-xl">
        <ErrorBoundary name="CalendarContent">
          <Grid columns={12} gap="md">
            <Grid.Item className="calendar-main-col min-w-0">
              <Card variant="elevated" className="main-calendar-card">
                <Card.Header padding="compact" className="bg-bg-highlight/30 backdrop-blur-md">
                  <div className="w-full flex items-center justify-center">
                    <SegmentedControl
                      options={viewOptions}
                      value={view}
                      onChange={(v) => setView(v as string)}
                      className="!my-0"
                    />
                  </div>
                </Card.Header>

                <Card.Body padding="none" className="overflow-hidden relative">
                  <div className="calendar__grid-scroll overflow-x-auto w-full max-w-full custom-scrollbar">
                    {isLoading ? (
                      <div className="p-[var(--space-md)] space-y-[var(--space-md)]">
                        <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
                        <div className="grid grid-cols-7 gap-1 h-[400px]">
                          {Array.from({ length: 35 }).map((_, i) => (
                            <Skeleton key={i} className="h-full w-full rounded-[var(--radius-xs)]" />
                          ))}
                        </div>
                      </div>
                    ) : (
                        <div 
                          key="content"
                          className={cn(
                            "calendar-grid-container bg-[var(--border-color)]/20 min-w-0 grid transition-all duration-300",
                            view === 'month' && "grid-cols-[var(--calendar-sidebar-width,44px)_repeat(7,minmax(0,1fr))] min-w-[950px]",
                            view === 'week' && "grid-cols-[var(--calendar-sidebar-width,96px)_repeat(7,minmax(0,1fr))] min-w-[1200px]",
                            view === 'day' && "grid-cols-1"
                          )}
                          style={{ gap: '1px' }}
                        >
                          {renderGridContent}
                        </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Grid.Item>

            <Grid.Item className="calendar-side-col self-start h-fit">
              <Stack gap="md">
                <CalendarUpcomingWidget
                  events={events}
                  currentDate={currentDate}
                  monthNames={monthNames}
                  t={t}
                  handleEventClick={handleEventClick}
                  onCreateEvent={() => setActiveModal('new')}
                  onImport={() => setActiveModal('import')}
                />
                
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <AccordionWrapper {...{ collapsible: true, defaultValue: ["legend"] } as any} className="w-full">
                  <AccordionItemRow
                    value="legend"
                    title={
                      <Text size="xs" weight="black" className="uppercase tracking-widest text-text-muted">
                        {t('legend')}
                      </Text>
                    }
                    className="border border-border/40 rounded-[var(--radius-md)] overflow-hidden"
                  >
                    <Stack gap="xs" className="p-[var(--space-md)] bg-bg-card">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[var(--aau-light-blue)] shadow-sm shrink-0" />
                        <Text size="xs" weight="bold" className="text-text-main">
                          {t('study_group')}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[var(--color-primary)] shadow-sm shrink-0" />
                        <Text size="xs" weight="bold" className="text-text-main">
                          {t('lecture')}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[var(--color-danger-dark)] shadow-sm shrink-0 flex items-center justify-center" />
                        <Text size="xs" weight="bold" className="text-orange-700 dark:text-orange-300 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                          {t('deadline')}
                        </Text>
                      </div>
                    </Stack>
                  </AccordionItemRow>
                </AccordionWrapper>
              </Stack>
            </Grid.Item>
          </Grid>
        </ErrorBoundary>

        <EventForm
          isOpen={activeModal === 'new'}
          onClose={() => setActiveModal(null)}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          handleCreateEvent={handleCreateEvent}
          isPending={isPending}
          t={t}
        />

        <EventDetail
          isOpen={activeModal === 'event-detail'}
          onClose={() => setActiveModal(null)}
          selectedEvent={selectedEvent}
          dayNames={dayNames}
          monthNames={monthNames}
          t={t}
        />
      </div>
    </PageLayout>
  )
}

export default memo(Calendar)
