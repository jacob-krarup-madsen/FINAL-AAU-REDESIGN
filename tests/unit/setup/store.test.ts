import useStore from '@/store';
import { PersistedStateSchema } from '@/lib/types';
import { api } from '@/lib/api';

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({
      theme: 'system',
      isDarkMode: false,
      lang: 'da',
      isCollapsed: false,
      courseProgress: {},
      calendarEvents: {},
      favorites: [],
    })
  })

  it('updates theme correctly', () => {
    useStore.getState().setTheme('dark')
    expect(useStore.getState().theme).toBe('dark')
  })

  it('updates language correctly', () => {
    useStore.getState().setLang('en')
    expect(useStore.getState().lang).toBe('en')
  })

  it('toggles sidebar state', () => {
    const store = useStore.getState()
    store.toggleSidebar()
    expect(useStore.getState().isCollapsed).toBe(true)
    store.toggleSidebar()
    expect(useStore.getState().isCollapsed).toBe(false)
  })

  it('updates course progress', () => {
    useStore.getState().toggleCourseItem('c1', 1)
    expect(useStore.getState().courseProgress['c1']).toContain(1)
    useStore.getState().toggleCourseItem('c1', 1)
    expect(useStore.getState().courseProgress['c1']).not.toContain(1)
  })

  it('calculates course progress percentage', () => {
    useStore.getState().toggleCourseItem('c1', 1)
    const progress = useStore.getState().getCourseProgress('c1', 2)
    expect(progress).toBe(50)
    expect(useStore.getState().getCourseProgress('c1', 0)).toBe(0)
  })

  it('translates keys using t function', () => {
    const store = useStore.getState()
    expect(store.t('welcome')).toBe('Velkommen tilbage, TestUser')
    store.setLang('en')
    expect(useStore.getState().t('welcome')).toBe('Welcome back, TestUser')
    expect(useStore.getState().t('non_existent')).toBe('non_existent')
  })

  it('sets sidebar collapsed state directly', () => {
    useStore.getState().setCollapsed(true)
    expect(useStore.getState().isCollapsed).toBe(true)
  })

  it('updates calendar events', () => {
    const events = { '2026-05-14': { id: 1, title: 'Event', color: '', location: '', time: '', host: '' } }
    useStore.getState().updateCalendarEvents(events)
    expect(useStore.getState().calendarEvents).toEqual(events)
  })

  it('sets theme with system preference', async () => {
    const { env } = await import('@/lib/utils')
    const spy = vi.spyOn(env, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as any)

    const store = useStore.getState()
    store.setTheme('system')
    expect(useStore.getState().isDarkMode).toBe(true)
    spy.mockRestore()
  })

  it('migrates version 0 to 1', () => {
    const options = useStore.persist.getOptions()
    if (!options.migrate) throw new Error('No migrate function')
    const legacyState = { courseProgress: null, calendarEvents: null, favorites: [] }
    const migrated = options.migrate(legacyState, 0) as any
    expect(migrated.courseProgress).toEqual({})
    expect(migrated.calendarEvents).toEqual({})
  })

  it('migrates version 1 to 2 (favorites)', () => {
    const options = useStore.persist.getOptions()
    if (!options.migrate) throw new Error('No migrate function')
    const oldState = {
      toolFavorites: [1, '5', 6],
      courses: [
        { id: '1', isStarred: true },
        { id: 2, isStarred: false },
        { id: 3, isStarred: true },
      ],
    }
    const migrated = options.migrate(oldState, 1) as any
    expect(migrated.favorites.length).toBe(5)
    const types = migrated.favorites.map((f: any) => f.type)
    const ids = migrated.favorites.map((f: any) => f.entityId)
    expect(types.filter((t: string) => t === 'tool')).toHaveLength(3)
    expect(types.filter((t: string) => t === 'course')).toHaveLength(2)
    expect(ids).toContain(1)
    expect(ids).toContain(5)
    expect(ids).toContain(6)
  })

  it('returns 0 for getCourseProgress with non-existent course', () => {
    expect(useStore.getState().getCourseProgress('nonexistent', 10)).toBe(0)
  })

  it('sets document language attribute when language changes', () => {
    useStore.getState().setLang('en')
    expect(document.documentElement.lang).toBe('en')
  })

  it('handles SSR: initial theme and lang fallback to defaults when window is undefined', async () => {
    vi.stubGlobal('window', undefined)
    vi.resetModules()
    const mod = await import('@/store')
    expect(mod.default.getState().theme).toBe('system')
    expect(mod.default.getState().lang).toBe('da')
    vi.unstubAllGlobals()
  })

  it('handles SSR: sidebar actions skip DOM when window is undefined', async () => {
    vi.stubGlobal('window', undefined)
    vi.resetModules()
    const mod = await import('@/store')
    mod.default.getState().toggleSidebar()
    expect(mod.default.getState().isCollapsed).toBe(false)
    vi.unstubAllGlobals()
  })

  it('handles SSR: setTheme and setLang skip DOM manipulation when window is undefined', async () => {
    vi.stubGlobal('window', undefined)
    vi.resetModules()
    const mod = await import('@/store')
    mod.default.getState().setTheme('dark')
    expect(mod.default.getState().theme).toBe('dark')
    mod.default.getState().setLang('en')
    expect(mod.default.getState().lang).toBe('en')
    vi.unstubAllGlobals()
  })

  it('sets isDarkMode based on theme', () => {
    useStore.getState().setTheme('dark')
    expect(useStore.getState().isDarkMode).toBe(true)
    useStore.getState().setTheme('light')
    expect(useStore.getState().isDarkMode).toBe(false)
  })

  it('toggles a course favorite', () => {
    const courseId = useStore.getState().courses[0].id
    const wasFav = useStore.getState().isFavorite('course', courseId)
    useStore.getState().toggleFavorite('course', courseId)
    expect(useStore.getState().isFavorite('course', courseId)).toBe(!wasFav)
    useStore.getState().toggleFavorite('course', courseId)
    expect(useStore.getState().isFavorite('course', courseId)).toBe(wasFav)
  })

  it('enforces favorites limit', () => {
    const { toggleFavorite } = useStore.getState()
    for (let i = 0; i < 12; i++) toggleFavorite('tool', 100 + i)
    expect(useStore.getState().favorites.length).toBe(12)
    toggleFavorite('tool', 200)
    expect(useStore.getState().favorites.length).toBe(12)
  })

  it('reorders favorites', () => {
    useStore.setState({ favorites: [] })
    const { toggleFavorite, reorderFavorites } = useStore.getState()
    toggleFavorite('course', 1)
    toggleFavorite('course', 2)
    toggleFavorite('course', 3)
    expect(useStore.getState().favorites.map(f => f.entityId)).toEqual([1, 2, 3])
    reorderFavorites(2, 0)
    expect(useStore.getState().favorites.map(f => f.entityId)).toEqual([3, 1, 2])
  })

  it('manages counts correctly', () => {
    const store = useStore.getState()
    store.setNotificationCount(10)
    expect(useStore.getState().notificationCount).toBe(10)
    store.decrementNotificationCount()
    expect(useStore.getState().notificationCount).toBe(9)
    
    store.setNotificationCount(0)
    store.decrementNotificationCount()
    expect(useStore.getState().notificationCount).toBe(0)

    store.setMessageCount(5)
    expect(useStore.getState().messageCount).toBe(5)
    store.decrementMessageCount()
    expect(useStore.getState().messageCount).toBe(4)
    
    store.setMessageCount(0)
    store.decrementMessageCount()
    expect(useStore.getState().messageCount).toBe(0)
  })

  it('manages breadcrumbs', () => {
    const crumbs = [{ label: 'Home', href: '/' }]
    useStore.getState().setBreadcrumbs(crumbs)
    expect(useStore.getState().breadcrumbs).toEqual(crumbs)
    
    useStore.getState().setBreadcrumbs(undefined)
    expect(useStore.getState().breadcrumbs).toEqual([])
  })

  it('toggles star via toggleStar', () => {
    const courseId = useStore.getState().courses[0].id
    useStore.getState().toggleStar(courseId)
    expect(useStore.getState().isFavorite('course', courseId)).toBe(true)
  })

  it('handles migrate with existing data in v0', () => {
    const options = useStore.persist.getOptions()
    const legacyState = { courseProgress: { '1': [1] }, calendarEvents: { 'd': {} } }
    const migrated = options.migrate!(legacyState, 0) as any
    expect(migrated.courseProgress).toEqual({ '1': [1] })
    expect(migrated.calendarEvents).toEqual({ 'd': {} })
  })

  it('skips migration for same version', () => {
    const options = useStore.persist.getOptions()
    const state = { theme: 'dark' }
    expect(options.migrate!(state, 3)).toBe(state)
  })

  it('migrates version 2 to 3 (dashboard layout matches exactly)', () => {
    const options = useStore.persist.getOptions()
    const legacyState = {
      dashboardLayout: [
        { id: 'deadlines', visible: true },
        { id: 'quickOverview', visible: true },
        { id: 'favorites', visible: true },
        { id: 'support', visible: true },
        { id: 'forumActivity', visible: true },
        { id: 'messages', visible: false },
        { id: 'calendar', visible: false },
        { id: 'courseProgress', visible: false },
      ]
    }
    const migrated = options.migrate!(legacyState, 2) as any
    expect(migrated.dashboardLayout).toHaveLength(8)
    expect(migrated.dashboardLayout[1].id).toBe('messages')
    expect(migrated.dashboardLayout[1].visible).toBe(true)
  })

  it('migrates version 2 to 3 (dashboard layout is customized)', () => {
    const options = useStore.persist.getOptions()
    const legacyState = {
      dashboardLayout: [
        { id: 'deadlines', visible: false, title: 'My Deadlines' },
      ]
    }
    const migrated = options.migrate!(legacyState, 2) as any
    expect(migrated.dashboardLayout).toHaveLength(8)
    expect(migrated.dashboardLayout[0].id).toBe('deadlines')
    expect(migrated.dashboardLayout[0].visible).toBe(false)
    expect(migrated.dashboardLayout[0].title).toBe('My Deadlines')
    expect(migrated.dashboardLayout[1].id).toBe('messages')
    expect(migrated.dashboardLayout[1].visible).toBe(false)
  })

  it('migrates version 1 to 2 with missing old data', () => {
    const options = useStore.persist.getOptions()
    const oldState = {}
    const migrated = options.migrate!(oldState, 1) as any
    expect(migrated.favorites).toEqual([])
  })

  it('migrates version 1 to 2 and avoids duplicate course favorites', () => {
    const options = useStore.persist.getOptions()
    const oldStateWithDupes = {
      toolFavorites: [],
      courses: [
        { id: 101, isStarred: true },
        { id: 101, isStarred: true }
      ]
    }
    const migrated = options.migrate!(oldStateWithDupes, 1) as any
    expect(migrated.favorites).toHaveLength(1)
  })

  it('handles validation failure during rehydration', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const options = useStore.persist.getOptions()
    const rehydrateCallback = options.onRehydrateStorage?.(useStore.getState())
    if (rehydrateCallback) {
      rehydrateCallback(123 as any)
      expect(consoleWarnSpy).toHaveBeenCalled()
    }
    consoleWarnSpy.mockRestore()
  })

  it('handles validation failure during migration', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const options = useStore.persist.getOptions()
    const invalidMigrated = options.migrate!(123, -1) as any
    expect(consoleWarnSpy).toHaveBeenCalled()
    expect(invalidMigrated).toEqual({
      theme: 'system',
      lang: 'da',
      isCollapsed: true,
      courseProgress: {},
      calendarEvents: {},
      favorites: [],
    })
    consoleWarnSpy.mockRestore()
  })

  it('handles persist parse error and rehydration', () => {
    const originalParse = PersistedStateSchema.parse
    PersistedStateSchema.parse = () => { throw new Error('parse error') }

    const options = useStore.persist.getOptions()
    const migrated = options.migrate?.({ invalidField: true }, 0)
    expect(migrated).toBeDefined()

    const rehydrateCallback = (options.onRehydrateStorage as any)?.()
    if (rehydrateCallback) {
      rehydrateCallback({ lang: 'invalid-lang-type' })
    }

    PersistedStateSchema.parse = originalParse
  })

  it('handles clearFavorites', () => {
    useStore.getState().clearFavorites()
    expect(useStore.getState().favorites).toEqual([])
  })

  it('handles t key fallback', () => {
    expect(useStore.getState().t('non.existent.key')).toBe('non.existent.key')
    expect(useStore.getState().localize(null as any)).toBe('')
    expect(useStore.getState().localize({ someField: 'val' })).toBe('')
  })

  it('updates user state correctly via setters', () => {
    const store = useStore.getState()
    store.setFirstName('TestUser')
    expect(useStore.getState().firstName).toBe('TestUser')
    
    store.setLastName('Madsen')
    expect(useStore.getState().lastName).toBe('Madsen')

    store.setNotifPrefs({ email: false, push: false, sms: true })
    expect(useStore.getState().notifPrefs).toEqual({ email: false, push: false, sms: true })

    store.setNotifPrefs(prev => ({ ...prev, email: true }))
    expect(useStore.getState().notifPrefs.email).toBe(true)

    store.setForumDigest('none')
    expect(useStore.getState().forumDigest).toBe('none')

    store.setForumTracking(false)
    expect(useStore.getState().forumTracking).toBe(false)

    store.setForumAutoSubscribe(false)
    expect(useStore.getState().forumAutoSubscribe).toBe(false)

    store.setCalendarStartDay('sunday')
    expect(useStore.getState().calendarStartDay).toBe('sunday')

    store.setCalendarDefaultView('week')
    expect(useStore.getState().calendarDefaultView).toBe('week')

    store.setMessagePrivacy('contacts')
    expect(useStore.getState().messagePrivacy).toBe('contacts')

    store.setMessageEmailOffline(false)
    expect(useStore.getState().messageEmailOffline).toBe(false)
  })

  it('handles user profile save success and failure', async () => {
    const toast = { success: vi.fn(), error: vi.fn() }
    const t = vi.fn(k => k)

    // Success case
    await useStore.getState().handleSave(toast, t)
    expect(toast.success).toHaveBeenCalledWith('settings.save_success')

    // Error case
    const mockApiPut = vi.spyOn(api, 'put').mockRejectedValueOnce(new Error('Save error'))
    await useStore.getState().handleSave(toast, t)
    expect(toast.error).toHaveBeenCalledWith('common.save_error')
    mockApiPut.mockRestore()
  })
})

