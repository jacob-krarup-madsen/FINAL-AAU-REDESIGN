import React, { useState, useEffect, useCallback, memo, useMemo, forwardRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  MessageCircle,
  ArrowRight,
  AlertCircle,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
  GripVertical,
  Link2,
  ExternalLink,
  Headphones,
  Calendar,
  Clock,
  MapPin,
  Users,
  MessageSquare,
  Trophy,
  CheckCircle2,
  Star,
  Plus
} from 'lucide-react';
import { Card, MasterItem, Dropdown, Heading, Text, Badge } from '@/components/ui';
import Button from '@/components/ui/Button';
import { Stack } from '@/components/Layout';
import { cn, env, resolveFavorite, sortFavorites, getDeadlineInfo } from '@/lib/utils';
import type { ResolvedFavorite } from '@/lib/utils';
import { courses as dataCourses, mockDashboardDeadlines, mockForumActivities, todayEvents } from '@/lib/data';
import { DASHBOARD_CONFIG } from '@/lib/constants';
import type { OverviewEvent } from '@/lib/types';
import useStore from '@/store';
import { PATHS } from '@/routes';

const useL = () => {
  const lang = useStore(state => state.lang);
  return <T,>(da: T, en: T): T => lang === 'da' ? da : en;
};

// 1. Types & Shared Structures
export interface WidgetItem {
  id: string
  span: number
  size?: 'small' | 'medium' | 'large'
}

interface Post {
  id: number
  author: string
  replies: number
  [key: string]: any
}

export interface ProcessedDeadline {
  id: number;
  titleDa: string;
  titleEn: string;
  dateKey: string;
  courseId: number;
  deadlineHoursFromNow: number;
  deadlineDate: string;
  title: string;
  courseTitle: string;
  info: {
    label: string;
    urgency: 'overdue' | 'today' | 'tomorrow' | 'soon' | 'later';
    color: string;
    relativeLabel?: string;
    dateLabel?: string;
  };
}

const SIZE_TO_SPAN: Record<'small' | 'medium' | 'large', number> = {
  small: 4,
  medium: 8,
  large: 12,
}

const WIDGET_TITLES: Record<string, { da: string; en: string }> = {
  deadlines:      { da: 'afleveringer', en: 'assignments' },
  messages:       { da: 'beskeder', en: 'messages' },
  calendar:       { da: 'kalender', en: 'calendar' },
  favorites:      { da: 'favoritter', en: 'favorites' },
  courseProgress: { da: 'kursusfremskridt', en: 'course progress' },
  forumActivity:  { da: 'forumaktivitet', en: 'forum activity' },
  support:        { da: 'support', en: 'support' },
  quickOverview:  { da: 'dagens program', en: 'daily schedule' },
  shortcuts:      { da: 'genveje', en: 'shortcuts' },
}

const ACTIVITY_COLOR_MAP: Record<string, string> = {
  'var(--color-reply-icon, var(--color-primary))': 'text-primary bg-primary/10',
  'var(--color-accent)': 'text-accent bg-accent/10',
  'var(--color-success)': 'text-success bg-success/10',
}

const mockMessages = [
  { id: 1, sender: 'Mette Frederiksen', subject: 'Gruppemøde i morgen kl. 10', time: '10:45', unread: true },
  { id: 2, sender: 'Lars Poulsen (Underviser)', subject: 'Feedback på aflevering 2 er klar', time: 'I går', unread: false },
  { id: 3, sender: 'Studievejledningen', subject: 'Bekræftelse af tid til vejledning', time: '8. jun', unread: false },
]

const mockCalendarEvents = [
  { id: 1, title: 'Forelæsning: UX & Interaktionsdesign', time: 'I dag, 08:15 - 12:00', location: 'Fibigerstræde 15' },
  { id: 2, title: 'Gruppearbejde: Semesterprojekt', time: 'I morgen, 10:00 - 15:00', location: 'Kroghstræde 3' },
  { id: 3, title: 'Workshop: CSS & Advanced Grid', time: 'Fredag, 12:30 - 14:00', location: 'Online' },
]

const mockCourseProgress = [
  { id: 1, title: 'Digital Design og Kommunikation', percentage: 75 },
  { id: 2, title: 'Webudvikling og CMS', percentage: 40 },
  { id: 3, title: 'Videnskabsteori', percentage: 90 },
]

const dashboardForumPosts = [
  { id: 501, category: 'forumPosts', titleDa: 'Spørgsmål til litteraturen i uge 2', titleEn: 'Questions regarding literature week 2', iconName: 'MessageCircle', author: 'Jacob Andersen', timeDa: 'For 2 timer siden', timeEn: '2 hours ago', replies: 3, important: false },
  { id: 102, category: 'forumPosts', titleDa: 'Aflyst forelæsning i morgen', titleEn: 'Cancelled lecture tomorrow', iconName: 'AlertCircle', author: 'Morten Jensen', timeDa: 'I gør', timeEn: 'Yesterday', replies: 12, important: true },
  { id: 103, category: 'forumPosts', titleDa: 'Læsegruppe søges', titleEn: 'Study group wanted', iconName: 'Users', timeDa: 'For 3 dage siden', timeEn: '3 days ago', replies: 5, important: false }
]

// 2. Helper Hooks & Skeleton Primitives
function useWidgetGrid(widgets: WidgetItem[], onLayoutChange?: (widgets: WidgetItem[]) => void) {
  const handleSizeChange = (id: string, newSize: 'small' | 'medium' | 'large') => {
    if (!onLayoutChange) return
    const updated = widgets.map((w) => {
      if (w.id === id) {
        return {
          ...w,
          size: newSize,
          span: SIZE_TO_SPAN[newSize],
        }
      }
      return w
    })
    onLayoutChange(updated)
  }

  const handleMoveUp = (index: number) => {
    if (!onLayoutChange || index === 0) return
    const updated = [...widgets]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    onLayoutChange(updated)
  }

  const handleMoveDown = (index: number) => {
    if (!onLayoutChange || index === widgets.length - 1) return
    const updated = [...widgets]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    onLayoutChange(updated)
  }

  return { handleSizeChange, handleMoveUp, handleMoveDown }
}

function WidgetSkeletonBody() {
  return (
    <div className="flex flex-col gap-xs p-sm animate-pulse">
      <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded mt-xs" />
      <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  )
}

function WidgetSkeletonHeader() {
  return (
    <div className="flex items-center gap-xs py-1 animate-pulse">
      <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 shrink-0" />
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  )
}

function WidgetError({ widgetTitle, onRetry, lang }: { widgetTitle: string; onRetry: () => void; lang: 'da' | 'en' }) {
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-sm py-lg px-md text-center"
    >
      <AlertCircle className="text-danger/60 shrink-0" size={20} aria-hidden="true" />
      <span className="text-sm font-semibold text-main">
        {l(`Kunne ikke hente ${widgetTitle}`, `Could not load ${widgetTitle}`)}
      </span>
      <span className="text-xs text-muted max-w-[200px] leading-relaxed">
        {l('Forbindelsen afbrød eller timeout.', 'Connection failed or timed out.')}
      </span>
      <button
        onClick={onRetry}
        className="min-h-[44px] px-md text-sm font-bold text-primary border border-primary/40 rounded-[var(--radius-md)] hover:bg-primary/5 transition-colors focus-visible:shadow-focus focus-visible:outline-none"
        aria-label={l(`Prøv igen for ${widgetTitle}`, `Retry ${widgetTitle}`)}
      >
        {l('Prøv igen', 'Retry')}
      </button>
    </div>
  )
}

function WidgetPermissionDeniedBody({ lang }: { lang: 'da' | 'en' }) {
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;
  return (
    <div className="flex flex-col items-center justify-center gap-xs py-lg px-md text-center">
      <span className="text-xs font-semibold text-main">
        {l('Ingen adgang', 'Access Denied')}
      </span>
      <span className="text-xs text-muted max-w-[200px] leading-relaxed">
        {l('Du har ikke tilladelse til at se dette modul.', 'You do not have permission to view this widget.')}
      </span>
    </div>
  )
}

function WidgetStateWrapper({ id, size, children }: { id: string; size: 'small' | 'medium' | 'large'; children: ReactNode }) {
  const lang = useStore(state => state.lang);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'permission_denied'>(() => {
    if (id === 'courseProgress') return 'permission_denied';
    return 'loading';
  });

  const loadData = useCallback(() => {
    if (id === 'courseProgress') {
      setStatus('permission_denied');
      return;
    }
    setStatus('loading');

    const timeoutTimer = setTimeout(() => {
      setStatus('error');
    }, 10000);

    const loadTimer = setTimeout(() => {
      setStatus('success');
      clearTimeout(timeoutTimer);
    }, 400);

    return { loadTimer, timeoutTimer };
  }, [id]);

  useEffect(() => {
    const timers = loadData();
    return () => {
      if (timers) {
        clearTimeout(timers.loadTimer);
        clearTimeout(timers.timeoutTimer);
      }
    };
  }, [id, loadData]);

  const widgetTitle = WIDGET_TITLES[id]?.[lang as 'da' | 'en'] ?? id;

  if (status === 'loading') {
    return (
      <Card className={`w-full flex flex-col overflow-hidden shadow-[var(--shadow-sm)] border-[var(--border-color)]/60 ${size === 'small' ? 'min-h-[140px]' : size === 'medium' ? 'min-h-[200px]' : 'min-h-[300px]'}`}>
        <Card.Header padding="compact" className="border-b border-[var(--border-color)]/40 bg-bg-highlight/20">
          <WidgetSkeletonHeader />
        </Card.Header>
        <Card.Body padding="compact" className="flex-1">
          <WidgetSkeletonBody />
        </Card.Body>
      </Card>
    )
  }

  if (status === 'error') {
    return (
      <Card className="w-full flex flex-col overflow-hidden shadow-[var(--shadow-sm)] border-[var(--border-color)]/60">
        <Card.Header padding="compact" className="border-b border-[var(--border-color)]/40 bg-bg-highlight/20">
          <WidgetSkeletonHeader />
        </Card.Header>
        <Card.Body padding="compact" className="flex-1">
          <WidgetError widgetTitle={widgetTitle} onRetry={loadData} lang={lang} />
        </Card.Body>
      </Card>
    )
  }

  if (status === 'permission_denied') {
    return (
      <Card className="w-full flex flex-col overflow-hidden shadow-[var(--shadow-sm)] border-[var(--border-color)]/60">
        <Card.Header padding="compact" className="border-b border-[var(--border-color)]/40 bg-bg-highlight/20">
          <WidgetSkeletonHeader />
        </Card.Header>
        <Card.Body padding="compact" className="flex-1">
          <WidgetPermissionDeniedBody lang={lang} />
        </Card.Body>
      </Card>
    )
  }

  return children
}

interface WidgetProps {
  size?: 'small' | 'medium' | 'large'
}

const WIDGET_SHORTCUTS = [
  { name: 'Moodle', url: 'https://www.moodle.aau.dk' },
  { name: 'Digital Eksamen', url: 'https://eksamen.aau.dk' },
  { name: 'STADS Self-Service', url: 'https://stads.aau.dk' },
  { name: 'AAU Card', url: 'https://aaucard.aau.dk' },
  { name: 'AAU Webmail', url: 'https://mail.aau.dk' },
]

function ShortcutsWidgetInner({ size = 'small' }: { size?: 'small' | 'medium' | 'large' }) {
  const l = useL()

  const limit = size === 'small' ? 3 : size === 'medium' ? 4 : 5

  return (
    <Card className="shortcuts-widget h-full w-full flex flex-col group/widget overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300 border-[var(--border-color)]/60">
      <Card.Header padding="compact" className="border-b border-[var(--border-color)]/40 bg-bg-highlight/50 backdrop-blur-sm">
        <Stack direction="row" align="center" gap="xs">
          <div className="text-primary shrink-0">
            <Link2 size={18} strokeWidth={2} />
          </div>
          <Heading level={2} as="h2" className="m-0 text-sm font-bold text-main">
            {l('Genveje', 'Shortcuts')}
          </Heading>
        </Stack>
      </Card.Header>
      <Card.Body padding="compact" className="p-[var(--space-xs)] flex flex-col gap-[var(--space-2xs)] justify-center">
        <div className="flex flex-col gap-1">
          {WIDGET_SHORTCUTS.slice(0, limit).map((s, idx) => (
            <a
              key={idx}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-sm px-sm hover:bg-bg-hover rounded-[var(--radius-md)] text-xs font-semibold text-main transition-colors group/shortcut-link border border-transparent hover:border-[var(--border-color)]/30 min-h-[44px]"
            >
              <span className="truncate">{s.name}</span>
              <span className="shrink-0 flex items-center gap-1 text-text-muted text-[10px] font-medium opacity-0 group-hover/shortcut-link:opacity-100 transition-all duration-200">
                <span>{l('åbn', 'open')}</span>
                <ExternalLink size={12} strokeWidth={2.5} />
              </span>
            </a>
          ))}
        </div>
      </Card.Body>
    </Card>
  )
}

const ShortcutsWidget = memo(ShortcutsWidgetInner)

// 4. SupportWidget
function SupportWidget({ size = 'medium' }: WidgetProps) {
  const t = useStore(state => state.t)
  const l = useL()
  return (
    <Card className="support-widget h-full w-full flex flex-col group/widget overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300 border-[var(--border-color)]/60">
      <Card.Header padding="compact" className="border-b border-[var(--border-color)]/40 bg-bg-highlight/50 backdrop-blur-sm">
        <Stack direction="row" align="center" gap="xs">
          <div className="text-primary shrink-0">
            <Headphones size={18} strokeWidth={2} />
          </div>
          <Heading level={2} as="h2" className="m-0 text-sm font-bold text-main">
            {t('contact_its_support')}
          </Heading>
        </Stack>
      </Card.Header>
      <Card.Body padding="compact" className="p-[var(--space-xs)] flex flex-col justify-center gap-[var(--space-2xs)]">
        {size !== 'small' && (
          <Text size="xs" className="text-text-muted leading-relaxed">
            {t('aau_it_services')}
          </Text>
        )}
        
        {size === 'large' && (
          <div className="flex flex-col gap-[2px] text-[11px] text-muted border-y border-[var(--border-color)]/40 py-[var(--space-2xs)] my-[var(--space-2xs)]">
            <div className="flex justify-between">
              <span className="font-bold">{l('Telefon:', 'Phone:')}</span>
              <span>+45 9940 2020</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">{l('Åbningstider:', 'Hours:')}</span>
              <span>{l('Man-Fre 08:00–15:30', 'Mon-Fri 08:00–15:30')}</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => env.open('https://support.its.aau.dk/')}
          className="inline-flex items-center gap-xs text-xs text-primary hover:text-primary/80 font-semibold transition-colors group/support-btn self-start"
        >
          <ExternalLink size={12} strokeWidth={2} className="shrink-0" />
          <span className="group-hover/support-btn:underline underline-offset-2">{t('contact_support')}</span>
        </button>
      </Card.Body>
    </Card>
  )
}

// 5. QuickOverviewWidget
const getBadgeInfo = (event: OverviewEvent, lang: 'da' | 'en') => {
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;
  if (event.time === '23:59') {
    return {
      text: l('Aflevering', 'Submission'),
      badgeClass: 'bg-[var(--color-bg-danger-tint)] text-[var(--color-danger)] border-[var(--color-danger)]/30',
      Icon: AlertCircle
    }
  }
  if (event.titleKey === 'study_group') {
    return {
      text: l('Studiegruppe', 'Study Group'),
      badgeClass: 'bg-accent/10 text-accent border-accent/20',
      Icon: Users
    }
  }
  return {
    text: l('Undervisning', 'Class'),
    badgeClass: 'bg-primary/5 text-primary border-primary/20',
    Icon: Clock,
    iconBgClass: 'bg-[var(--color-bg-warning-tint)] text-[var(--aau-dark-orange)] border-[var(--aau-dark-orange)]/20'
  }
}

const OverviewItem = memo(({
  event,
  onClick
}: {
  event: OverviewEvent,
  onClick: () => void
}) => {
  const t = useStore(state => state.t)
  const lang = useStore(state => state.lang)
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;

  const { text, badgeClass, Icon } = getBadgeInfo(event, lang)

  const title = event.titleKey === 'project_report'
    ? l('Projektrapport skal afleveres', 'Submit Projektrapport')
    : t(event.titleKey)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className="flex items-center gap-md p-xs border border-[var(--border-color)]/40 rounded-[var(--radius-md)] bg-bg-card hover:bg-bg-hover cursor-pointer transition-colors min-h-[52px]"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="flex flex-col w-[50px] shrink-0 justify-center">
        <span className="font-mono text-xs font-semibold text-muted">{event.time}</span>
      </div>

      <div className="flex flex-col gap-4xs flex-1 min-w-0">
        <div className="flex items-center gap-xs flex-wrap">
          <Text size="sm" weight="bold" className="text-main truncate">
            {title} {event.moduleKey && `· ${t(event.moduleKey)}`}
          </Text>
          <span className={`inline-flex items-center gap-xs px-1.5 py-0.5 rounded text-[10px] font-medium border ${badgeClass}`}>
            <Icon size={10} className="shrink-0" />
            {text}
          </span>
        </div>
        {event.location && (
          <div className="flex items-center gap-sm text-xs text-muted flex-wrap">
            <span className="flex items-center gap-4xs">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{event.location}</span>
            </span>
          </div>
        )}
      </div>
      <ChevronRight size={16} className="text-muted/60 shrink-0" />
    </div>
  )
})

export const QuickOverviewWidget = memo(function QuickOverviewWidget({ size: _size = 'medium' }: WidgetProps) {
  const navigate = useNavigate()
  const t = useStore(state => state.t)
  const l = useL()

  const handleGoToCalendar = useCallback(() => {
    navigate(PATHS.CALENDAR)
  }, [navigate])

  const limit = 3

  return (
    <Card className="quick-overview-widget h-full w-full flex flex-col group/widget overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300 border-[var(--border-color)]/60">
      <Card.Header padding="compact" className="border-b border-[var(--border-color)]/40 bg-bg-highlight/50 backdrop-blur-sm">
        <Stack direction="row" align="center" gap="sm">
          <div className="p-[var(--space-2xs)] bg-primary text-white rounded-[var(--radius-md)] shadow-sm">
            <Calendar size={18} strokeWidth={2} />
          </div>
          <Heading level={2} as="h2" className="m-0 text-sm font-bold text-main">
            {t('dashboard.widget_quickOverview')}
          </Heading>
        </Stack>
        <Button
          variant="ghost"
          size="xs"
          iconRight={ChevronRight}
          onClick={handleGoToCalendar}
          className="text-xs font-bold text-primary dark:text-white"
        >
          {l('Se kalender', 'See calendar')}
        </Button>
      </Card.Header>

      <Card.Body padding="compact" className="p-[var(--space-xs)] flex-1 flex flex-col justify-center">
        <div className="w-full flex flex-col gap-[var(--space-2xs)]">
          <Text size="xs" weight="bold" className="text-text-muted uppercase tracking-wider mb-[2px]">
            {t('todays_schedule')}
          </Text>
          {todayEvents.slice(0, limit).map((event) => (
            <OverviewItem
              key={event.titleKey}
              event={event}
              onClick={handleGoToCalendar}
            />
          ))}
        </div>
      </Card.Body>
    </Card>
  )
})

// 6. MessagesWidget
interface MessagesWidgetProps extends WidgetProps {
  hideFirst?: boolean
  isPriorityElevated?: boolean
}

function MessagesWidget({ size = 'medium', isPriorityElevated = false }: MessagesWidgetProps) {
  const navigate = useNavigate()
  const t = useStore(state => state.t)
  const l = useL()

  const sortedMessages = useMemo(() => {
    return [...mockMessages].sort((a, b) => {
      if (a.unread && !b.unread) return -1
      if (!a.unread && b.unread) return 1
      return 0
    })
  }, [])

  const limit = size === 'small' ? 2 : 3
  const displayMessages = useMemo(() => {
    return sortedMessages.slice(0, limit)
  }, [sortedMessages, limit])

  return (
    <Card className="messages-widget w-full flex flex-col group/widget overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300 border-[var(--border-color)]/60">
      <Card.Header padding="compact" className="border-b border-[var(--border-color)]/40 bg-bg-highlight/50 backdrop-blur-sm">
        <Stack direction="row" align="center" gap="xs">
          <div className="text-primary shrink-0">
            <MessageSquare size={18} strokeWidth={2} />
          </div>
          <Heading level={2} as="h2" className="m-0 text-sm font-bold text-main">
            {t('nav.messages')}
          </Heading>
          {isPriorityElevated && (
            <span className="px-1.5 py-[2px] text-[10px] font-bold text-primary bg-primary/10 rounded-sm leading-none shrink-0">
              {l('Prioriteret', 'Priority')}
            </span>
          )}
          {mockMessages.filter(m => m.unread).length > 0 && (
            <span className="px-1.5 py-[2px] text-[10px] font-bold text-primary bg-primary/10 rounded-sm leading-none shrink-0">
              {mockMessages.filter(m => m.unread).length} {l('ulæst', 'unread')}
            </span>
          )}
        </Stack>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm font-extrabold text-primary dark:text-white normal-case tracking-normal hover:underline h-[44px] min-h-[44px] px-md flex items-center"
          onClick={() => navigate(PATHS.MESSAGES)}
          iconRight={ChevronRight}
          aria-label={l('Se alle', 'See all')}
        >
          {l('Se alle', 'See all')}
        </Button>
      </Card.Header>
      <Card.Body padding="compact" className="p-[var(--space-xs)] flex-1 flex flex-col justify-center">
        {displayMessages.length > 0 ? (
          <div className="flex flex-col gap-2xs w-full">
            {displayMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => navigate(PATHS.MESSAGES)}
                className={`flex items-start justify-between py-sm px-sm border-b border-border/30 last:border-0 hover:bg-bg-hover cursor-pointer transition-colors gap-xs group/row ${
                  msg.unread ? 'bg-primary/5 dark:bg-primary/10' : ''
                }`}
                role="button"
                tabIndex={0}
                aria-label={msg.unread ? l(`Ulæst besked fra ${msg.sender}: ${msg.subject}`, `Unread message from ${msg.sender}: ${msg.subject}`) : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                     navigate(PATHS.MESSAGES)
                  }
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-xs">
                    {msg.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mr-1 animate-pulse" aria-hidden="true" />}
                    <span className="text-sm font-bold text-main truncate block">
                      {msg.sender}
                    </span>
                    {msg.unread && (
                      <span className="px-2 py-[3px] text-xs font-bold text-primary bg-primary/10 rounded-sm leading-none shrink-0">
                        {l('Ulæst', 'Unread')}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-text-secondary truncate block mt-3xs leading-relaxed">
                    {msg.subject}
                  </span>
                </div>
                <div className="flex items-center gap-xs ml-sm shrink-0">
                  <span className="text-xs text-text-muted leading-relaxed">{msg.time}</span>
                  <ChevronRight size={14} className="text-muted opacity-40 group-hover/row:opacity-100 group-hover/row:translate-x-[2px] transition-all duration-200 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-text-muted italic py-xs text-center leading-relaxed">
            {l('Ingen beskeder', 'No messages')}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

// 7. CalendarWidget
function CalendarWidget({ size: _size = 'medium' }: WidgetProps) {
  const navigate = useNavigate()
  const t = useStore(state => state.t)
  const l = useL()

  const todayEventsList = useMemo(() => {
    return mockCalendarEvents.filter(e => 
      e.time.toLowerCase().includes('i dag') || e.time.toLowerCase().includes('today')
    )
  }, [])

  const upcomingEvent = useMemo(() => {
    if (todayEventsList.length > 0) return null
    return mockCalendarEvents.find(e => 
      !e.time.toLowerCase().includes('i dag') && !e.time.toLowerCase().includes('today')
    ) || null
  }, [todayEventsList])

  const handleSeeAll = useCallback(() => {
    navigate(PATHS.CALENDAR)
  }, [navigate])

  return (
    <Card className="calendar-widget w-full flex flex-col group/widget overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300 border-[var(--border-color)]/60">
      <Card.Header padding="compact" className="border-b border-[var(--border-color)]/40 bg-bg-highlight/50 backdrop-blur-sm">
        <Stack direction="row" align="center" gap="xs">
          <div className="text-primary shrink-0">
            <Calendar size={18} strokeWidth={2} />
          </div>
          <Heading level={2} as="h2" className="m-0 text-sm font-bold text-main">
            {t('nav.calendar')}
          </Heading>
        </Stack>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs font-medium text-primary dark:text-white normal-case tracking-normal hover:underline h-[44px] min-h-[44px] px-md flex items-center" 
          onClick={handleSeeAll} 
          iconRight={ChevronRight}
          aria-label={l('Åbn kalender', 'Open calendar')}
        >
          {l('Åbn kalender', 'Open calendar')}
        </Button>
      </Card.Header>
      <Card.Body padding="compact" className="p-[var(--space-xs)] flex-1 flex flex-col gap-sm overflow-y-auto">
        <div className="flex flex-col gap-2xs">
          <div className="text-xs font-semibold text-text-secondary mb-xs">
            {l('Dagens program', "Today's Schedule")}
          </div>
          {todayEventsList.length > 0 ? (
            <div className="flex flex-col gap-2xs">
              {todayEventsList.map((evt) => (
                <div
                  key={evt.id}
                  onClick={handleSeeAll}
                  className="flex items-center justify-between py-sm px-md border border-[var(--border-color)]/60 bg-bg-highlight/20 rounded-[var(--radius-md)] hover:bg-bg-hover cursor-pointer transition-colors min-h-[52px] group/row"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-bold text-main truncate block">{evt.title}</span>
                    <div className="text-xs text-text-secondary mt-[2px] leading-relaxed font-medium">
                      {evt.time} {evt.location && `· ${evt.location}`}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted opacity-40 group-hover/row:opacity-100 group-hover/row:translate-x-[2px] transition-all duration-200 shrink-0" />
                </div>
              ))}
            </div>
          ) : upcomingEvent ? (
            <div className="flex flex-col gap-2xs">
              <div className="text-xs text-text-secondary italic pl-xs mb-xs leading-relaxed">
                {l('Ingen planlagte aktiviteter i dag. Næste aftale:', 'No activities today. Next appointment:')}
              </div>
              <div className="flex flex-col gap-2xs">
                <div
                  key={upcomingEvent.id}
                  onClick={handleSeeAll}
                  className="flex items-center justify-between py-sm px-md border border-[var(--border-color)]/60 bg-bg-highlight/20 rounded-[var(--radius-md)] hover:bg-bg-hover cursor-pointer transition-colors min-h-[52px] group/row"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-bold text-main truncate block">{upcomingEvent.title}</span>
                    <div className="text-xs text-text-secondary mt-[2px] leading-relaxed font-medium">
                      {upcomingEvent.time} {upcomingEvent.location && `· ${upcomingEvent.location}`}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted opacity-40 group-hover/row:opacity-100 group-hover/row:translate-x-[2px] transition-all duration-200 shrink-0" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-text-secondary italic py-2xs pl-xs leading-relaxed">
              {l('Ingen kalenderaftaler', 'No calendar appointments')}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}

// 8. CourseProgressWidget
function CourseProgressWidget({ size = 'medium' }: WidgetProps) {
  const t = useStore(state => state.t)
  const limit = size === 'small' ? 1 : size === 'medium' ? 2 : 3

  return (
    <Card className="course-progress-widget h-full w-full flex flex-col group/widget overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300 border-[var(--border-color)]/60">
      <Card.Header padding="compact" className="border-b border-[var(--border-color)]/40 bg-bg-highlight/50 backdrop-blur-sm">
        <Stack direction="row" align="center" gap="xs">
          <div className="text-primary shrink-0">
            <Trophy size={18} strokeWidth={2} />
          </div>
          <Heading level={2} as="h2" className="m-0 text-sm font-bold text-main">
            {t('common.your_progress')}
          </Heading>
        </Stack>
      </Card.Header>
      <Card.Body padding="compact" className="p-[var(--space-xs)] flex-1 flex flex-col justify-center">
        <div className="flex flex-col gap-xs w-full">
          {mockCourseProgress.slice(0, limit).map((course) => (
            <div key={course.id} className="flex flex-col gap-[2px]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-main truncate max-w-[80%]">{course.title}</span>
                <span className="text-xs text-text-muted font-bold">{course.percentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-bg-highlight rounded-full overflow-hidden border border-[var(--border-color)]/20">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${course.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  )
}

// 9. DeadlinesWidget
const getUrgencyIcon = (urgency: string) => {
  if (urgency === 'overdue') return AlertCircle;
  return Clock;
};

const getLabelClass = (urgency: string) => {
  if (urgency === 'overdue') return 'font-black tracking-tight';
  if (urgency === 'today') return 'font-bold';
  if (urgency === 'tomorrow' || urgency === 'soon') return 'font-semibold';
  return 'font-normal';
};

const getColorClass = (urgency: string) => {
  if (urgency === 'overdue' || urgency === 'today') return 'text-danger';
  if (urgency === 'tomorrow' || urgency === 'soon') return 'text-warning';
  return 'text-muted';
};

function DeadlineEmpty({ t }: { t: (key: string) => string }) {
  return (
    <Stack align="center" justify="center" gap="sm" className="h-full py-[var(--space-lg)] opacity-50 italic">
      <CheckCircle2 size={32} className="text-[var(--aau-dark-green)]/40" />
      <Text size="xs">{t('all_caught_up')}</Text>
    </Stack>
  );
}

function DeadlineCardSmall({ deadlines, onDeadlineClick, lang }: { deadlines: ProcessedDeadline[]; onDeadlineClick: (dl: ProcessedDeadline) => void; lang: string }) {
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;
  const nextDl = deadlines[0];

  return (
    <div className="flex flex-col gap-2xs flex-1 justify-center">
      <MasterItem
        onClick={() => onDeadlineClick(nextDl)}
        className="py-sm px-md border rounded-[var(--radius-md)] border-[var(--border-color)]/60 bg-bg-highlight/40 hover:bg-bg-hover group/row"
        leading={
          <div className="shrink-0 flex items-center justify-center" style={{ color: nextDl.info.color }} title={nextDl.info.label}>
            {React.createElement(getUrgencyIcon(nextDl.info.urgency), { size: 14, strokeWidth: 2.5 })}
            <span className="sr-only">{nextDl.info.label}</span>
          </div>
        }
        title={
          <div className="flex items-center gap-xs flex-wrap">
            <span className="text-sm font-bold text-main truncate block">
              {nextDl.title}
            </span>
            {nextDl.info.urgency === 'today' && (
              <span 
                className="px-1.5 py-0.5 text-xs font-bold rounded-[var(--radius-xs)] shrink-0 text-white leading-none" 
                style={{ backgroundColor: 'var(--color-badge-urgent)' }}
              >
                {l('Forfalder i dag', 'Due today')}
              </span>
            )}
          </div>
        }
        subtitle={
          <span style={{ color: nextDl.info.color }} className={`${getLabelClass(nextDl.info.urgency)} ${getColorClass(nextDl.info.urgency)} text-xs block mt-3xs leading-relaxed`}>
            {nextDl.info.label}
          </span>
        }
        trailing={
          <ChevronRight size={14} className="text-muted opacity-40 group-hover/row:opacity-100 group-hover/row:translate-x-[2px] transition-all duration-200 shrink-0" />
        }
      />
    </div>
  );
}

function DeadlineCardMedium({ deadlines, onDeadlineClick, lang }: { deadlines: ProcessedDeadline[]; onDeadlineClick: (dl: ProcessedDeadline) => void; lang: string }) {
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;
  return (
    <div className="flex flex-col gap-2xs flex-1 justify-center">
      {deadlines.map((dl, idx) => (
        <div
          key={dl.id}
          onClick={() => onDeadlineClick(dl)}
          className={`flex items-center justify-between py-sm px-sm border-b border-border/30 last:border-0 cursor-pointer transition-colors group/row min-h-[44px] ${
            dl.info.urgency === 'overdue' ? 'bg-danger/5' : ''
          } hover:bg-bg-hover`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onDeadlineClick(dl); }}
        >
          <div className="flex items-center gap-xs min-w-0 flex-1">
            <div className="shrink-0" style={{ color: dl.info.color }} title={dl.info.label}>
              {React.createElement(getUrgencyIcon(dl.info.urgency), { size: 14, strokeWidth: 2.5 })}
              <span className="sr-only">{dl.info.label}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-xs flex-wrap">
                <span className="text-sm font-bold text-main truncate block">{dl.title}</span>
                {idx === 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-extrabold rounded-[var(--radius-xs)] leading-none shrink-0" style={{ color: dl.info.color, backgroundColor: `${dl.info.color}15` }}>
                    {l('Vigtig aflevering', 'Important assignment')}
                  </span>
                )}
                {dl.info.urgency === 'today' && (
                  <span 
                    className="px-1.5 py-0.5 text-xs font-bold rounded-[var(--radius-xs)] shrink-0 text-white leading-none" 
                    style={{ backgroundColor: 'var(--color-badge-urgent)' }}
                  >
                    {l('Forfalder i dag', 'Due today')}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-text-secondary truncate block mt-3xs leading-relaxed">{dl.courseTitle}</span>
              <Stack direction="row" gap="xs" align="center" className="mt-2xs flex-wrap">
                <span style={{ color: dl.info.color }} className={`${getLabelClass(dl.info.urgency)} ${getColorClass(dl.info.urgency)} text-xs font-bold`}>
                  {dl.info.relativeLabel}
                </span>
                <span className="text-border/60 text-xs hidden sm:inline">&bull;</span>
                <span className="text-xs text-text-secondary">
                  {dl.info.dateLabel}
                </span>
              </Stack>
            </div>
          </div>
          <div className="flex items-center gap-xs ml-sm shrink-0">
            <ChevronRight size={14} className="text-muted opacity-40 group-hover/row:opacity-100 group-hover/row:translate-x-[2px] transition-all duration-200 shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DeadlineCardLarge({ deadlines, onDeadlineClick, lang, t }: { deadlines: ProcessedDeadline[]; onDeadlineClick: (dl: ProcessedDeadline) => void; lang: string; t: (key: string) => string }) {
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;
  return (
    <div className="flex flex-col gap-2xs flex-1">
      {deadlines.map((dl, idx) => (
        <MasterItem
          key={dl.id}
          onClick={() => onDeadlineClick(dl)}
          className={`py-sm px-md border rounded-[var(--radius-md)] hover:bg-bg-hover hover:border-[var(--border-color)]/50 group/row ${
            idx === 0 ? 'bg-bg-highlight/40 border-primary/30' : 'bg-transparent border-transparent'
          }`}
          leading={
            <div className="shrink-0 flex items-center justify-center" style={{ color: dl.info.color }} title={dl.info.label}>
              {React.createElement(getUrgencyIcon(dl.info.urgency), { size: 16, strokeWidth: 2.5 })}
              <span className="sr-only">{dl.info.label}</span>
            </div>
          }
          title={
            <div className="flex items-center gap-xs flex-wrap">
              <span className="text-sm font-bold text-main truncate block">{dl.title}</span>
              {idx === 0 && (
                <span className="px-1.5 py-0.5 text-xs font-extrabold rounded-[var(--radius-xs)] leading-none shrink-0" style={{ color: dl.info.color, backgroundColor: `${dl.info.color}15` }}>
                  {l('Vigtig', 'Important')}
                </span>
              )}
              {dl.info.urgency === 'today' && (
                <span 
                  className="px-1.5 py-0.5 text-xs font-bold rounded-[var(--radius-xs)] shrink-0 text-white leading-none" 
                  style={{ backgroundColor: 'var(--color-badge-urgent)' }}
                >
                  {l('Forfalder i dag', 'Due today')}
                </span>
              )}
            </div>
          }
          subtitle={
            <span className="truncate max-w-[120px] text-sm font-medium text-text-secondary mt-3xs leading-relaxed block">{dl.courseTitle}</span>
          }
          trailing={
            <div className="flex items-center gap-xs">
              <div className="flex flex-col items-end shrink-0 ml-sm text-right min-w-[120px]">
                <span style={{ color: dl.info.color }} className={`${getLabelClass(dl.info.urgency)} ${getColorClass(dl.info.urgency)} text-xs font-bold block`}>
                  {dl.info.relativeLabel}
                </span>
                <span className="text-xs text-text-secondary block mt-3xs">
                  {dl.info.dateLabel}
                </span>
              </div>
              <Button
                variant={idx === 0 ? "primary" : "ghost"}
                size="xs"
                className="font-bold text-xs normal-case tracking-normal h-8 min-h-[32px] px-sm shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeadlineClick(dl);
                }}
              >
                {t('go_to_assignment')}
              </Button>
              <ChevronRight size={14} className="text-muted opacity-40 group-hover/row:opacity-100 group-hover/row:translate-x-[2px] transition-all duration-200 shrink-0" />
            </div>
          }
        />
      ))}
    </div>
  );
}

interface DeadlinesWidgetProps extends WidgetProps {
  hideFirst?: boolean
}

export function DeadlinesWidget({ size = 'medium', hideFirst = false }: DeadlinesWidgetProps) {
  const navigate = useNavigate();
  const t = useStore(state => state.t);
  const l = useL()
  const lang = useStore(state => state.lang);
  const localize = useStore(state => state.localize);
  const courses = useStore(state => state.courses);

  const limit = size === 'small' ? 1 : size === 'medium' ? 3 : 5;

  const deadlines = useMemo(() => {
    const start = hideFirst ? 1 : 0;
    const end = limit + (hideFirst ? 1 : 0);
    return mockDashboardDeadlines.slice(start, end).map((deadline) => {
      const deadlineDate = new Date();
      deadlineDate.setHours(deadlineDate.getHours() + deadline.deadlineHoursFromNow);
      const info = getDeadlineInfo(deadlineDate, lang);
      const course = courses.find(c => c.id === deadline.courseId);
      const courseTitle = course ? localize(course, 'title') : '';
      return {
        ...deadline,
        deadlineDate: deadlineDate.toISOString(),
        courseTitle,
        title: localize(deadline, 'title'),
        info,
      };
    });
  }, [localize, courses, limit, hideFirst, lang]);

  const upcomingCount = useMemo(() => {
    return deadlines.filter(dl => dl.info.urgency !== 'overdue').length;
  }, [deadlines]);

  const handleSeeAll = useCallback(() => {
    navigate(PATHS.CALENDAR);
  }, [navigate]);

  const handleDeadlineClick = useCallback((dl: ProcessedDeadline) => {
    navigate(PATHS.SUBMISSION(dl.courseId, dl.id));
  }, [navigate]);

  return (
    <Card className="deadlines-widget w-full flex flex-col group/widget overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300 border-[var(--border-color)]/60">
      <Card.Header padding="compact" className="border-b border-[var(--border-color)]/40 bg-bg-highlight/50 backdrop-blur-sm">
        <Stack direction="row" align="center" gap="sm">
          <div className="text-primary shrink-0">
            <Clock size={18} strokeWidth={2} />
          </div>
          <div>
            <Heading level={2} as="h2" className="m-0 text-sm font-bold text-main">
              {l(
                deadlines.length === 1 ? 'Næste aflevering' : 'Næste afleveringer',
                deadlines.length === 1 ? 'Next assignment' : 'Next assignments'
              )}
            </Heading>
            {size !== 'small' && (
              <span className="text-xs text-text-muted font-semibold block mt-3xs leading-relaxed">
                {l(`${upcomingCount} kommende`, `${upcomingCount} upcoming`)}
              </span>
            )}
          </div>
        </Stack>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm font-extrabold text-primary dark:text-white normal-case tracking-normal hover:underline h-[44px] min-h-[44px]"
          onClick={handleSeeAll}
          iconRight={ChevronRight}
          aria-label={l('Se alle', 'See all')}
        >
          {l('Se alle', 'See all')}
        </Button>
      </Card.Header>
      <Card.Body padding="compact" className="p-[var(--space-xs)] flex-1 flex flex-col gap-[var(--space-xs)]">
        {deadlines.length > 0 ? (
          size === 'small' ? (
            <DeadlineCardSmall deadlines={deadlines} onDeadlineClick={handleDeadlineClick} lang={lang} />
          ) : size === 'medium' ? (
            <DeadlineCardMedium deadlines={deadlines} onDeadlineClick={handleDeadlineClick} lang={lang} />
          ) : (
            <DeadlineCardLarge deadlines={deadlines} onDeadlineClick={handleDeadlineClick} lang={lang} t={t} />
          )
        ) : (
          <DeadlineEmpty t={t} />
        )}
      </Card.Body>
    </Card>
  );
}

// 10. FavoritesWidget
const getFavoriteMetadata = (item: ResolvedFavorite, lang: 'da' | 'en') => {
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;
  if (item.type === 'course') {
    const course = dataCourses[item.entityId]
    if (course?.nextAssignment) {
      return l(`Næste aflevering: ${course.nextAssignment.deadline}`, `Next assignment: ${course.nextAssignment.deadlineEn}`);
    }
    return l('Opdateret i går', 'Updated yesterday');
  }
  if (item.type === 'file') {
    for (const course of Object.values(dataCourses)) {
      for (const section of course.sections) {
        const fileItem = section.items.find(i => i.id === item.entityId)
        if (fileItem) {
          const ext = (fileItem.type || 'PDF').toUpperCase()
          return l(`${ext} · Opdateret 10. jun`, `${ext} · Updated Jun 10`);
        }
      }
    }
    return l('PDF · Opdateret nyligt', 'PDF · Recently updated');
  }
  if (item.type === 'tool') {
    return l('Eksternt værktøj', 'External tool');
  }
  if (item.type === 'forum') {
    return l('Forum · Aktivt', 'Forum · Active');
  }
  return ''
}

function FavoritesWidgetInner({ size = 'medium' }: WidgetProps) {
  const navigate = useNavigate()
  const t = useStore(state => state.t)
  const l = useL()
  const lang = useStore(state => state.lang)
  const favorites = useStore(state => state.favorites)
  const courses = useStore(state => state.courses)
  const resolved = useMemo(() => {
    const sorted = sortFavorites(favorites)
    return sorted
      .map(fav => resolveFavorite(fav, lang, courses, t))
      .filter(Boolean) as ResolvedFavorite[]
  }, [favorites, lang, courses, t])

  const limit = size === 'small' ? 2 : size === 'medium' ? 6 : DASHBOARD_CONFIG.FAVORITES_LIMIT
  const overflow = favorites.length - limit
  const display = resolved.slice(0, limit)

  const handleSeeAll = useCallback(() => {
    navigate(PATHS.FAVORITES)
  }, [navigate])

  return (
    <Card className="widget-card h-full w-full favorites-widget shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300">
      <Card.Header padding="compact" className="bg-bg-highlight/50 border-b border-[var(--border-color)]">
        <Stack direction="row" align="center" gap="sm">
          <div className="text-primary shrink-0">
            <Star size={18} strokeWidth={2} />
          </div>
          <Heading level={2} as="h2" className="m-0 text-sm font-bold text-main">
            {t('dashboard.widget_favorites')}
          </Heading>
        </Stack>
        <Button variant="ghost" size="sm" className="text-sm font-extrabold text-primary dark:text-white normal-case tracking-normal hover:underline h-[44px] min-h-[44px]" onClick={handleSeeAll} iconRight={ChevronRight} aria-label={l('Se alle favoritter', 'See all favorites')}>
          {l('Se alle', 'See all')}
        </Button>
      </Card.Header>
      <Card.Body padding="compact" className="overflow-visible p-[var(--space-xs)] flex-1 flex flex-col justify-center">
        {display.length > 0 ? (
          <div className="flex flex-col gap-2xs w-full">
            {display.map((item) => {
              const metadata = getFavoriteMetadata(item, lang)
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.external) {
                      env.open(item.link)
                    } else {
                      navigate(item.link)
                    }
                  }}
                  className="flex items-center justify-between py-sm px-sm border-b border-border/30 last:border-0 cursor-pointer transition-colors group/row hover:bg-bg-hover"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (item.external) {
                        env.open(item.link)
                      } else {
                        navigate(item.link)
                      }
                    }
                  }}
                >
                  <div className="flex items-center gap-xs min-w-0 flex-1">
                    <div className="shrink-0" style={{ color: item.iconColor }}>
                      <item.icon size={16} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-xs">
                        <span className="text-sm font-bold text-main truncate block">{item.title}</span>
                        {item.external && <ExternalLink size={14} className="text-text-secondary shrink-0" />}
                      </div>
                      <span className="text-sm font-medium text-text-secondary truncate block mt-3xs leading-relaxed">{metadata}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-xs ml-sm shrink-0">
                    <ChevronRight size={14} className="text-muted opacity-40 group-hover/row:opacity-100 group-hover/row:translate-x-[2px] transition-all duration-200 shrink-0" />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center py-xs gap-[var(--space-2xs)]">
            <div className="text-primary/40 shrink-0">
              <Star size={24} strokeWidth={1.5} />
            </div>
            <Heading level={3} as="h3" className="text-xs font-bold text-main mt-xs">
              {l('Ingen favoritter endnu', 'No favorites yet')}
            </Heading>
            <Text size="xs" className="text-center max-w-[200px] text-text-muted italic">
              {l('Markér kurser som favoritter for at vise dem her.', 'Mark courses as favorites to show them here.')}
            </Text>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(PATHS.COURSES)}
              className="mt-xs font-bold text-xs h-[32px] min-h-[32px] flex items-center px-sm"
            >
              {l('Gå til kurser', 'Go to courses')}
            </Button>
          </div>
        )}
        {overflow > 0 && size !== 'small' && (
          <div className="mt-[var(--space-xs)] text-center pb-[var(--space-xs)]">
            <Text size="xs" weight="bold" className="text-primary uppercase tracking-widest opacity-60">
              {`+${overflow} ${t('more_favorites')}`}
            </Text>
          </div>
        )}
      </Card.Body>
      {display.length > 0 && size !== 'small' && (
        <Card.Footer padding="compact" className="bg-bg-highlight/30 border-t border-[var(--border-color)]/20 justify-between items-center cursor-pointer hover:bg-bg-hover transition-colors" onClick={handleSeeAll} role="button" tabIndex={0}>
          <Text size="xs" weight="medium" className="text-muted font-medium">{favorites.length} {favorites.length === 1 ? l('favorit', 'favorite') : l('favoritter', 'favorites')}</Text>
          <div className="flex items-center gap-1 opacity-0 group-hover/widget:opacity-100 transition-all duration-300 translate-x-2 group-hover/widget:translate-x-0">
            <Text size="xs" weight="bold" className="text-primary dark:text-white uppercase">{l('Se alle favoritter', 'See all favorites')}</Text>
            <ChevronRight size={14} strokeWidth={2.5} className="text-primary dark:text-white" />
          </div>
        </Card.Footer>
      )}
    </Card>
  )
}

export const FavoritesWidget = memo(FavoritesWidgetInner)

// 11. ForumWidgets (ForumAboutWidget & ForumWidget & ForumActivityWidget)
interface ForumAboutWidgetProps {
  post: Post
}

export const ForumAboutWidget = memo(function ForumAboutWidget({ post }: ForumAboutWidgetProps) {
  const t = useStore(state => state.t)
  const localize = useStore(state => state.localize)

  return (
    <Card>
      <Card.Header>
        <Text weight="bold" size="lg" className="card__title">
          {t('about_this_post')}
        </Text>
      </Card.Header>
      <Card.Body>
        <Stack gap="md">
          <Stack gap="2xs">
            <Text size="xs" weight="bold" muted className="text-uppercase">
              {t('author_label')}
            </Text>
            <Text size="sm">{post.author}</Text>
          </Stack>
          <Stack gap="2xs">
            <Text size="xs" weight="bold" muted className="text-uppercase">
              {t('time_label')}
            </Text>
            <Text size="sm">{localize(post, 'time')}</Text>
          </Stack>
          <Stack gap="2xs">
            <Text size="xs" weight="bold" muted className="text-uppercase">
              {t('replies')}
            </Text>
            <Text size="sm">{post.replies}</Text>
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  )
})

ForumAboutWidget.displayName = 'ForumAboutWidget';

interface ForumWidgetProps {
  professor: string
}

const PostItem = memo(forwardRef<HTMLButtonElement, {
  post: Post,
  onClick: (id: number) => void
}>(({ post, onClick }, ref) => {
  const t = useStore(state => state.t)

  return (
    <button
      ref={ref}
      type="button"
      className="forum-list-item w-full text-left flex items-center gap-[var(--space-md)] p-[var(--space-sm)] rounded-[var(--radius-xl)] transition-all duration-150 hover:bg-bg-hover cursor-pointer group/item outline-none focus-visible:outline-none focus-visible:shadow-focus border border-transparent hover:border-[var(--border-color)]/40"
      onClick={() => onClick(post.id)}
    >
      <Stack gap="xs" className="forum-list-item__content flex-1 min-w-0">
        <div className="flex items-center gap-[var(--space-xs)]">
          {post.important && (
            <Badge variant="warning" pill className="text-[0.625rem] uppercase tracking-tighter px-1.5 h-4 flex items-center">
              {t('important')}
            </Badge>
          )}
          <Text weight="bold" size="sm" className="forum-list-item__title text-main group-hover/item:text-primary transition-colors truncate leading-tight">
            {post.title}
          </Text>
        </div>
        <Text size="sm" className="text-text-muted truncate">
          {t('by')} <span className="font-bold text-main">{post.author}</span> &bull; {post.time}
        </Text>
      </Stack>

      <div className="flex flex-col items-end gap-[var(--space-4xs)] shrink-0">
        <div className="forum-list-item__reply-count flex items-center gap-1.5 px-[var(--space-xs)] py-[var(--space-4xs)] bg-bg-highlight rounded-[var(--radius-md)] border border-[var(--border-color)]/40 group-hover/item:border-primary/30 transition-colors">
          <Text weight="black" size="xs" className="text-primary dark:text-indigo-200 leading-none">{post.replies}</Text>
          <MessageCircle size={12} strokeWidth={2.5} className="text-primary dark:text-indigo-200 opacity-60" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all duration-300 -translate-x-1 group-hover/item:translate-x-0">
          <ArrowRight size={10} strokeWidth={3} className="text-primary" />
        </div>
      </div>
    </button>
  )
}))

PostItem.displayName = 'PostItem'

export const ForumWidget = memo(function ForumWidget({ professor }: ForumWidgetProps) {
  const t = useStore(state => state.t)
  const localize = useStore(state => state.localize)
  const navigate = useNavigate()

  const itemsToShow = 3
  const visiblePosts = useMemo(() => (
    dashboardForumPosts.slice(0, itemsToShow).map((post) => ({
      ...post,
      title: localize(post, 'title'),
      author: post.author || professor,
      time: localize(post, 'time'),
      important: !!post.important,
    }))
  ), [itemsToShow, localize, professor])

  const handleNewPost = useCallback(() => {
    navigate(PATHS.FORUM_NEW)
  }, [navigate])

  const handlePostClick = useCallback((id: number) => {
    navigate(PATHS.FORUM(id))
  }, [navigate])

  const handleViewAll = useCallback(() => {
    navigate(PATHS.FORUM_LIST)
  }, [navigate])

  return (
    <Card className="forum-widget h-full w-full flex flex-col group/widget overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300 border-[var(--border-color)]/60">
      <Card.Header padding="compact" className="border-b border-[var(--border-color)]/40 bg-bg-highlight/50 backdrop-blur-sm">
        <Stack direction="row" align="center" gap="sm">
          <div className="p-[var(--space-2xs)] bg-primary text-white rounded-[var(--radius-md)] shadow-sm">
            <MessageCircle size={18} strokeWidth={2} />
          </div>
          <Heading level={2} as="h2" className="m-0 text-sm font-bold text-main">
            {t('forum')}
          </Heading>
        </Stack>

        <Button
          variant="ghost"
          size="xs"
          className="normal-case tracking-normal font-bold text-primary hover:bg-bg-card/50"
          onClick={handleNewPost}
          icon={Plus}
        >
          {t('new_post')}
        </Button>
      </Card.Header>

      <Card.Body padding="compact" className="p-[var(--space-md)] flex-1">
        <div className="h-full w-full flex flex-col gap-[var(--space-xs)] forum-list">
          {visiblePosts.map((post) => (
            <PostItem
              key={post.id}
              post={post as Post}
              onClick={handlePostClick}
            />
          ))}
        </div>
      </Card.Body>

      <Card.Footer padding="compact" className="bg-bg-highlight/30 border-t border-[var(--border-color)]/20 justify-between items-center">
        <Text size="xs" weight="semibold" className="text-text-muted">
          {visiblePosts.length} {t('active_discussions')}
        </Text>
        <div className="flex items-center gap-1 opacity-0 group-hover/widget:opacity-100 transition-all duration-300 translate-x-2 group-hover/widget:translate-x-0">
          <Button
            variant="ghost"
            size="xs"
            className="text-primary uppercase font-black tracking-tighter p-0 h-auto hover:bg-transparent"
            onClick={handleViewAll}
            iconRight={ChevronRight}
          >
            {t('view_all')}
          </Button>
        </div>
      </Card.Footer>
    </Card>
  )
})

ForumWidget.displayName = 'ForumWidget';

export const ForumActivityWidget = memo(function ForumActivityWidget({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const navigate = useNavigate()
  const t = useStore(state => state.t)
  const l = useL()
  const localize = useStore(state => state.localize)

  const handleViewAll = useCallback(() => {
    navigate(PATHS.COURSES)
  }, [navigate])

  const handleActivityClick = useCallback((id: number) => {
    navigate(PATHS.FORUM(id))
  }, [navigate])

  const limit = size === 'small' ? 1 : size === 'medium' ? 2 : 3

  return (
    <Card className="forum-activity-widget h-full w-full flex flex-col group/widget overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300 border-[var(--border-color)]/60">
      <Card.Header padding="compact" className="border-b border-[var(--border-color)]/40 bg-bg-highlight/50 backdrop-blur-sm">
        <Stack direction="row" align="center" gap="xs">
          <div className="p-[var(--space-2xs)] bg-primary text-white rounded-[var(--radius-md)] shadow-sm">
            <MessageCircle size={16} strokeWidth={2} />
          </div>
          <Heading level={2} as="h2" className="m-0 text-sm font-bold text-main">
            {t('course.forum_activity')}
          </Heading>
        </Stack>

        {size !== 'small' && (
          <Button
            variant="ghost"
            size="sm"
            className="font-black uppercase tracking-widest text-primary h-[44px] min-h-[44px] flex items-center"
            onClick={handleViewAll}
            iconRight={ChevronRight}
            aria-label={l('Se alle forumindlæg', 'See all forum posts')}
          >
            {l('Se alle forumindlæg', 'See all forum posts')}
          </Button>
        )}
      </Card.Header>

      <Card.Body padding="compact" className="p-[var(--space-xs)] flex-1 flex flex-col justify-center">
        <div className="w-full flex flex-col gap-[var(--space-4xs)]">
          {mockForumActivities.slice(0, limit).map((a) => (
            <div key={a.id} className="w-full">
              <MasterItem
                onClick={() => handleActivityClick(a.id)}
                className="w-full text-left p-[var(--space-2xs)] rounded-[var(--radius-md)] border-none"
                leading={a.icon}
                leadingClassName={cn(ACTIVITY_COLOR_MAP[a.color] ?? 'text-primary bg-primary/10')}
                title={localize(a, 'title')}
                subtitle={a.subtitle}
                meta={
                  size !== 'small' && (
                    <div className="relative mt-2xs">
                      <Text size="xs" muted className="forum-activity__snippet truncate block">
                        {localize(a, 'snippet')}
                      </Text>
                    </div>
                  )
                }
                trailing={
                  size === 'large' && (
                    <div className="mt-[var(--space-2xs)] flex items-center gap-[var(--space-2xs)] opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-[var(--space-xs)] group-hover:translate-x-0">
                      <div className="h-px w-3 bg-primary/30" />
                      <Text size="xs" weight="black" className="text-primary dark:text-white uppercase tracking-widest">{t('read_more')}</Text>
                      <ArrowRight size={10} strokeWidth={3} className="text-primary dark:text-white" />
                    </div>
                  )
                }
              />
            </div>
          ))}
        </div>
      </Card.Body>

      {size !== 'small' && (
        <Card.Footer padding="compact" className="bg-bg-highlight/30 border-t border-[var(--border-color)]/20 justify-between items-center cursor-pointer hover:bg-bg-hover transition-colors" onClick={handleViewAll} role="button" tabIndex={0}>
          <Text size="xs" weight="medium" className="text-muted italic">
            {t('communication')}
          </Text>
          <div className="flex items-center gap-1 opacity-0 group-hover/widget:opacity-100 transition-all duration-300 translate-x-2 group-hover/widget:translate-x-0">
            <Text size="xs" weight="bold" className="text-primary dark:text-white uppercase">{l('Se alle forumindlæg', 'See all forum posts')}</Text>
            <ChevronRight size={14} strokeWidth={2.5} className="text-primary dark:text-white" />
          </div>
        </Card.Footer>
      )}
    </Card>
  )
})

ForumActivityWidget.displayName = 'ForumActivityWidget';

// 12. WidgetGrid
interface WidgetGridProps {
  widgets: WidgetItem[];
  isEditing?: boolean;
  onLayoutChange?: (widgets: WidgetItem[]) => void;
  onToggleWidget?: (id: string, visible: boolean) => void;
  hideFirstDeadline?: boolean;
  isMessagesElevated?: boolean;
}

export const WidgetGrid = memo(function WidgetGrid({ widgets, isEditing = false, onLayoutChange, onToggleWidget, hideFirstDeadline = false, isMessagesElevated = false }: WidgetGridProps) {
  const l = useL();
  const { handleSizeChange, handleMoveUp, handleMoveDown } = useWidgetGrid(widgets, onLayoutChange);

  const renderWidgetContent = (id: string, size: 'small' | 'medium' | 'large' = 'medium') => {
    switch (id) {
      case 'deadlines':
        return <DeadlinesWidget size={size} hideFirst={hideFirstDeadline} />;
      case 'favorites':
        return <FavoritesWidget size={size} />;
      case 'quickOverview':
        return <QuickOverviewWidget size={size} />;
      case 'forumActivity':
        return <ForumActivityWidget size={size} />;
      case 'support':
        return <SupportWidget size={size} />;
      case 'messages':
        return <MessagesWidget size={size} isPriorityElevated={isMessagesElevated} />;
      case 'calendar':
        return <CalendarWidget size={size} />;
      case 'courseProgress':
        return <CourseProgressWidget size={size} />;
      case 'shortcuts':
        return <ShortcutsWidget size={size} />;
      default:
        return null;
    }
  };

  const leftWidgets = useMemo(() => widgets.filter((widget) => {
    const widgetSize = widget.size || 'medium';
    return widget.span === 8 || widget.span === 12 || widgetSize === 'medium' || widgetSize === 'large';
  }), [widgets]);
  const rightWidgets = useMemo(() => widgets.filter((widget) => {
    const widgetSize = widget.size || 'medium';
    return widget.span === 4 || widgetSize === 'small';
  }), [widgets]);

  const renderWidgetGridItem = (widget: WidgetItem, defaultSize: 'small' | 'medium') => {
    const widgetSize = widget.size || defaultSize;
    const globalIndex = widgets.findIndex(w => w.id === widget.id);

    return (
      <div
        key={widget.id}
        className={`widget-${widget.id} widget-size-${widgetSize} relative ${isEditing ? 'ring-1 ring-[var(--border-color)] ring-offset-1 rounded-[var(--radius-lg)]' : ''}`}
      >
        {isEditing && (
          <>
            <div className="absolute top-2 left-2 z-50 flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-color)] bg-bg-card/95 text-muted/40 hover:text-muted cursor-grab shadow-sm opacity-50 hover:opacity-100 focus-within:opacity-100 transition-all duration-200" title={l('Træk for at flytte', 'Drag to move')}>
              <GripVertical size={16} />
            </div>
            <div className="absolute top-2 right-2 z-50" onClick={e => e.stopPropagation()}>
              <Dropdown>
                <Dropdown.Trigger>
                  {({ ref, onClick, onKeyDown }: any, { isOpen }: any) => (
                    <button
                      ref={ref}
                      onClick={onClick}
                      onKeyDown={onKeyDown}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-color)] bg-bg-card/95 text-main hover:text-primary shadow-[var(--shadow-sm)] transition-all cursor-pointer focus-visible:outline-none focus-visible:shadow-focus"
                      aria-label={l('Widget indstillinger', 'Widget settings')}
                      aria-expanded={isOpen}
                      type="button"
                    >
                      <MoreVertical size={16} />
                    </button>
                  )}
                </Dropdown.Trigger>
                <Dropdown.Menu className="w-48">
                  <div className="p-xs text-[10px] font-extrabold text-muted uppercase tracking-wider select-none border-b border-border/40">
                    {l('Størrelse', 'Size')}
                  </div>
                  <Dropdown.Item onClick={() => handleSizeChange(widget.id, 'small')} className={widgetSize === 'small' ? 'text-primary bg-bg-highlight' : ''}>
                    {widgetSize === 'small' ? '✓ ' : ''}{l('Lille', 'Small')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSizeChange(widget.id, 'medium')} className={widgetSize === 'medium' ? 'text-primary bg-bg-highlight' : ''}>
                    {widgetSize === 'medium' ? '✓ ' : ''}{l('Medium', 'Medium')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSizeChange(widget.id, 'large')} className={widgetSize === 'large' ? 'text-primary bg-bg-highlight' : ''}>
                    {widgetSize === 'large' ? '✓ ' : ''}{l('Stor', 'Large')}
                  </Dropdown.Item>
                  
                  <div className="p-xs text-[10px] font-extrabold text-muted uppercase tracking-wider select-none border-t border-b border-border/40 mt-xs">
                    {l('Rækkefølge', 'Order')}
                  </div>
                  <Dropdown.Item onClick={() => handleMoveUp(globalIndex)} disabled={globalIndex === 0} className="flex items-center gap-xs">
                    <ArrowUp size={14} />
                    {l('Flyt op', 'Move up')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleMoveDown(globalIndex)} disabled={globalIndex === widgets.length - 1} className="flex items-center gap-xs">
                    <ArrowDown size={14} />
                    {l('Flyt ned', 'Move down')}
                  </Dropdown.Item>
 
                  <div className="border-t border-border/40 mt-xs" />
                  <Dropdown.Item onClick={() => onToggleWidget && onToggleWidget(widget.id, false)} className="flex items-center gap-xs text-danger hover:bg-danger/10 hover:text-danger">
                    <Trash2 size={14} />
                    {l('Skjul', 'Hide')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </>
        )}
        <WidgetStateWrapper id={widget.id} size={widgetSize}>
          {renderWidgetContent(widget.id, widgetSize)}
        </WidgetStateWrapper>
      </div>
    );
  };

  return (
    <div
      className={`dashboard-columns flex flex-col lg:flex-row gap-md w-full animate-fade-in items-start ${isEditing ? 'is-editing' : ''}`}
      data-testid="dashboard-columns"
    >
      {/* Left column */}
      <div className="flex flex-col gap-md flex-1 w-full">
        {leftWidgets.map((widget) => renderWidgetGridItem(widget, 'medium'))}
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-md w-full lg:w-[340px] xl:w-[380px] shrink-0">
        {rightWidgets.map((widget) => renderWidgetGridItem(widget, 'small'))}
      </div>
    </div>
  );
})
