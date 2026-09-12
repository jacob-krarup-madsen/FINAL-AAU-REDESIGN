import { useState, useMemo, type MouseEvent } from 'react';
import { BellOff, Inbox, ArrowLeft, Check, Archive, Undo2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationDetailView, NotificationFilters, createMockNotifications, getNotificationIcon } from '@/components/Notifications';
import { Badge, MasterItem, SearchInput, EmptyState, Text, Button } from '@/components/ui';
import { Stack, SplitLayout, PageLayout } from '@/components/Layout';
import useStore from '@/store';
import { cn, formatRelativeDateGroup, formatTime } from '@/lib/utils';
import { useManagedCollection } from '@/hooks';
import type { NotificationItem } from '@/lib/types';
interface UseNotificationsStateOptions {
  initialNotifications: NotificationItem[]
}

export function useNotificationsState({ initialNotifications }: UseNotificationsStateOptions) {
  const lang = useStore(state => state.lang)
  const t = useStore(state => state.t)
  const decrementNotificationCount = useStore(state => state.decrementNotificationCount)
  const setNotificationCount = useStore(state => state.setNotificationCount)


  const [selectedId, setSelectedId] = useState<number | null>(null)
  const {
    items: notifications,
    setItems: setNotifications,
    archiveItem: archiveNotification,
    restoreItem: restoreNotification,
    view,
    setView,
    filteredItems,
    searchQuery,
    setSearchQuery,
  } = useManagedCollection(initialNotifications, {
    searchKeys: (n: NotificationItem) => [n.text, n.course, n.content],
  })

  const markAsRead = (id: number, e: MouseEvent): void => {
    e.stopPropagation()
    setNotifications(prev => prev.map((n) => {
      if (n.id === id && !n.isRead) {
        decrementNotificationCount()
        return { ...n, isRead: true }
      }
      return n
    }))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map((n) => ({ ...n, isRead: true })))
    setNotificationCount(0)
  }

  const grouped = useMemo(() => {
    const groups: Record<string, NotificationItem[]> = {}
    filteredItems.forEach(n => {
      const dateKey = formatRelativeDateGroup(n.date, lang)
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(n)
    })
    return groups
  }, [filteredItems, formatRelativeDateGroup])

  const selectedNotification = useMemo(() => {
    return notifications.find(n => n.id === selectedId) || (filteredItems.length > 0 ? filteredItems[0] : null)
  }, [notifications, selectedId, filteredItems])

  const currentSelectedId = selectedNotification?.id || null

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead && !n.archived).length
  }, [notifications])

  return {
    notifications,
    setNotifications,
    selectedId,
    setSelectedId,
    view: view as 'active' | 'archive',
    setView: (v: 'active' | 'archive') => setView(v),
    archiveNotification,
    restoreNotification,
    markAsRead,
    markAllRead,
    filtered: filteredItems,
    grouped,
    selectedNotification,
    currentSelectedId,
    unreadCount,
    searchQuery,
    setSearchQuery,
    lang,
    t
  }
}


function Notifications() {
  const t = useStore(state => state.t)
  const lang = useStore(state => state.lang)
  const navigate = useNavigate()


  const NOTIF_BG_MAP: Record<string, string> = {
    AFLEVERING: 'bg-primary/10 text-primary',
    FORUM: 'bg-accent/10 text-accent',
    DEADLINE: 'bg-danger/10 text-danger',
    FEEDBACK: 'bg-success/10 text-success',
    SYSTEM: 'bg-bg-highlight/50 text-muted',
  }

  const initialNotifications = useMemo(() => createMockNotifications(t), [t])

  const {
    view,
    setView,
    archiveNotification,
    restoreNotification,
    markAsRead,
    markAllRead,
    filtered,
    grouped,
    selectedNotification,
    currentSelectedId,
    unreadCount,
    setSelectedId,
    searchQuery,
    setSearchQuery
  } = useNotificationsState({ initialNotifications })

  return (
    <PageLayout
      className="container notifications-page flex flex-col pb-[var(--space-2xl)]"
      pageKey="notifications"
      title={t('notifications')}
      subtitle={t('notifications_page_subtitle')}
      breadcrumbs={[{ label: t('dashboard'), href: '/' }, { label: t('notifications') }]}
      headerClassName="!mb-[var(--space-lg)]"
      headerChildren={
        <Badge variant={unreadCount > 0 ? 'danger' : 'default'} className={unreadCount > 0 ? 'bg-primary text-white shadow-[var(--shadow-md)] font-black px-xs' : ''}>
          {unreadCount} {unreadCount === 1 ? t('new_singular') : t('new_plural')}
        </Badge>
      }
    >

      <SplitLayout
        sidebarPosition="left"
        showDetailOnMobile={!!currentSelectedId}
        sidebarSpan={5}
        mainSpan={7}
        listHeader={
          <div className="notifications-tabs-container px-md pt-md">
            <NotificationFilters
              view={view}
              onChangeView={setView}
              unreadCount={unreadCount}
              onMarkAllRead={markAllRead}
              t={t}
            />
            <div className="pb-md mt-sm">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
                placeholder={t('search_placeholder')}
              />
            </div>
          </div>
        }
        sidebar={
          <div className="h-full w-full">
            {filtered.length > 0 ? (
              <div key="notifications-list" className="transition-all duration-150">
                {Object.entries(grouped).map(([date, items]) => (
                  <Stack key={date} gap="none">
                    <div className="notification-group-title p-[var(--space-sm)_var(--space-md)] bg-bg-placeholder/50 dark:bg-white/5 border-y border-border/50 first:border-t-0">
                      <h3 className="text-[10px] font-black text-text-muted tracking-widest uppercase m-0">{date}</h3>
                    </div>
                    {items.map((notif) => {
                      const Icon = getNotificationIcon(notif.type)
                      return (
                        <MasterItem
                          key={notif.id}
                          selected={currentSelectedId === notif.id}
                          unread={!notif.isRead}
                          onClick={() => setSelectedId(notif.id)}
                          className="notification-item"
                          leading={Icon}
                          leadingClassName={cn(
                            NOTIF_BG_MAP[notif.type] ?? 'bg-bg-highlight/50 text-muted',
                            notif.isRead && 'opacity-60 grayscale',
                          )}
                          title={
                            <Stack direction="row" align="center" gap="xs" className="mb-0.5">
                              <Text size="2xs" weight="black" className="text-primary uppercase tracking-tighter opacity-80">{notif.type}</Text>
                              <Text size="2xs" muted className="opacity-40">&bull;</Text>
                              <Text size="2xs" weight="bold" muted className="truncate">{notif.course}</Text>
                            </Stack>
                          }
                          subtitle={
                            <Text weight={notif.isRead ? 'medium' : 'black'} size="xs" className={`truncate ${notif.isRead ? 'text-muted' : 'text-main'}`}>{notif.text}</Text>
                          }
                          meta={
                            <Text size="2xs" muted className="mt-[var(--space-2xs)] opacity-60">
                              {formatTime(notif.date, lang)}
                            </Text>
                          }
                          trailing={
                            <div className="notification-meta flex items-center gap-sm shrink-0">
                              {!notif.isRead && (
                                <div
                                  role="status"
                                  aria-label={lang === 'da' ? 'Ulæst' : 'Unread'}
                                  className="w-2.5 h-2.5 rounded-[var(--radius-pill)] bg-primary shadow-[0_0_6px_rgba(var(--color-primary-rgb),0.5)] animate-pulse"
                                />
                              )}
                              <div className="notification-actions flex gap-3xs opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                {!notif.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    pill
                                    icon={Check}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      markAsRead(notif.id, e)
                                    }}
                                    title={t('mark_as_read')}
                                    aria-label={t('mark_as_read')}
                                    className="bg-bg-card border border-border shadow-[var(--shadow-sm)] hover:border-primary"
                                  />
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  pill
                                  icon={view === 'active' ? Archive : Undo2}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (view === 'active') archiveNotification(notif.id, e)
                                    else restoreNotification(notif.id, e)
                                  }}
                                  title={view === 'active' ? t('archive') : t('restore')}
                                  aria-label={view === 'active' ? t('archive') : t('restore')}
                                  className="bg-bg-card border border-border shadow-[var(--shadow-sm)] hover:border-primary"
                                />
                              </div>
                            </div>
                          }
                        />
                      )
                    })}
                  </Stack>
                ))}
              </div>
            ) : (
              <div key="notifications-empty">
                <EmptyState
                  icon={view === 'active' ? BellOff : Inbox}
                  title={view === 'active' ? t('no_notifications') : t('archive_empty')}
                  message={view === 'active' ? t('notif_all_caught_up') : ''}
                />
              </div>
            )}
          </div>
        }
        detailHeader={
          <div className="md:hidden flex items-center h-14 px-md border-b border-border bg-bg-card">
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setSelectedId(null)}
              className="font-bold"
            >
              {t('common.back')}
            </Button>
          </div>
        }
        main={
          <div className="h-full w-full">
            <NotificationDetailView
              selectedNotification={selectedNotification}
              t={t}
              onNavigate={navigate}
            />
          </div>
        }
      />
    </PageLayout>
  )
}

export default Notifications
