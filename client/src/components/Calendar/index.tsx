import React, { memo, useMemo, useCallback, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Clock,
  MapPin,
  User as UserIcon,
  Info,
  ArrowRight,
  CalendarClock,
  CalendarCheck,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import {
  Badge,
  Text,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Textarea,
  Heading,
  Button,
} from '@/components/ui'
import { Stack } from '@/components/Layout'
import { PATHS } from '@/routes'
import useStore from '@/store'
import { cn, UI_PALETTE as eventPalette } from '@/lib/utils'
import type { CalendarEvent, CalendarEvents } from '@/lib/types'

// Calendar Utilities
const parseEventDuration = (timeStr: string): number => {
  const parts = timeStr.split(' - ')
  if (parts.length < 2) return 1
  try {
    const [startH, startM] = parts[0].split(':').map(Number)
    const [endH, endM] = parts[1].split(':').map(Number)
    const startDec = startH + startM / 60
    const endDec = endH + endM / 60
    return Math.max(1, Math.ceil(endDec - startDec))
  } catch {
    return 1
  }
}

const isEventDeadline = (event: CalendarEvent): boolean => {
  return !!(
    event.color === 'var(--color-danger-dark)' ||
    event.color === 'var(--color-danger)' ||
    event.typeEn?.toLowerCase() === 'deadline'
  )
}

const getEventTitleText = (event: CalendarEvent): string => {
  return event.title || useStore.getState().localize(event, 'title') || ''
}

const getEventCourseText = (event: CalendarEvent): string => {
  const courseTitle = useStore.getState().localize(event, 'courseTitle')
  if (!courseTitle) return ''
  return courseTitle + (event.courseCode ? ` (${event.courseCode})` : '')
}

const getEventTypeText = (event: CalendarEvent): string => {
  return useStore.getState().localize(event, 'type') || ''
}

// Calendar Engine Shared Components
interface EventBadgeProps {
  event: CalendarEvent
  className?: string
}

const EventBadge = ({ event, className }: EventBadgeProps) => {
  const isDeadline = isEventDeadline(event)
  const eventType = getEventTypeText(event)
  if (!eventType) return null

  return (
    <Badge
      variant="default"
      className={cn(
        "text-[10px] font-black text-white flex items-center gap-1 leading-none shrink-0",
        isDeadline && "bg-orange-600 animate-pulse text-white",
        className
      )}
      style={isDeadline ? undefined : { background: event.color }}
    >
      {isDeadline && <AlertTriangle size={10} className="text-white shrink-0" />}
      {eventType}
    </Badge>
  )
}

interface EventInfoItemProps {
  label: string
  icon: React.ComponentType<any>
  value: string
}

const EventInfoItem = ({ label, icon: Icon, value }: EventInfoItemProps) => {
  return (
    <Stack gap="xs">
      <Text size="xs" weight="bold" className="text-text-muted/50">{label}</Text>
      <Stack direction="row" gap="sm" align="center" className="text-text-main">
        <Icon className="w-4 h-4 text-primary" />
        <Text size="sm" weight="bold" className="truncate">{value}</Text>
      </Stack>
    </Stack>
  )
}

// CalendarDayView
interface CalendarDayViewProps {
  currentDate: Date
  events: CalendarEvents
  dayNames: string[]
  monthNames: string[]
  t: (key: string) => string
  handleEventClick: (event: CalendarEvent, dateKey: string) => void
}

export const CalendarDayView = memo(function CalendarDayView({
  currentDate,
  events,
  dayNames,
  monthNames,
  t,
  handleEventClick,
}: CalendarDayViewProps) {

  const { dateKey, dayName, formattedDate, isToday } = useMemo(() => {
    const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`
    const dowIdx = currentDate.getDay() - 1
    const name = dayNames[dowIdx < 0 ? 6 : dowIdx]
    const date = `${currentDate.getDate()}. ${monthNames[currentDate.getMonth()]}`

    const now = new Date()
    const today =
      currentDate.getDate() === now.getDate() &&
      currentDate.getMonth() === now.getMonth() &&
      currentDate.getFullYear() === now.getFullYear()

    return { dateKey: key, dayName: name, formattedDate: date, isToday: today }
  }, [currentDate, dayNames, monthNames])

  const event = events[dateKey]
  const isDeadline = event ? isEventDeadline(event) : false

  return (
    <Stack gap="xl" className="p-[var(--space-lg)] sm:p-[var(--space-xl)] animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
      <Stack gap="md" className="relative">
        <div className="flex items-center gap-4">
          <Badge
            variant={isToday ? 'primary' : 'secondary'}
            className={cn(
              "px-4 py-1.5 text-[0.65rem] font-black rounded-full shadow-sm transition-all duration-300",
              isToday && "ring-4 ring-primary/10 scale-110"
            )}
          >
            {isToday ? t('today') : dayName}
          </Badge>
          <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
          <Heading level={2} className="text-4xl sm:text-5xl font-black tracking-tighter text-text-main">
            {formattedDate}
          </Heading>
          <Text size="lg" weight="bold" className="text-text-muted/60 font-mono tracking-tighter">
            {currentDate.getFullYear()}
          </Text>
        </div>
      </Stack>

      <div className="grid gap-8">
        {event ? (
          <Card
            className={cn(
              "calendar__day-event-card group cursor-pointer border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative rounded-2xl",
              isDeadline && "ring-2 ring-orange-500/25"
            )}
            onClick={() => handleEventClick(event, dateKey)}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-2.5 z-10 transition-all duration-500 group-hover:w-4"
              style={{ backgroundColor: event.color }}
            />

            <Card.Body className="p-[var(--space-xl)] sm:p-[var(--space-2xl)] pl-[var(--space-2xl)] sm:pl-[var(--space-2xl)] bg-card group-hover:bg-muted/5 transition-colors">
              <Stack gap="xl">
                <Stack gap="xs">
                  <div className="flex flex-wrap items-center gap-xs">
                     {(() => {
                      const courseTitle = getEventCourseText(event)
                      if (courseTitle) {
                        return (
                          <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary dark:text-[var(--aau-light-blue-sec)]">
                            {courseTitle}
                          </Badge>
                        )
                      }
                      return null
                    })()}
                    <EventBadge event={event} />
                  </div>
                  <Heading level={3} className={cn("text-3xl sm:text-4xl font-black leading-[1.1] tracking-tight group-hover:text-primary transition-colors mt-xs flex items-center gap-2", isDeadline && "text-orange-700 dark:text-orange-300")}>
                    {isDeadline && <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400 shrink-0" />}
                    {getEventTitleText(event)}
                  </Heading>
                </Stack>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[var(--space-lg)] py-[var(--space-lg)] border-y border-border/50">
                  <EventInfoItem label={t('time')} icon={CalendarClock} value={event.time} />
                  {event.location && (
                    <EventInfoItem label={t('location')} icon={MapPin} value={event.location} />
                  )}
                  {event.host && (
                    <EventInfoItem label={t('host')} icon={UserIcon} value={event.host} />
                  )}
                </div>

                {event.description && (
                  <Stack gap="sm" className="bg-muted/30 p-[var(--space-lg)] rounded-xl border border-border/50 relative overflow-hidden group/desc">
                    <div className="absolute top-0 right-0 p-[var(--space-md)] opacity-5 group-hover/desc:opacity-10 transition-opacity">
                      <Info size={40} />
                    </div>
                    <Text size="sm" className="text-text-muted leading-relaxed relative z-10 italic">
                      "{event.description}"
                    </Text>
                  </Stack>
                )}

                <div className="flex justify-end pt-[var(--space-sm)]">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-4 transition-all">
                    <span>{t('view_full_details')}</span>
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Stack>
            </Card.Body>
          </Card>
        ) : (
          <button
            type="button"
            className="w-full flex flex-col items-center justify-center py-[var(--space-4xl)] bg-muted/20 rounded-[var(--radius-3xl)] border-4 border-dashed border-border/40 opacity-50 hover:opacity-80 transition-opacity group cursor-pointer border-none focus-visible:outline-none focus-visible:shadow-focus"
            onClick={() => handleEventClick({ id: 0, title: '', color: '', location: '', time: '', host: '' }, dateKey)}
          >
            <div className="w-[5rem] h-[5rem] rounded-full bg-muted/40 flex items-center justify-center mb-[var(--space-lg)] group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <CalendarClock className="w-10 h-10 text-text-muted/40" />
            </div>
            <Text size="xl" weight="black" className="text-text-muted tracking-tight mb-[var(--space-sm)]">{t('calendar.no_events_today')}</Text>
            <Text size="sm" className="text-text-muted/60">{t('calendar.click_to_add_event')}</Text>
          </button>
        )}
      </div>
    </Stack>
  )
})

// CalendarMonthView
interface CalendarMonthViewProps {
  currentDate: Date
  events: CalendarEvents
  dayNames: string[]
  t: (key: string) => string
  handleEventClick: (event: CalendarEvent, dateKey: string) => void
  handleDayClick: (dateKey: string) => void
  getWeekNumber: (date: Date) => number
}

export const CalendarMonthView = memo(function CalendarMonthView({
  currentDate,
  events,
  dayNames,
  t,
  handleEventClick,
  handleDayClick,
  getWeekNumber,
}: CalendarMonthViewProps) {

  const { days, firstDay, startingWeekNum, year, month, rowCount } = useMemo(() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    const totalDays = new Date(y, m + 1, 0).getDate()
    let first = new Date(y, m, 1).getDay() - 1
    if (first < 0) first = 6
    const weekStart = getWeekNumber(new Date(y, m, 1))
    const rows = Math.ceil((first + totalDays) / 7)
    return { days: totalDays, firstDay: first, startingWeekNum: weekStart, year: y, month: m, rowCount: rows }
  }, [currentDate, getWeekNumber])

  const renderDay = useCallback((dayIndex: number) => {
    const dateKey = `${year}-${month}-${dayIndex}`
    const event = events[dateKey]
    const isDeadline = event ? isEventDeadline(event) : false
    const now = new Date()
    const isToday =
      dayIndex === now.getDate() &&
      month === now.getMonth() &&
      year === now.getFullYear()

    const palette = event ? eventPalette[event.color] || { bg: '', text: '' } : { bg: '', text: '' }
    const eventStyle = {
      background: palette.bg || event?.color,
      color: palette.text || 'var(--color-text-main)',
    }

    return (
      <Stack
        key={`day-${dayIndex}`}
        className={cn(
          "calendar-day min-w-0 min-h-[44px] sm:min-h-[55px] md:min-h-[65px] lg:min-h-[75px] p-[var(--space-2xs)] sm:p-xs flex flex-col gap-[var(--space-3xs)] relative transition-all duration-150 bg-card group",
          "border-b border-r border-border/40 hover:z-10 hover:shadow-lg focus-within:z-10",
          isToday && "bg-primary/5 after:absolute after:inset-0 after:ring-1 after:ring-inset after:ring-primary/20"
        )}
      >
        <button
          type="button"
          onClick={() => handleDayClick(dateKey)}
          className="absolute inset-0 w-full h-full opacity-0 z-0 cursor-pointer focus-visible:opacity-100 focus-visible:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`${dayIndex}. ${t('month_' + month)} - ${t('create_event')}`}
        />

        <div className="flex justify-between items-start pointer-events-none z-10 relative" aria-hidden="true">
          <Text
            weight="bold"
            className={cn(
              "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm transition-all duration-300",
              isToday ? "bg-primary text-white shadow-md scale-110" : "text-text-muted group-hover:text-text-main group-hover:bg-muted/50"
            )}
          >
            {dayIndex}
          </Text>
        </div>

        {event && (
          <button
            type="button"
            className={cn(
              "calendar-event-mini w-full px-xs py-2xs sm:px-[var(--space-sm)] sm:py-[var(--space-2xs)] rounded-md text-left shadow-sm border border-border/30 hover:shadow-md hover:brightness-105 active:scale-[0.98] transition-all overflow-hidden focus-visible:outline-none focus-visible:shadow-focus z-10 relative",
              isDeadline && "border-2 border-orange-500 font-extrabold shadow-md ring-1 ring-orange-500/20"
            )}
            style={eventStyle}
            onClick={(e) => { e.stopPropagation(); handleEventClick(event, dateKey); }}
            aria-label={`${getEventTitleText(event)}${event.time ? `, ${event.time}` : ''}${event.location ? `, ${event.location}` : ''}`}
            title={`${getEventTitleText(event)}${event.time ? ` (${event.time})` : ''}${event.location ? ` - ${event.location}` : ''}`}
          >
            <Text weight="bold" className={cn("line-clamp-2 block select-none leading-snug text-xs sm:text-sm", isDeadline && "font-black text-orange-800 dark:text-orange-300 flex items-center gap-1")}>
              {isDeadline && <AlertTriangle className="w-3 h-3 shrink-0 text-orange-600 dark:text-orange-400 animate-pulse" />}
              {event.courseCode ? `${event.courseCode}: ` : ''}{getEventTitleText(event)}
            </Text>
            {event.time && (
              <Text className="opacity-90 block line-clamp-2 mt-[2px] font-semibold text-[10px] sm:text-xs">
                {event.time}
              </Text>
            )}
          </button>
        )}
      </Stack>
    )
  }, [year, month, events, handleEventClick, handleDayClick, t])

  const gridCells = useMemo(() => {
    const cells = []
    let currentDayIdx = 1
    for (let row = 0; row < rowCount; row++) {
      const rowWeekNum = startingWeekNum + row
      cells.push(
        <div key={`wn-${rowWeekNum}`} className="calendar-week-num flex items-center justify-center bg-bg-highlight/50 text-[0.7rem] sm:text-sm font-mono font-black text-text-main border-r-2 border-r-border/60 border-b border-border/40 select-none min-w-0" title={`${t('week')} ${rowWeekNum}`}>W{rowWeekNum}</div>
      )
      for (let col = 0; col < 7; col++) {
        const cellIdx = row * 7 + col
        const isPrevMonth = cellIdx < firstDay
        const isNextMonth = (cellIdx - firstDay) >= days
        if (isPrevMonth || isNextMonth) {
          cells.push(<div key={`empty-${row}-${col}`} className="calendar-day empty bg-muted/5 opacity-40 border-b border-r border-border/30 min-w-0" />)
        } else {
          cells.push(renderDay(currentDayIdx))
          currentDayIdx++
        }
      }
    }
    return cells
  }, [days, firstDay, startingWeekNum, renderDay, rowCount, t])

  return (
    <>
      <div className="calendar-grid-header sticky top-0 z-20 bg-muted/95 backdrop-blur-sm p-[var(--space-2xs)] sm:p-[var(--space-sm)] text-center text-[0.65rem] sm:text-xs font-black uppercase tracking-wider text-text-muted/60 border-b border-r-2 border-r-border/60 border-border/60">
        {t('week')}
      </div>
      {dayNames.map((day) => (
        <div key={day} className="calendar-grid-header sticky top-0 z-20 bg-muted/90 backdrop-blur-sm p-[var(--space-2xs)] sm:p-[var(--space-sm)] text-center text-[0.65rem] sm:text-xs font-bold text-text-muted border-b border-border/60 min-w-0 truncate">
          {day}
        </div>
      ))}
      {gridCells}
    </>
  )
})

// CalendarWeekView
interface CalendarWeekViewProps {
  currentDate: Date
  events: CalendarEvents
  dayNames: string[]
  monthNames: string[]
  t: (key: string) => string
  handleEventClick: (event: CalendarEvent, dateKey: string) => void
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

export const CalendarWeekView = memo(function CalendarWeekView({
  currentDate,
  events,
  dayNames,
  monthNames,
  t,
  handleEventClick,
}: CalendarWeekViewProps) {

  const { weekDays } = useMemo(() => {
    const start = currentDate.getDate() - (currentDate.getDay() || 7) + 1
    const days = dayNames.map((name, i) => {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), start + i)
      return {
        name,
        date: d.getDate(),
        month: d.getMonth(),
        dateKey: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
      }
    })
    return { weekDays: days }
  }, [currentDate, dayNames])

  const coveredCells = useMemo(() => {
    const covered = new Set<string>()
    HOURS.forEach(hour => {
      weekDays.forEach(day => {
        const event = events[day.dateKey]
        if (event && event.time.startsWith(hour.toString().padStart(2, '0'))) {
          const duration = parseEventDuration(event.time)
          for (let d = 1; d < duration; d++) {
            covered.add(`${day.dateKey}-${hour + d}`)
          }
        }
      })
    })
    return covered
  }, [events, weekDays])

  return (
    <>
      <div className="calendar-grid-header sticky top-0 z-30 bg-muted/95 backdrop-blur-md p-3 text-center text-[0.6rem] sm:text-xs font-bold text-text-muted border-b border-r border-border/60 shadow-sm">
        {t('time')}
      </div>

      {weekDays.map((day) => (
        <div
          key={day.dateKey}
          className="calendar-grid-header sticky top-0 z-30 bg-muted/95 backdrop-blur-md p-3 text-center border-b border-border/60 shadow-sm"
        >
          <Text size="xs" weight="bold" className="text-text-muted block mb-1.5 opacity-80">
            {day.name}
          </Text>
          <Text size="sm" weight="extrabold" className="text-text-main">
            {day.date}. {monthNames[day.month].substring(0, 3)}
          </Text>
        </div>
      ))}

      {HOURS.map((hour) => {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`
        return (
          <Fragment key={`row-${hour}`}>
            <div className="calendar-time-label flex items-start justify-end p-2 pr-4 text-[0.65rem] sm:text-[0.7rem] font-bold text-text-muted bg-muted/5 border-r border-b border-border/40 select-none">
               {timeStr}
            </div>

            {weekDays.map((day) => {
              const cellId = `${day.dateKey}-${hour}`
              if (coveredCells.has(cellId)) return null

              const event = events[day.dateKey]
              const isEventStart = event && event.time.startsWith(hour.toString().padStart(2, '0'))

              if (isEventStart) {
                const duration = parseEventDuration(event.time)
                const palette = eventPalette[event.color] || {}
                const isDeadline = isEventDeadline(event)

                return (
                  <div
                    key={`slot-${day.dateKey}-${hour}`}
                    className="calendar-day min-w-0 p-1 border-b border-r border-border/40 group relative"
                    style={{ gridRow: `span ${duration}` }}
                  >
                    <button
                      type="button"
                      title={`${getEventTitleText(event)}${event.time ? ` (${event.time})` : ''}${event.location ? ` - ${event.location}` : ''}`}
                      aria-label={`${getEventTitleText(event)}${event.time ? `, ${event.time}` : ''}${event.location ? `, ${event.location}` : ''}`}
                      onClick={() => handleEventClick(event, day.dateKey)}
                      className={cn(
                        "w-full h-full p-2.5 rounded-lg text-left transition-all duration-300",
                        "border border-border/30 shadow-sm group-hover:shadow-lg group-hover:scale-[1.01] group-hover:z-10",
                        "active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus focus-visible:z-10",
                        isDeadline && "border-2 border-orange-500 ring-2 ring-orange-500/20 shadow-md"
                      )}
                      style={{
                        background: palette.bg || event.color,
                        color: palette.text || 'var(--color-text-main)',
                      }}
                    >
                      <Stack gap="2xs">
                        {(() => {
                          const courseCode = event.courseCode
                          const eventType = getEventTypeText(event)
                          if (courseCode || eventType) {
                            return (
                              <div className="flex flex-wrap items-center gap-3xs opacity-80 mb-3xs">
                                {courseCode && <span className="text-[9px] font-extrabold px-1 bg-white/20 rounded">{courseCode}</span>}
                                {eventType && (
                                  <span className={cn(
                                    "text-[9px] font-black uppercase flex items-center gap-0.5",
                                    isDeadline && "text-orange-700 dark:text-orange-200 bg-orange-500/10 px-1 rounded"
                                  )}>
                                    {isDeadline && <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-orange-500 dark:text-orange-400" />}
                                    {eventType}
                                  </span>
                                )}
                              </div>
                            )
                          }
                          return null
                        })()}
                        <Text size="xs" weight={isDeadline ? "black" : "extrabold"} className={cn("line-clamp-2 block leading-tight tracking-tight opacity-90", isDeadline && "text-orange-800 dark:text-orange-200")}>
                          {getEventTitleText(event)}
                        </Text>
                        <Text size="2xs" className="opacity-80 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                          {event.time}
                        </Text>
                        {event.location && (
                          <Text size="2xs" className="opacity-70 line-clamp-1 block mt-1.5 font-medium border-t border-current/10 pt-1">
                            {event.location}
                          </Text>
                        )}
                      </Stack>
                    </button>
                  </div>
                )
              }

              return (
                <div
                  key={`slot-${day.dateKey}-${hour}`}
                  className="calendar-day min-w-0 bg-card hover:bg-muted/30 transition-colors border-b border-r border-border/40 min-h-[60px]"
                />
              )
            })}
          </Fragment>
        )
      })}
    </>
  )
})

// CalendarNewEventDialog
interface NewEventFormState {
  title: string
  date: string
  startTime: string
  endTime: string
  course: string
  description: string
}

interface CalendarNewEventDialogProps {
  isOpen: boolean
  onClose: () => void
  newEvent: NewEventFormState
  setNewEvent: React.Dispatch<React.SetStateAction<NewEventFormState>>
  handleCreateEvent: () => void
  isPending?: boolean
  t: (key: string) => string
}

const toInputDate = (internal: string): string => {
  const [y, m, d] = internal.split('-').map(Number)
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const toInternalDate = (input: string): string => {
  const [y, m, d] = input.split('-').map(Number)
  return `${y}-${m - 1}-${d}`
}

export function CalendarNewEventDialog({
  isOpen,
  onClose,
  newEvent,
  setNewEvent,
  handleCreateEvent,
  isPending = false,
  t,
}: CalendarNewEventDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">{t('new_event')}</DialogTitle>
        </DialogHeader>
        <Stack gap="md" className="py-2">
          <Stack gap="xs">
            <label htmlFor="event-title" className="text-sm font-semibold text-text-main">
              {t('event_title')}
            </label>
            <Input
              id="event-title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder={t('event_title')}
              disabled={isPending}
              autoFocus
            />
          </Stack>
          <Stack gap="xs">
            <label htmlFor="event-date" className="text-sm font-semibold text-text-main">
              {t('event_date')}
            </label>
            <Input
              id="event-date"
              type="date"
              value={newEvent.date ? toInputDate(newEvent.date) : ''}
              onChange={(e) => setNewEvent({ ...newEvent, date: toInternalDate(e.target.value) })}
              disabled={isPending}
            />
          </Stack>
          <Stack direction="row" gap="md">
            <Stack gap="xs" className="flex-1">
              <label htmlFor="event-start" className="text-sm font-semibold text-text-main">
                {t('event_start_time')}
              </label>
              <Input
                id="event-start"
                type="time"
                value={newEvent.startTime}
                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                disabled={isPending}
              />
            </Stack>
            <Stack gap="xs" className="flex-1">
              <label htmlFor="event-end" className="text-sm font-semibold text-text-main">
                {t('event_end_time')}
              </label>
              <Input
                id="event-end"
                type="time"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                disabled={isPending}
              />
            </Stack>
          </Stack>
          <Stack gap="xs">
            <label htmlFor="event-course" className="text-sm font-semibold text-text-main">
              {t('event_course')}
            </label>
            <Input
              id="event-course"
              value={newEvent.course}
              onChange={(e) => setNewEvent({ ...newEvent, course: e.target.value })}
              placeholder={t('event_course')}
              disabled={isPending}
            />
          </Stack>
          <Stack gap="xs">
            <label htmlFor="event-desc" className="text-sm font-semibold text-text-main">
              {t('event_description')}
            </label>
            <Textarea
              id="event-desc"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder={t('event_description')}
              rows={3}
              disabled={isPending}
              className="resize-none"
            />
          </Stack>
          
          <Stack direction="row" gap="sm" className="mt-4 pt-4 border-t border-border/50">
            <Button 
              variant="secondary" 
              className="flex-1" 
              onClick={onClose}
              disabled={isPending}
            >
              {t('cancel')}
            </Button>
            <Button 
              variant="primary" 
              className="flex-1 relative" 
              onClick={handleCreateEvent}
              disabled={isPending || !newEvent.title || !newEvent.date}
            >
              <Stack direction="row" gap="xs" align="center" justify="center">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('create_event')}
              </Stack>
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

// CalendarEventDetailsDialog
interface CalendarEventDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedEvent: (CalendarEvent & { dateKey: string }) | null
  dayNames: string[]
  monthNames: string[]
  t: (key: string) => string
}

export function CalendarEventDetailsDialog({
  isOpen,
  onClose,
  selectedEvent,
  dayNames,
  monthNames,
  t,
}: CalendarEventDetailsDialogProps) {
  const navigate = useNavigate()

  if (!selectedEvent) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px] md:max-w-[620px] max-h-[80vh] overflow-y-auto p-0 flex flex-col scrollbar-thin">
        <div className="animate-modal-enter flex flex-col h-full w-full">
          <div
            className="calendar__detail-header relative flex flex-col sm:flex-row sm:items-center justify-between p-lg pr-[var(--space-2xl)] select-none shrink-0 border-b border-border/50"
            style={{ borderLeft: `6px solid ${selectedEvent.color}` }}
          >
            <Stack gap="2xs" className="min-w-0 flex-1">
              <Heading level={2} className="calendar__detail-title text-xl font-extrabold text-main leading-tight truncate">
                {getEventTitleText(selectedEvent)}
              </Heading>
              {(() => {
                const courseTitle = getEventCourseText(selectedEvent)
                if (courseTitle) {
                  return (
                    <Text size="xs" weight="bold" className="text-primary dark:text-[var(--aau-light-blue-sec)] truncate">
                      {courseTitle}
                    </Text>
                  )
                }
                return null
              })()}
            </Stack>
            <Button variant="primary" size="sm" className="shrink-0" onClick={() => navigate(PATHS.COURSE(1))}>
              {t('go_to_module')}
            </Button>
          </div>

          <Stack gap="lg" className="p-md lg:p-lg">
            <div className="event-info-grid grid grid-cols-1 sm:grid-cols-2 gap-md p-md bg-bg-highlight/30 dark:bg-white/5 border border-[var(--border-color)]/40 rounded-[var(--radius-lg)]">
              <Stack className="info-item flex flex-row items-start gap-sm">
                <div className="p-xs bg-primary/10 text-primary dark:text-[var(--aau-light-blue-sec)] rounded-lg shrink-0 mt-0.5">
                  <Clock size={16} strokeWidth={2.5} />
                </div>
                <Stack gap="2xs">
                  <Text size="xs" weight="bold" muted className="tracking-wider uppercase opacity-70">
                    {t('date_and_time')}
                  </Text>
                  <Text size="sm" weight="extrabold" className="text-main leading-snug">
                    {(() => {
                      const [y, m, d_num] = selectedEvent.dateKey.split('-').map(Number)
                      const date = new Date(y, m, d_num)
                      return `${dayNames[(date.getDay() + 6) % 7]} d. ${date.getDate()}. ${monthNames[date.getMonth()]}`
                    })()}
                  </Text>
                  <Text size="xs" weight="semibold" muted className="mt-3xs">
                    {selectedEvent.time}
                  </Text>
                </Stack>
              </Stack>
              <Stack className="info-item flex flex-row items-start gap-sm">
                <div className="p-xs bg-primary/10 text-primary dark:text-[var(--aau-light-blue-sec)] rounded-lg shrink-0 mt-0.5">
                  <MapPin size={16} strokeWidth={2.5} />
                </div>
                <Stack gap="2xs">
                  <Text size="xs" weight="bold" muted className="tracking-wider uppercase opacity-70">
                    {t('location_label')}
                  </Text>
                  <Text size="sm" weight="semibold" className="text-main">{selectedEvent.location}</Text>
                </Stack>
              </Stack>
              <Stack className="info-item flex flex-row items-start gap-sm sm:col-span-2 border-t border-[var(--border-color)]/20 pt-sm mt-3xs">
                <div className="p-xs bg-primary/10 text-primary dark:text-[var(--aau-light-blue-sec)] rounded-lg shrink-0 mt-0.5">
                  <UserIcon size={16} strokeWidth={2.5} />
                </div>
                <Stack gap="2xs">
                  <Text size="xs" weight="bold" muted className="tracking-wider uppercase opacity-70">
                    {t('lecturer_host')}
                  </Text>
                  <Text size="sm" weight="semibold" className="text-main">{selectedEvent.host}</Text>
                </Stack>
              </Stack>
            </div>

            <Text muted className="calendar__detail-description text-sm leading-relaxed block bg-bg-highlight/10 p-sm rounded-lg border border-[var(--border-color)]/20">
              {t('event_detail_desc')}
            </Text>

            <div className="calendar__detail-actions flex justify-end mt-xs">
              <Button variant="outline" size="sm" onClick={() => navigate('/submission/1')}>
                Se detaljer
              </Button>
            </div>
          </Stack>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// CalendarUpcomingWidget
interface CalendarUpcomingWidgetProps {
  events: CalendarEvents
  currentDate: Date
  monthNames: string[]
  t: (key: string) => string
  handleEventClick: (event: CalendarEvent, dateKey: string) => void
  onCreateEvent?: () => void
  onImport?: () => void
}

export const CalendarUpcomingWidget = memo(function CalendarUpcomingWidget({
  events,
  currentDate,
  monthNames,
  t,
  handleEventClick,
  onCreateEvent,
  onImport,
}: CalendarUpcomingWidgetProps) {
  const navigate = useNavigate()

  const futureEvents = useMemo(() => {
    const now = new Date()
    const isFutureMonth =
      currentDate.getFullYear() > now.getFullYear() ||
      (currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() > now.getMonth())

    const isPastMonth =
      currentDate.getFullYear() < now.getFullYear() ||
      (currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() < now.getMonth())

    const filterStartDate = isFutureMonth || isPastMonth
      ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      : new Date(now.setHours(0, 0, 0, 0))

    return Object.entries(events)
      .map(([dateStr, event]) => {
        const [y, m, d_num] = dateStr.split('-').map(Number)
        return { date: new Date(y, m, d_num), dateKey: dateStr, ...event }
      })
      .filter((e) => {
        const isCurrentMonthContext = 
          e.date.getFullYear() === currentDate.getFullYear() && 
          e.date.getMonth() === currentDate.getMonth()
        return isCurrentMonthContext && e.date >= filterStartDate
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5)
  }, [events, currentDate])

  return (
    <Card variant="default" className="upcoming-events-widget !h-auto">
      <Card.Header padding="default" className="bg-bg-highlight/20 min-h-[72px] sm:min-h-[76px] flex items-center">
        <Stack direction="row" align="center" justify="between" className="w-full">
          <Stack direction="row" align="center" gap="sm">
            <div className="p-[var(--space-2xs)] rounded-[var(--radius-sm)] bg-primary/10 text-primary">
              <CalendarCheck size={18} strokeWidth={2.5} />
            </div>
            <Text size="sm" weight="bold" tag="span">
              {t('upcoming')}
            </Text>
          </Stack>
          {futureEvents.length > 0 && (
            <Button variant="ghost" size="xs" onClick={() => navigate(PATHS.CALENDAR)} className="normal-case tracking-normal font-black text-xs">
              {t('common.see_all')}
            </Button>
          )}
        </Stack>
      </Card.Header>

      <Card.Body padding="none">
        <Stack gap="none">
          {futureEvents.length > 0 ? (
            futureEvents.map((e, idx) => (
              <button
                key={`${e.dateKey}-${idx}`}
                type="button"
                className={cn(
                  "upcoming-event-item group w-full flex items-center gap-[var(--space-md)] py-sm px-md text-left transition-all duration-150",
                  "border-b border-[var(--border-color)]/30 last:border-0 hover:bg-bg-highlight/50 focus-visible:bg-bg-highlight/70 focus-visible:outline-none focus-visible:shadow-focus"
                )}
                onClick={() => handleEventClick(e, e.dateKey)}
              >
                <Stack
                  align="center"
                  justify="center"
                  gap="none"
                  className="bg-bg-card p-[var(--space-2xs)] rounded-[var(--radius-md)] min-w-[46px] h-[46px] border border-[var(--border-color)]/60 shadow-sm shrink-0"
                >
                  <Text size="2xs" weight="black" muted tag="span" className="uppercase tracking-widest leading-none">
                    {monthNames[e.date.getMonth()].substring(0, 3)}
                  </Text>
                  <Text size="xl" weight="black" tag="span" className="text-primary dark:text-indigo-200 leading-none mt-[2px]">
                    {e.date.getDate()}
                  </Text>
                </Stack>

                <Stack gap="none" className="flex-1 min-w-0">
                  <Text size="sm" weight="bold" tag="span" className="line-clamp-2 block leading-snug">
                    {getEventTitleText(e)}
                  </Text>
                  <Stack direction="row" gap="xs" align="center" className="text-text-secondary shrink-0">
                    <Clock size={12} strokeWidth={2.5} />
                    <Text size="xs" weight="bold" tag="span" className="uppercase whitespace-nowrap">{e.time}</Text>
                  </Stack>
                  {e.location && (
                    <Stack direction="row" gap="xs" align="center" className="text-text-secondary dark:text-white">
                      <MapPin size={12} strokeWidth={2.5} />
                      <Text size="xs" weight="bold" tag="span" className="italic line-clamp-1 block">{e.location}</Text>
                    </Stack>
                  )}
                </Stack>

                <ChevronRight size={16} className="text-muted/40 shrink-0 group-hover:translate-x-[2px] transition-transform duration-150" />
              </button>
            ))
          ) : (
            <div 
              className="py-[var(--space-md)] px-[var(--space-md)] text-center bg-bg-highlight/5 flex flex-col items-center gap-sm"
            >
              <div className="flex flex-col items-center text-center">
                <CalendarCheck size={24} className="text-muted/65 mx-auto mb-[var(--space-2xs)]" />
                <Text size="sm" weight="bold" muted className="mb-[var(--space-2xs)]">{t('no_events_short')}</Text>
                <Text size="2xs" muted className="leading-relaxed max-w-[180px] mx-auto">
                  {t('no_upcoming_events_hint')}
                </Text>
              </div>
              
              <Stack gap="xs" className="w-full mt-2xs">
                {onCreateEvent && (
                  <Button variant="primary" size="sm" onClick={onCreateEvent} className="w-full justify-center normal-case tracking-normal text-xs py-1.5 h-auto">
                    {t('new_event')}
                  </Button>
                )}
                {onImport && (
                  <Button variant="outline" size="sm" onClick={onImport} className="w-full justify-center normal-case tracking-normal text-xs py-1.5 h-auto">
                    {t('import_ics')}
                  </Button>
                )}
              </Stack>
            </div>
          )}
        </Stack>
      </Card.Body>
    </Card>
  )
})
