import useStore from '@/store'
import { useNotificationsState } from '@/pages/Notifications'
import type { NotificationItem } from '@/lib/types'

const mockInitialNotifications = (): NotificationItem[] => [
  {
    id: 1,
    type: 'AFLEVERING',
    text: 'Notification 1',
    date: new Date('2026-05-24T08:00:00Z'),
    isRead: false,
    archived: false,
    course: 'Interaktionsdesign',
    content: 'Content 1',
    link: '/course/1',
  },
  {
    id: 2,
    type: 'FORUM',
    text: 'Notification 2',
    date: new Date('2026-05-24T06:00:00Z'),
    isRead: true,
    archived: false,
    course: 'Interaktionsdesign',
    content: 'Content 2',
    link: '/course/1',
  },
  {
    id: 3,
    type: 'SYSTEM',
    text: 'Notification 3',
    date: new Date('2026-05-23T08:00:00Z'),
    isRead: true,
    archived: true,
    course: 'System',
    content: 'Content 3',
    link: '/',
  },
]

describe('useNotificationsState', () => {
  const decrementNotificationCount = vi.fn()
  const setNotificationCount = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useStore.setState({
      lang: 'da',
      decrementNotificationCount,
      setNotificationCount,
    })
  })

  it('calculates unreadCount, filtered, and selectedNotification correctly', () => {
    const { result } = renderHook(() =>
      useNotificationsState({ initialNotifications: mockInitialNotifications() })
    )

    expect(result.current.unreadCount).toBe(1)
    expect(result.current.filtered.length).toBe(2)
    expect(result.current.selectedNotification?.id).toBe(1)
  })

  it('marks a notification as read and calls decrementNotificationCount', () => {
    const { result } = renderHook(() =>
      useNotificationsState({ initialNotifications: mockInitialNotifications() })
    )

    const dummyEvent = { stopPropagation: vi.fn() } as any

    act(() => {
      result.current.markAsRead(1, dummyEvent)
    })

    expect(dummyEvent.stopPropagation).toHaveBeenCalled()
    expect(decrementNotificationCount).toHaveBeenCalledTimes(1)
    expect(result.current.notifications.find(n => n.id === 1)?.isRead).toBe(true)
    expect(result.current.unreadCount).toBe(0)
  })

  it('archives a notification and filters it out of active list', () => {
    const { result } = renderHook(() =>
      useNotificationsState({ initialNotifications: mockInitialNotifications() })
    )

    const dummyEvent = { stopPropagation: vi.fn() } as any

    act(() => {
      result.current.archiveNotification(1, dummyEvent)
    })

    expect(dummyEvent.stopPropagation).toHaveBeenCalled()
    expect(result.current.notifications.find(n => n.id === 1)?.archived).toBe(true)
    expect(result.current.filtered.length).toBe(1)
    expect(result.current.selectedNotification?.id).toBe(2)
  })

  it('view=archive filters archived notifications', () => {
    const { result } = renderHook(() =>
      useNotificationsState({ initialNotifications: mockInitialNotifications() })
    )

    act(() => {
      result.current.setView('archive')
    })

    expect(result.current.view).toBe('archive')
    expect(result.current.filtered.length).toBe(1)
    expect(result.current.filtered[0].id).toBe(3)
  })

  it('groups active notifications by date', () => {
    const { result } = renderHook(() =>
      useNotificationsState({ initialNotifications: mockInitialNotifications() })
    )

    const groups = result.current.grouped
    expect(Object.keys(groups).length).toBeGreaterThan(0)
    Object.values(groups).forEach(items => {
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBeGreaterThan(0)
    })
  })

  it('markAsRead on already-read notification does nothing', () => {
    const { result } = renderHook(() =>
      useNotificationsState({ initialNotifications: mockInitialNotifications() })
    )

    const dummyEvent = { stopPropagation: vi.fn() } as any
    const initialUnread = result.current.unreadCount

    act(() => {
      result.current.markAsRead(2, dummyEvent)
    })

    expect(dummyEvent.stopPropagation).toHaveBeenCalled()
    expect(decrementNotificationCount).not.toHaveBeenCalled()
    expect(result.current.unreadCount).toBe(initialUnread)
  })

  it('selectedNotification is null when filtered is empty', () => {
    const { result } = renderHook(() =>
      useNotificationsState({ initialNotifications: mockInitialNotifications() })
    )

    const dummyEvent = { stopPropagation: vi.fn() } as any

    act(() => {
      result.current.archiveNotification(1, dummyEvent)
      result.current.archiveNotification(2, dummyEvent)
    })

    expect(result.current.filtered.length).toBe(0)
    expect(result.current.selectedNotification).toBeNull()
  })

  it('archiveNotification marks item as archived and excludes from active view', () => {
    const { result } = renderHook(() =>
      useNotificationsState({ initialNotifications: mockInitialNotifications() })
    )

    const dummyEvent = { stopPropagation: vi.fn() } as any

    expect(result.current.filtered.length).toBe(2)

    act(() => {
      result.current.archiveNotification(1, dummyEvent)
    })

    expect(result.current.notifications.find(n => n.id === 1)?.archived).toBe(true)
    expect(result.current.filtered.length).toBe(1)
    expect(result.current.filtered[0].id).toBe(2)

    act(() => {
      result.current.setView('archive')
    })

    expect(result.current.filtered.length).toBe(2)
    expect(result.current.filtered.some(n => n.id === 1)).toBe(true)
    expect(result.current.filtered.some(n => n.id === 3)).toBe(true)
  })

  it('restores a notification back from archives', () => {
    const { result } = renderHook(() =>
      useNotificationsState({ initialNotifications: mockInitialNotifications() })
    )

    const dummyEvent = { stopPropagation: vi.fn() } as any

    act(() => {
      result.current.restoreNotification(3, dummyEvent)
    })

    expect(dummyEvent.stopPropagation).toHaveBeenCalled()
    expect(result.current.notifications.find(n => n.id === 3)?.archived).toBe(false)
    expect(result.current.filtered.length).toBe(3)
  })

  it('marks all as read and updates store notification count to 0', () => {
    const { result } = renderHook(() =>
      useNotificationsState({ initialNotifications: mockInitialNotifications() })
    )

    act(() => {
      result.current.markAllRead()
    })

    expect(setNotificationCount).toHaveBeenCalledWith(0)
    expect(result.current.notifications.every(n => n.isRead)).toBe(true)
    expect(result.current.unreadCount).toBe(0)
  })
})
