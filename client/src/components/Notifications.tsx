import { Bell, ArrowRight, Archive, CheckCheck, FileUp, MessageSquare, Clock, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, TabBar, Button, Heading, Text, EmptyState } from '@/components/ui'
import { Stack } from '@/components/Layout'
import useStore from '@/store'
import { formatLongDateTime } from '@/lib/utils'
import { NotificationItem } from '@/lib/types'

// ==========================================
// Notifications Helpers & Data
// ==========================================

const NOTIFICATION_ICON_MAP: Record<string, LucideIcon> = {
  AFLEVERING: FileUp,
  FORUM: MessageSquare,
  DEADLINE: Clock,
  FEEDBACK: Star,
}

export function getNotificationIcon(type: string): LucideIcon {
  return NOTIFICATION_ICON_MAP[type] ?? Bell
}

export function createMockNotifications(t: (key: string) => string): NotificationItem[] {
  return [
    {
      id: 1,
      type: 'AFLEVERING',
      text: t('notif_1_text'),
      date: new Date(),
      isRead: false,
      archived: false,
      course: 'Interaktionsdesign',
      content: t('notif_1_content'),
      link: '/course/1',
    },
    {
      id: 2,
      type: 'FORUM',
      text: t('notif_2_text'),
      date: new Date(Date.now() - 3600000 * 2),
      isRead: false,
      archived: false,
      course: 'Interaktionsdesign',
      content: t('notif_2_content'),
      link: '/course/1',
    },
    {
      id: 3,
      type: 'SYSTEM',
      text: t('notif_3_text'),
      date: new Date(Date.now() - 86400000),
      isRead: true,
      archived: false,
      course: 'System',
      content: t('notif_3_content'),
      link: '/',
    },
    {
      id: 4,
      type: 'DEADLINE',
      text: t('notif_4_text'),
      date: new Date(Date.now() - 86400000 * 2),
      isRead: true,
      archived: false,
      course: 'Administration',
      content: t('notif_4_content'),
      link: '/',
    },
    {
      id: 5,
      type: 'FEEDBACK',
      text: t('notif_5_text'),
      date: new Date(Date.now() - 86400000 * 5),
      isRead: true,
      archived: false,
      course: 'Webudvikling',
      content: t('notif_5_content'),
      link: '/course/2',
    },
  ]
}

// ==========================================
// NotificationDetailView
// ==========================================

interface NotificationDetailViewProps {
  selectedNotification: NotificationItem | null
  t: (key: string) => string
  onNavigate: (link: string) => void
}

export function NotificationDetailView({
  selectedNotification,
  t,
  onNavigate,
}: NotificationDetailViewProps) {
  const lang = useStore(state => state.lang)
  if (!selectedNotification) {
    return (
      <div className="notification-detail-empty flex items-center justify-center h-full p-[var(--space-2xl)] text-center">
        <EmptyState
          icon={Bell}
          title={t('notif_select_notification')}
          message={t('notif_detail_hint')}
        />
      </div>
    )
  }

  const Icon = getNotificationIcon(selectedNotification.type)

  return (
    <>
      <Card.Header className="bg-bg-card border-b border-border p-lg">
        <Stack direction="row" gap="md" align="center">
          <div className={`notification-icon-wrapper notif-type--${selectedNotification.type.toLowerCase()} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-border/60 bg-bg-placeholder/50 dark:bg-white/5 shadow-inner`}>
            <Icon size={24} strokeWidth={2} className="text-primary" />
          </div>
          <Stack gap="xs">
            <Stack direction="row" align="center" gap="xs">
              <Text size="xs" weight="black" className="text-primary uppercase tracking-widest opacity-80">{selectedNotification.type}</Text>
              <Text size="xs" muted className="opacity-40">&bull;</Text>
              <Text size="xs" weight="bold" muted>{selectedNotification.course}</Text>
            </Stack>
            <Heading level={2} className="m-0 text-2xl font-black tracking-tight">{selectedNotification.text}</Heading>
            <Text size="xs" muted>{formatLongDateTime(selectedNotification.date, lang)}</Text>
          </Stack>
        </Stack>
      </Card.Header>
      <Card.Body className="bg-bg-placeholder/30 dark:bg-bg-card p-[var(--space-lg)]">
        <div className="notification-detail-card bg-bg-card p-xl rounded-2xl shadow-[var(--shadow-xl)] border border-border flex flex-col min-h-[50vh]">
          <Text size="md" className="leading-relaxed text-main/90 mb-xl flex-1 whitespace-pre-wrap">{selectedNotification.content}</Text>
          <Button
            variant="primary"
            full
            size="md"
            iconRight={ArrowRight}
            onClick={() => onNavigate(selectedNotification.link)}
            className="mt-auto shadow-[var(--shadow-lg)] hover:shadow-primary/20"
          >
            {t('go_to_content')}
          </Button>
        </div>
      </Card.Body>
    </>
  )
}

// ==========================================
// NotificationFilters
// ==========================================

interface NotificationFiltersProps {
  view: 'active' | 'archive'
  onChangeView: (view: 'active' | 'archive') => void
  unreadCount: number
  onMarkAllRead: () => void
  t: (key: string) => string
}

export function NotificationFilters({
  view,
  onChangeView,
  unreadCount,
  onMarkAllRead,
  t,
}: NotificationFiltersProps) {
  return (
    <TabBar
      tabs={[
        { id: 'active', label: t('active') },
        { id: 'archive', label: t('archive'), icon: Archive }
      ]}
      activeTab={view}
      onChange={(id) => onChangeView(id as 'active' | 'archive')}
      secondaryAction={view === 'active' && unreadCount > 0 ? (
        <Button
          variant="outline"
          size="sm"
          icon={CheckCheck}
          onClick={onMarkAllRead}
          className="text-text-secondary hover:text-primary border border-border/80 hover:border-primary shadow-sm font-bold"
        >
          {t('mark_all_read')}
        </Button>
      ) : undefined}
    />
  )
}
