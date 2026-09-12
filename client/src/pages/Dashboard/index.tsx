import { useLocation, useNavigate, useBlocker } from 'react-router-dom';
import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react';
import { Settings, Check, RotateCcw, Plus, ArrowRight } from 'lucide-react';
import { WidgetGrid } from '@/components/Widgets';
import { PageLayout } from '@/components/Layout';
import useStore from '@/store';
import { mockDashboardDeadlines, defaultEvents, todayEvents } from '@/lib/data';
import { PATHS } from '@/routes';
import { getDeadlineInfo } from '@/lib/utils';
import type { DashboardWidgetConfig } from '@/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Checkbox,
  DialogTrigger
} from '@/components/ui';

// 1. DailySummaryStrip Component
interface NextEvent {
  titleKey: string
  time: string
  location?: string
}

interface DailySummaryStripProps {
  activityCount: number
  deadlineCount: number
  messageCount: number
  nextEvent: NextEvent | null
  t: (key: string) => string
  lang: string
}

const DailySummaryStrip = memo(function DailySummaryStrip({
  activityCount,
  deadlineCount,
  messageCount,
  nextEvent,
  t,
  lang
}: DailySummaryStripProps) {
  const l = (da: string, en: string) => lang === 'da' ? da : en
  return (
    <div className="daily-summary-strip mb-md flex flex-wrap gap-xs sm:gap-sm items-center py-sm px-md bg-bg-highlight/10 border-2 border-border/30 rounded-[var(--radius-lg)] text-sm font-semibold text-text-secondary select-none shadow-sm">
      <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-white/10 text-primary dark:text-white rounded-lg shadow-sm">
        <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shrink-0" />
        <strong className="text-main font-extrabold uppercase tracking-wide text-xs">{l('I DAG', 'TODAY')}</strong>
        <span className="text-main font-bold text-sm">
          {activityCount} {activityCount === 1 ? l('aktivitet', 'activity') : l('aktiviteter', 'activities')}
        </span>
        <span className="text-border/60 mx-0.5">·</span>
        <span className="text-main font-bold text-sm">
          {deadlineCount} {deadlineCount === 1 ? 'deadline' : 'deadlines'}
        </span>
        <span className="text-border/60 mx-0.5">·</span>
        <span className="text-main font-bold text-sm">
          {messageCount === 1 ? l('1 ulæst', '1 unread') : l(`${messageCount} ulæste`, `${messageCount} unread`)}
        </span>
      </span>

      {nextEvent && (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 dark:bg-white/5 text-primary dark:text-white rounded-lg shadow-sm">
          <strong className="font-extrabold text-main uppercase tracking-wide text-xs">{l('NÆSTE', 'NEXT')}</strong>
          <span className="font-bold text-main text-sm">{t(nextEvent.titleKey)}</span>
          <span className="text-text-muted text-sm">kl. {nextEvent.time}</span>
          {nextEvent.location && (
            <>
              <span className="text-border/60">·</span>
              <span className="text-text-muted text-sm whitespace-nowrap">{nextEvent.location}</span>
            </>
          )}
        </span>
      )}
    </div>
  )
})

// 2. FocusBanner Component
interface UrgentItem {
  id: number
  type: 'assignment' | 'calendar'
  title: string
  courseId: number
  courseTitle: string
  info: {
    urgency: string
    color: string
    relativeLabel?: string
    dateLabel?: string
  }
}

interface FocusBannerProps {
  urgentItem: UrgentItem
  extraUrgentCount: number
  firstName: string
  onNavigate: (target: { type: 'calendar' | 'submission'; courseId?: number; submissionId?: number }) => void
  t: (key: string) => string
  lang: string
}

const FocusBanner = memo(function FocusBanner({
  urgentItem,
  extraUrgentCount,
  firstName,
  onNavigate,
  t,
  lang
}: FocusBannerProps) {
  const l = (da: string, en: string) => lang === 'da' ? da : en
  const handleNavigate = () => {
    if (urgentItem.type === 'calendar') {
      onNavigate({ type: 'calendar' })
    } else {
      onNavigate({ type: 'submission', courseId: urgentItem.courseId, submissionId: urgentItem.id })
    }
  }

  return (
    <div
      className="focus-banner animate-fade-in border-l-4 p-md sm:p-lg sm:px-xl flex flex-col md:flex-row md:items-center justify-between gap-md md:gap-lg cursor-pointer hover:brightness-[1.02] transition-all"
      style={{
        borderLeftColor: urgentItem.info.color,
        backgroundColor: (urgentItem.info.urgency === 'overdue' || urgentItem.info.urgency === 'today') ? 'var(--color-bg-danger-tint)' : 'var(--color-bg-warning-tint)'
      }}
      data-testid="focus-banner"
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleNavigate()
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex flex-col items-start min-w-0 md:max-w-xs lg:max-w-md w-full md:w-auto flex-1">
        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-sm" style={{ backgroundColor: urgentItem.info.color, color: (urgentItem.info.urgency === 'tomorrow' || urgentItem.info.urgency === 'soon') ? '#211a52' : '#ffffff' }}>
          {urgentItem.type === 'calendar'
            ? l('Vigtig begivenhed', 'Important event')
            : l('Vigtig aflevering', 'Important assignment')}
        </span>
        <span className="text-xs font-semibold text-text-secondary block mt-xs">{urgentItem.courseTitle}</span>
        <h3 className="text-lg sm:text-xl font-extrabold text-main mt-2xs mb-0 truncate leading-snug w-full">{urgentItem.title}</h3>
        <span className="sr-only">Hej {firstName}</span>
      </div>

      <div className="flex flex-col items-start md:items-end justify-center gap-xs w-full md:w-auto shrink-0 mt-sm md:mt-0 pointer-events-none">
        <div className="flex flex-col items-start md:items-end gap-3xs leading-none">
          <span className="font-black text-sm sm:text-base tracking-wide uppercase" style={{ color: urgentItem.info.color }}>
            {l('Frist', 'Due')} {urgentItem.info.relativeLabel ?? urgentItem.info.dateLabel}
          </span>
          <span className="text-xs sm:text-sm font-bold text-text-secondary">
            {urgentItem.info.dateLabel ?? ''}
          </span>
        </div>
        <div className="flex items-center gap-md shrink-0 flex-wrap min-h-[44px] w-full md:w-auto justify-start md:justify-end mt-xs">
          {extraUrgentCount > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onNavigate({ type: 'calendar' }); }}
              className="text-xs font-bold text-primary hover:underline cursor-pointer min-h-[44px] flex items-center pointer-events-auto"
            >
              {t('dashboard.more_urgent_assignments').replace('{count}', String(extraUrgentCount))}
            </button>
          )}
          <Button
            variant="primary"
            size="sm"
            iconRight={ArrowRight}
            className="font-bold shrink-0 min-h-[44px] whitespace-nowrap px-md text-sm pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation()
              handleNavigate()
            }}
          >
            {urgentItem.type === 'calendar'
              ? l('Åbn kalender', 'Open calendar')
              : l('Åbn aflevering', 'Open submission')}
          </Button>
        </div>
      </div>
    </div>
  )
})

// 3. DashboardHeader Component
interface DashboardHeaderProps {
  isEditing: boolean
  isModalOpen: boolean
  isResetDialogOpen: boolean
  dashboardLayout: DashboardWidgetConfig[]
  favorites: { readonly length: number } | readonly unknown[]
  onEdit: () => void
  onSave: () => void
  onCancelEdit: () => void
  onReset: () => void
  onOpenWidgetsModal: () => void
  onDismissWidgetsModal: () => void
  onDoneWidgetsModal: () => void
  onResetDialogChange: (open: boolean) => void
  onToggleWidget: (id: string, checked: boolean) => void
  t: (key: string) => string
  lang: string
}

const DashboardHeader = memo(function DashboardHeader({
  isEditing,
  isModalOpen,
  isResetDialogOpen,
  dashboardLayout,
  favorites,
  onEdit,
  onSave,
  onCancelEdit,
  onReset,
  onOpenWidgetsModal,
  onDismissWidgetsModal,
  onDoneWidgetsModal,
  onResetDialogChange,
  onToggleWidget,
  t,
  lang,
}: DashboardHeaderProps) {
  const l = (da: string, en: string) => lang === 'da' ? da : en
  if (!isEditing) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        icon={Settings}
        className="text-text-muted hover:text-primary"
      >
        {t('dashboard.edit_dashboard')}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-xs flex-wrap">
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (open) {
          onOpenWidgetsModal()
        } else {
          onDismissWidgetsModal()
        }
      }}>
        <DialogTrigger>
          <Button variant="ghost" size="sm" icon={Plus} className="text-text-muted hover:text-primary">
            + Widgets
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[420px] max-h-[calc(100dvh-96px)] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>{t('dashboard.add_remove_widgets')}</DialogTitle>
            <DialogDescription>
              {l('Vælg de moduler, du vil have synlige på dit dashboard.', 'Select modules to show on your dashboard.')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-0 overflow-y-auto flex-1 -mx-[var(--space-md)] lg:-mx-[var(--space-lg)] px-[var(--space-md)] lg:px-[var(--space-lg)]">
            {(() => {
              const groups: { labelDa: string; labelEn: string; widgetIds: string[] }[] = [
                { labelDa: 'Dagligt overblik', labelEn: 'Daily overview', widgetIds: ['quickOverview', 'deadlines', 'calendar'] },
                { labelDa: 'Kommunikation', labelEn: 'Communication', widgetIds: ['messages', 'forumActivity'] },
                { labelDa: 'Genveje og fag', labelEn: 'Shortcuts & courses', widgetIds: ['favorites', 'shortcuts', 'courseProgress', 'support'] },
              ];
              const widgetMap = new Map(dashboardLayout.map(w => [w.id, w]));
              return groups.map((group, gi) => (
                <div key={gi}>
                  {gi > 0 && <div className="border-t border-[var(--border-color)]/20 mt-xs" />}
                  <div className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider px-xs pt-sm pb-2xs select-none">
                    {l(group.labelDa, group.labelEn)}
                  </div>
                  {group.widgetIds.map(widgetId => {
                    const widget = widgetMap.get(widgetId);
                    if (!widget) return null;
                    const isFavoritesEmpty = widget.id === 'favorites' && favorites.length === 0;
                    const isDisabled = widget.id === 'courseProgress';
                    return (
                      <div key={widget.id} className={`flex items-center gap-xs py-xs px-xs rounded-[var(--radius-sm)] transition-colors ${isDisabled ? 'opacity-50' : 'hover:bg-bg-hover'}`}>
                        <Checkbox
                          id={`widget-checkbox-${widget.id}`}
                          checked={widget.visible !== false}
                          onChange={(e) => onToggleWidget(widget.id, e.target.checked)}
                          disabled={isDisabled}
                        />
                        <div className="flex flex-col gap-3xs min-w-0 flex-1">
                          <label htmlFor={`widget-checkbox-${widget.id}`} className={`text-xs font-bold text-main cursor-pointer select-none ${isDisabled ? 'cursor-not-allowed' : ''}`}>
                            {t(`dashboard.widget_${widget.id}`)}
                          </label>
                          <span className="text-[11px] text-text-muted leading-relaxed">
                            {widget.id === 'favorites' && isFavoritesEmpty ? l('Vises som tom widget, indtil du vælger favoritter.', 'Shows as empty widget until you choose favorites.')
                              : widget.id === 'calendar' ? l('Dagens program og kommende aftaler.', "Today's schedule and upcoming events.")
                              : widget.id === 'courseProgress' ? l('Ikke tilgængelig — kræver dataintegration.', 'Unavailable — requires data integration.')
                              : widget.id === 'support' ? l('Hurtig adgang til teknisk hjælp.', 'Quick access to technical support.')
                              : widget.id === 'shortcuts' ? l('Genveje til AAU-systemer.', 'Shortcuts to AAU systems.')
                              : widget.id === 'quickOverview' ? l('Dagens aktiviteter, deadlines og ulæste beskeder.', "Today's activities, deadlines, and unread messages.")
                              : widget.id === 'deadlines' ? l('Kommende afleveringsfrister.', 'Upcoming assignment deadlines.')
                              : widget.id === 'messages' ? l('Nylige beskeder og notifikationer.', 'Recent messages and notifications.')
                              : widget.id === 'forumActivity' ? l('Seneste indlæg i kursusfora.', 'Latest posts in course forums.')
                              : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
          <DialogFooter className="flex gap-xs justify-end shrink-0 mt-sm">
            <Button variant="ghost" size="sm" onClick={onDismissWidgetsModal}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={onDoneWidgetsModal}>
              {t('common.done')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResetDialogOpen} onOpenChange={onResetDialogChange}>
        <DialogTrigger>
          <Button variant="ghost" size="sm" icon={RotateCcw} className="text-text-muted hover:text-danger">
            {l('Nulstil', 'Reset')}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{l('Nulstil dashboard?', 'Reset dashboard?')}</DialogTitle>
            <DialogDescription>
              {l(
                'Dette gendanner standardlayoutet. Dine widget-tilpasninger fjernes.',
                'This restores the default layout. Your widget customizations will be removed.'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-xs justify-end">
            <Button variant="secondary" size="sm" onClick={() => onResetDialogChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" size="sm" onClick={() => { onReset(); onResetDialogChange(false); }}>
              {l('Nulstil dashboard', 'Reset dashboard')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        variant="ghost"
        size="sm"
        onClick={onCancelEdit}
        className="text-text-muted hover:text-danger"
      >
        {t('common.cancel')}
      </Button>

      <Button
        variant="success"
        size="sm"
        onClick={onSave}
        icon={Check}
      >
        {t('common.done')}
      </Button>
    </div>
  )
})

// 4. Main Dashboard Page Component
function Dashboard() {
  const t = useStore((state) => state.t)
  const dashboardLayout = useStore((state) => state.dashboardLayout)
  const setDashboardLayout = useStore((state) => state.setDashboardLayout)
  const resetDashboardLayout = useStore((state) => state.resetDashboardLayout)
  const location = useLocation()
  const navigate = useNavigate()

  const firstName = useStore((state) => state.firstName)
  const lang = useStore((state) => state.lang)
  const l = (da: string, en: string) => lang === 'da' ? da : en
  const courses = useStore((state) => state.courses)
  const localize = useStore((state) => state.localize)
  const messageCount = useStore((state) => state.messageCount)
  const favorites = useStore((state) => state.favorites)

  const activityCount = useMemo(() => todayEvents.filter(e => e.time !== '23:59').length, [])
  const deadlineCount = useMemo(() => todayEvents.filter(e => e.time === '23:59').length, [])
  const nextEvent = useMemo(() => todayEvents.find(e => e.time !== '23:59') || null, [])

  const [isEditing, setIsEditing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [backupLayout, setBackupLayout] = useState<DashboardWidgetConfig[] | null>(null)
  const [now, setNow] = useState(() => new Date())
  const modalLayoutSnapshot = useRef<DashboardWidgetConfig[] | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const handleToggleWidget = useCallback((id: string, isChecked: boolean) => {
    const updated = dashboardLayout.map((widget) => {
      if (widget.id === id) {
        return {
          ...widget,
          visible: isChecked,
          userModified: true,
          pinned: isChecked
        }
      }
      return widget
    })
    setDashboardLayout(updated)
  }, [dashboardLayout, setDashboardLayout])

  const isFavoritesAutoHidden = false

  const visibleWidgetsResult = useMemo(() => {
    const list = dashboardLayout
      .filter(w => {
        if (w.visible === false) return false
        if (w.id === 'favorites' && isFavoritesAutoHidden) return false
        return true
      })
      .map(w => {
        if (w.id === 'messages' && isFavoritesAutoHidden && w.size === 'small') {
          return { ...w, size: 'medium' as const, span: 8 }
        }
        return w
      })

    let movedMessages = false
    if (messageCount > 0 && !isEditing) {
      const messagesIdx = list.findIndex(w => w.id === 'messages')
      const deadlinesIdx = list.findIndex(w => w.id === 'deadlines')
      if (messagesIdx !== -1 && deadlinesIdx !== -1 && messagesIdx > deadlinesIdx) {
        const [messagesWidget] = list.splice(messagesIdx, 1)
        list.splice(deadlinesIdx, 0, messagesWidget)
        movedMessages = true
      }
    }
    return { list, movedMessages }
  }, [dashboardLayout, isFavoritesAutoHidden, messageCount, isEditing])

  const { list: visibleWidgets, movedMessages: isMessagesElevated } = visibleWidgetsResult

  const urgentItems = useMemo(() => {
    const assignments = mockDashboardDeadlines.map((d) => {
      const deadlineDate = new Date(now)
      deadlineDate.setHours(deadlineDate.getHours() + d.deadlineHoursFromNow)
      const info = getDeadlineInfo(deadlineDate, lang, now)
      const course = courses.find((c) => c.id === d.courseId)
      const courseTitle = course ? localize(course, 'title') : ''
      return {
        id: d.id,
        type: 'assignment' as const,
        title: localize(d, 'title'),
        courseId: d.courseId,
        courseTitle,
        date: deadlineDate,
        info,
      }
    })

    const events = Object.entries(defaultEvents)
      .map(([dateStr, evt]) => {
        const [year, month, day] = dateStr.split('-').map(Number)
        const eventDate = new Date(year, month - 1, day, 8, 15)
        return { eventDate, evt }
      })
      .filter(({ eventDate }) => {
        const info = getDeadlineInfo(eventDate, lang, now)
        return info.urgency !== 'overdue'
      })
      .map(({ eventDate, evt }) => {
        const info = getDeadlineInfo(eventDate, lang, now)
        return {
          id: evt.id,
          type: 'calendar' as const,
          title: l(evt.titleDa || evt.title || '', evt.titleEn || evt.title || ''),
          courseId: 1,
          courseTitle: l(evt.courseTitleDa || '', evt.courseTitleEn || ''),
          date: eventDate,
          info,
        }
      })

    const allItems = [...assignments, ...events]

    return allItems.sort((a, b) => {
      const aOverdue = a.info.urgency === 'overdue'
      const bOverdue = b.info.urgency === 'overdue'
      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1
      }
      const aTime = a.date.getTime()
      const bTime = b.date.getTime()
      if (aTime !== bTime) {
        return aTime - bTime
      }
      if (a.type !== b.type) {
        return a.type === 'assignment' ? -1 : 1
      }
      return a.id - b.id
    })
  }, [courses, localize, lang, now])

  const urgentItem = useMemo(() => urgentItems[0] || null, [urgentItems])

  const extraUrgentCount = useMemo(() => {
    if (!urgentItem) return 0
    return urgentItems.filter((item) => item !== urgentItem && item.info.urgency !== 'later').length
  }, [urgentItems, urgentItem])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      backupLayout !== null && currentLocation.pathname !== nextLocation.pathname
  )

  const showBlockerModal = blocker.state === 'blocked'

  const handleNavigate = useCallback((target: { type: 'calendar' | 'submission'; courseId?: number; submissionId?: number }) => {
    if (target.type === 'calendar') {
      navigate(PATHS.CALENDAR)
    } else {
      navigate(PATHS.SUBMISSION(target.courseId!, target.submissionId!))
    }
  }, [navigate])

  const handleSaveAndProceed = () => {
    setBackupLayout(null)
    setIsEditing(false)
    setTimeout(() => blocker.proceed?.(), 0)
  }

  const handleDiscardAndProceed = () => {
    if (backupLayout) {
      setDashboardLayout(backupLayout)
    }
    setBackupLayout(null)
    setIsEditing(false)
    setTimeout(() => blocker.proceed?.(), 0)
  }

  const handleCancelNavigation = () => {
    blocker.reset?.()
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (backupLayout !== null) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [backupLayout])

  const handleEdit = () => {
    setBackupLayout(dashboardLayout)
    setIsEditing(true)
  }

  const handleSave = () => {
    setBackupLayout(null)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    if (backupLayout) {
      setDashboardLayout(backupLayout)
      setBackupLayout(null)
    }
    setIsEditing(false)
  }

  const handleReset = () => {
    resetDashboardLayout()
  }

  const handleOpenWidgetsModal = () => {
    modalLayoutSnapshot.current = JSON.parse(JSON.stringify(dashboardLayout))
    setIsModalOpen(true)
  }

  const handleDismissWidgetsModal = () => {
    if (modalLayoutSnapshot.current) {
      setDashboardLayout(modalLayoutSnapshot.current)
      modalLayoutSnapshot.current = null
    }
    setIsModalOpen(false)
  }

  const handleDoneWidgetsModal = () => {
    modalLayoutSnapshot.current = null
    setIsModalOpen(false)
  }

  return (
    <PageLayout
      key={location.key}
      className="dashboard-page relative"
      pageKey="dashboard"
      title={t('dashboard.title')}
      flat
      gap="sm"
      actionsAlign="center"
      actions={
        <DashboardHeader
          isEditing={isEditing}
          isModalOpen={isModalOpen}
          isResetDialogOpen={isResetDialogOpen}
          dashboardLayout={dashboardLayout}
          favorites={favorites}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancelEdit={handleCancelEdit}
          onReset={handleReset}
          onOpenWidgetsModal={handleOpenWidgetsModal}
          onDismissWidgetsModal={handleDismissWidgetsModal}
          onDoneWidgetsModal={handleDoneWidgetsModal}
          onResetDialogChange={setIsResetDialogOpen}
          onToggleWidget={handleToggleWidget}
          t={t}
          lang={lang}
        />
      }
    >
      <div className="dashboard-content-wrapper w-full pb-[var(--space-xl)] pt-2xs">
        <DailySummaryStrip
          activityCount={activityCount}
          deadlineCount={deadlineCount}
          messageCount={messageCount}
          nextEvent={nextEvent}
          t={t}
          lang={lang}
        />

        {!isEditing && urgentItem && (
          <FocusBanner
            urgentItem={urgentItem}
            extraUrgentCount={extraUrgentCount}
            firstName={firstName}
            onNavigate={handleNavigate}
            t={t}
            lang={lang}
          />
        )}

        {isEditing && (
          <div className="mb-4 p-3 bg-primary/15 border-2 border-primary/30 rounded-[var(--radius-md)] font-bold text-primary shadow-sm text-sm">
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              <span>{l('Redigeringstilstand:', 'Edit mode:')}</span>
              <span className="font-medium text-primary/80">
                {l('Du kan flytte og skjule widgets. Automatisk prioritering er slået fra, mens du redigerer.', 'Move and hide widgets. Auto-priority is disabled while editing.')}
              </span>
            </span>
          </div>
        )}

        <WidgetGrid
          widgets={visibleWidgets}
          isEditing={isEditing}
          onLayoutChange={setDashboardLayout}
          onToggleWidget={handleToggleWidget}
          hideFirstDeadline={false}
          isMessagesElevated={isMessagesElevated}
        />
      </div>

      <Dialog open={showBlockerModal} onOpenChange={(o) => { if (!o) handleCancelNavigation(); }}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>
              {l('Ugemte ændringer', 'Unsaved changes')}
            </DialogTitle>
            <DialogDescription>
              {l(
                'Du har foretaget ændringer i dit dashboard-layout. Vil du gemme eller kassere dem, før du forlader siden?',
                'You have made changes to your dashboard layout. Do you want to save or discard them before leaving?'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-wrap gap-xs justify-end mt-xs">
            <Button variant="ghost" size="sm" onClick={handleCancelNavigation}>
              {l('Bliv på siden', 'Stay on page')}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDiscardAndProceed}>
              {l('Kassér ændringer', 'Discard changes')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAndProceed}>
              {l('Gem ændringer', 'Save changes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}

export default Dashboard
