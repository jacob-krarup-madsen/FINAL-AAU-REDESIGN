import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PersistedStateSchema } from '@/lib/types';
import type { FavoriteItem, FavoriteType, CourseListItem, CalendarEvents } from '@/lib/types';
import { STORAGE_KEYS, DASHBOARD_CONFIG } from '@/lib/constants';
import { storage } from '@/lib/utils';
import { Theme, Lang, computeIsDarkMode } from '@/lib/utils';
import { getTranslation } from '@/translations';
import { courseList as initialCourses } from '@/lib/data';
import { saveSettings } from '@/lib/api';

export type { Theme, Lang };

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface DashboardWidgetConfig {
  id: string;
  span: number;
  size?: 'small' | 'medium' | 'large';
  visible?: boolean;
  title?: string;
  allowedSizes?: ('small' | 'medium' | 'large')[];
  defaultSize?: 'small' | 'medium' | 'large';
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  userModified?: boolean;
  pinned?: boolean;
}

export interface CourseWithStatus extends CourseListItem {
  status: 'active' | 'inactive' | 'upcoming'
  progress?: number
}

interface UISlice {
  theme: Theme;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;

  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  localize: <T extends object>(obj: T, key?: string) => string;

  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;

  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (crumbs: BreadcrumbItem[] | undefined) => void;

  notificationCount: number;
  setNotificationCount: (count: number) => void;
  decrementNotificationCount: () => void;

  messageCount: number;
  setMessageCount: (count: number) => void;
  decrementMessageCount: () => void;

  dashboardLayout: DashboardWidgetConfig[];
  setDashboardLayout: (layout: DashboardWidgetConfig[]) => void;
  resetDashboardLayout: () => void;
}

interface CourseSlice {
  courses: CourseWithStatus[]
  toggleStar: (courseId: number) => void

  courseProgress: Record<string | number, number[]>
  toggleCourseItem: (courseId: string | number, itemId: number) => void
  getCourseProgress: (courseId: string | number, totalItems: number) => number

  calendarEvents: CalendarEvents
  updateCalendarEvents: (events: CalendarEvents) => void
}

interface FavoriteSlice {
  favorites: FavoriteItem[]
  favoritesLimit: number
  toggleFavorite: (type: FavoriteType, entityId: number) => void
  reorderFavorites: (fromIndex: number, toIndex: number) => void
  isFavorite: (type: FavoriteType, entityId: number) => boolean
  clearFavorites: () => void
}

interface UserSlice {
  firstName: string;
  lastName: string;
  notifPrefs: { email: boolean; push: boolean; sms: boolean };
  forumDigest: 'none' | 'complete' | 'subjects';
  forumTracking: boolean;
  forumAutoSubscribe: boolean;
  calendarStartDay: 'monday' | 'sunday';
  calendarDefaultView: 'month' | 'week' | 'day';
  messagePrivacy: 'contacts' | 'courses' | 'anyone';
  messageEmailOffline: boolean;
  isSaving: boolean;

  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  setNotifPrefs: (prefs: { email: boolean; push: boolean; sms: boolean } | ((prev: { email: boolean; push: boolean; sms: boolean }) => { email: boolean; push: boolean; sms: boolean })) => void;
  setForumDigest: (digest: 'none' | 'complete' | 'subjects') => void;
  setForumTracking: (tracking: boolean) => void;
  setForumAutoSubscribe: (autoSubscribe: boolean) => void;
  setCalendarStartDay: (startDay: 'monday' | 'sunday') => void;
  setCalendarDefaultView: (defaultView: 'month' | 'week' | 'day') => void;
  setMessagePrivacy: (privacy: 'contacts' | 'courses' | 'anyone') => void;
  setMessageEmailOffline: (offline: boolean) => void;

  handleSave: (toast: { success: (msg: string) => void; error: (msg: string) => void }, t: (key: string) => string) => Promise<void>;
}

interface AppState extends UISlice, CourseSlice, FavoriteSlice, UserSlice {}

function applySidebarClasses(isCollapsed: boolean) {
  if (typeof window === 'undefined') return;
  document.body.classList.toggle('sidebar-collapsed', isCollapsed);
}

function buildCourses(): CourseWithStatus[] {
  return initialCourses.map(course => ({
    ...course,
    status: course.tab === 'finished' ? 'inactive' : (course.tab === 'upcoming' ? 'upcoming' : 'active'),
  }))
}

const lazyStorage = {
  getItem: (name: string) => storage.get(name, null),
  setItem: (name: string, value: unknown) => storage.set(name, value),
  removeItem: (name: string) => storage.remove(name),
}

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // UI Slice
      theme: 'system',
      isDarkMode: computeIsDarkMode('system'),
      setTheme: (theme) => {
        const isDark = computeIsDarkMode(theme);
        set({ theme, isDarkMode: isDark });
      },

      lang: 'da',
      setLang: (lang) => {
        set({ lang });
        if (typeof window !== 'undefined') {
          document.documentElement.lang = lang;
        }
      },
      t: (key) => {
        const { lang } = get();
        return getTranslation(key, lang);
      },
      localize: (obj: object, key?: string) => {
        const { lang } = get();
        const rec = obj as Record<string, unknown>;
        if (!rec) return '';

        const target = key ? rec[key] : rec;
        if (target && typeof target === 'object' && target !== null) {
          const tObj = target as Record<string, unknown>;
          if ('da' in tObj || 'en' in tObj) {
            return (tObj[lang] as string) || (tObj['da'] as string) || (tObj['en'] as string) || '';
          }
        }

        if (key) {
          const keyEn = `${key}En`;
          const keyDa = `${key}Da`;
          if (lang === 'en') {
            return (rec[keyEn] as string) || (rec[key] as string) || (rec[keyDa] as string) || '';
          }
          return (rec[keyDa] as string) || (rec[key] as string) || (rec[keyEn] as string) || '';
        }

        return '';
      },

      isCollapsed: true,
      setCollapsed: (collapsed) => {
        set({ isCollapsed: collapsed });
        applySidebarClasses(collapsed);
      },
      toggleSidebar: () => {
        const { isCollapsed } = get();
        const next = !isCollapsed;
        set({ isCollapsed: next });
        applySidebarClasses(next);
      },
      closeSidebar: () => {
        set({ isCollapsed: true });
        applySidebarClasses(true);
      },

      breadcrumbs: [],
      setBreadcrumbs: (crumbs) => {
        set({ breadcrumbs: crumbs || [] });
      },

      notificationCount: 2,
      setNotificationCount: (count) => {
        set({ notificationCount: count });
      },
      decrementNotificationCount: () => {
        const { notificationCount } = get();
        set({ notificationCount: Math.max(0, notificationCount - 1) });
      },

      messageCount: 1,
      setMessageCount: (count) => {
        set({ messageCount: count });
      },
      decrementMessageCount: () => {
        const { messageCount } = get();
        set({ messageCount: Math.max(0, messageCount - 1) });
      },

      dashboardLayout: [
        { id: 'quickOverview', title: 'Dagens program', visible: true, size: 'medium', span: 8, defaultSize: 'medium', allowedSizes: ['small', 'medium', 'large'] },
        { id: 'deadlines', title: 'Seneste afleveringer', visible: true, size: 'medium', span: 8, defaultSize: 'medium', allowedSizes: ['small', 'medium', 'large'] },
        { id: 'messages', title: 'Beskeder', visible: true, size: 'medium', span: 8, defaultSize: 'medium', allowedSizes: ['small', 'medium', 'large'] },
        { id: 'forumActivity', title: 'Forum aktivitet', visible: true, size: 'small', span: 4, defaultSize: 'small', allowedSizes: ['small', 'medium', 'large'] },
        { id: 'favorites', title: 'Favoritter', visible: true, size: 'small', span: 4, defaultSize: 'small', allowedSizes: ['small', 'medium', 'large'] },
        { id: 'shortcuts', title: 'Genveje', visible: true, size: 'small', span: 4, defaultSize: 'small', allowedSizes: ['small', 'medium'] },
        { id: 'calendar', title: 'Kalender', visible: false, size: 'medium', span: 8, defaultSize: 'medium', allowedSizes: ['small', 'medium', 'large'] },
        { id: 'courseProgress', title: 'Kursusprogress', visible: false, size: 'medium', span: 8, defaultSize: 'medium', allowedSizes: ['small', 'medium', 'large'] },
        { id: 'support', title: 'ITS Support', visible: false, size: 'small', span: 4, defaultSize: 'small', allowedSizes: ['small', 'medium'] },
      ],
      setDashboardLayout: (layout) => set({ dashboardLayout: layout }),
      resetDashboardLayout: () => set({
        dashboardLayout: [
          { id: 'quickOverview', title: 'Dagens program', visible: true, size: 'medium', span: 8, defaultSize: 'medium', allowedSizes: ['small', 'medium', 'large'] },
          { id: 'deadlines', title: 'Seneste afleveringer', visible: true, size: 'medium', span: 8, defaultSize: 'medium', allowedSizes: ['small', 'medium', 'large'] },
          { id: 'messages', title: 'Beskeder', visible: true, size: 'medium', span: 8, defaultSize: 'medium', allowedSizes: ['small', 'medium', 'large'] },
          { id: 'forumActivity', title: 'Forum aktivitet', visible: true, size: 'small', span: 4, defaultSize: 'small', allowedSizes: ['small', 'medium', 'large'] },
          { id: 'favorites', title: 'Favoritter', visible: true, size: 'small', span: 4, defaultSize: 'small', allowedSizes: ['small', 'medium', 'large'] },
          { id: 'shortcuts', title: 'Genveje', visible: true, size: 'small', span: 4, defaultSize: 'small', allowedSizes: ['small', 'medium'] },
          { id: 'calendar', title: 'Kalender', visible: false, size: 'medium', span: 8, defaultSize: 'medium', allowedSizes: ['small', 'medium', 'large'] },
          { id: 'courseProgress', title: 'Kursusprogress', visible: false, size: 'medium', span: 8, defaultSize: 'medium', allowedSizes: ['small', 'medium', 'large'] },
          { id: 'support', title: 'ITS Support', visible: false, size: 'small', span: 4, defaultSize: 'small', allowedSizes: ['small', 'medium'] },
        ]
      }),

      // Course Slice
      courses: buildCourses(),
      toggleStar: (courseId) => {
        const { toggleFavorite } = get()
        toggleFavorite('course', courseId)
      },

      courseProgress: {},
      toggleCourseItem: (courseId, itemId) => {
        const { courseProgress } = get()
        const current = courseProgress[courseId] || []
        const updated = current.includes(itemId)
          ? current.filter((i) => i !== itemId)
          : [...current, itemId]
        set({ courseProgress: { ...courseProgress, [courseId]: updated } })
      },
      getCourseProgress: (courseId, totalItems) => {
        const { courseProgress } = get()
        const completed = (courseProgress[courseId] || []).length
        return totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0
      },

      calendarEvents: {},
      updateCalendarEvents: (events) => {
        set({ calendarEvents: events })
      },

      // Favorite Slice
      favorites: [],
      favoritesLimit: DASHBOARD_CONFIG.FAVORITES_LIMIT,
      toggleFavorite: (type, entityId) => {
        const { favorites } = get()
        const id = `${type}-${entityId}`
        const existing = favorites.find(f => f.id === id)
        if (existing) {
          set({ favorites: favorites.filter(f => f.id !== id) })
        } else {
          if (favorites.length >= DASHBOARD_CONFIG.FAVORITES_LIMIT) return
          const maxOrder = favorites.reduce((max, f) => Math.max(max, f.order), -1)
          set({
            favorites: [...favorites, {
              id,
              type,
              entityId,
              addedAt: Date.now(),
              order: maxOrder + 1,
            }],
          })
        }
      },
      reorderFavorites: (fromIndex, toIndex) => {
        const { favorites } = get()
        const reordered = [...favorites]
        const [moved] = reordered.splice(fromIndex, 1)
        reordered.splice(toIndex, 0, moved)
        set({ favorites: reordered.map((f, i) => ({ ...f, order: i })) })
      },
      isFavorite: (type, entityId) => {
        const { favorites } = get()
        return favorites.some(f => f.type === type && f.entityId === entityId)
      },
      clearFavorites: () => {
        set({ favorites: [] })
      },

      // User Slice
      firstName: storage.get(STORAGE_KEYS.USER_FIRST_NAME, 'Test User'),
      lastName: storage.get(STORAGE_KEYS.USER_LAST_NAME, 'Madsen'),
      notifPrefs: { email: true, push: true, sms: false },
      forumDigest: 'complete',
      forumTracking: true,
      forumAutoSubscribe: true,
      calendarStartDay: 'monday',
      calendarDefaultView: 'month',
      messagePrivacy: 'courses',
      messageEmailOffline: true,
      isSaving: false,

      setFirstName: (firstName) => {
        storage.set(STORAGE_KEYS.USER_FIRST_NAME, firstName);
        set({ firstName });
      },
      setLastName: (lastName) => {
        storage.set(STORAGE_KEYS.USER_LAST_NAME, lastName);
        set({ lastName });
      },
      setNotifPrefs: (notifPrefs) => set((state) => ({
        notifPrefs: typeof notifPrefs === 'function' ? notifPrefs(state.notifPrefs) : notifPrefs
      })),
      setForumDigest: (forumDigest) => set({ forumDigest }),
      setForumTracking: (forumTracking) => set({ forumTracking }),
      setForumAutoSubscribe: (forumAutoSubscribe) => set({ forumAutoSubscribe }),
      setCalendarStartDay: (calendarStartDay) => set({ calendarStartDay }),
      setCalendarDefaultView: (calendarDefaultView) => set({ calendarDefaultView }),
      setMessagePrivacy: (messagePrivacy) => set({ messagePrivacy }),
      setMessageEmailOffline: (messageEmailOffline) => set({ messageEmailOffline }),

      handleSave: async (toast, t) => {
        set({ isSaving: true });
        const { firstName, lastName, lang, theme, notifPrefs, forumDigest, forumTracking, forumAutoSubscribe } = get();
        storage.set(STORAGE_KEYS.USER_FIRST_NAME, firstName);
        storage.set(STORAGE_KEYS.USER_LAST_NAME, lastName);
        try {
          await saveSettings({
            language: lang,
            theme,
            notifications: notifPrefs,
            forumPreferences: {
              digest: forumDigest,
              tracking: String(forumTracking),
              autoSubscribe: String(forumAutoSubscribe),
            },
          });
          toast.success(t('settings.save_success'));
        } catch {
          toast.error(t('common.save_error'));
        } finally {
          set({ isSaving: false });
        }
      }
    }),
    {
      name: STORAGE_KEYS.APP_STORE,
      version: 3,
      storage: lazyStorage,
      onRehydrateStorage: () => (state) => {
        if (!state || typeof window === 'undefined') return
        
        try {
          const validated = PersistedStateSchema.parse(state)
          Object.assign(state, validated)
        } catch (e) {
          console.warn('Store state validation failed, using fallback initial values', e)
          Object.assign(state, { theme: 'system', lang: 'da', isCollapsed: true, courseProgress: {}, calendarEvents: {}, favorites: [] })
        }

        document.documentElement.lang = state.lang
      },
      partialize: (state) => ({
        theme: state.theme,
        lang: state.lang,
        isCollapsed: state.isCollapsed,
        courseProgress: state.courseProgress,
        calendarEvents: state.calendarEvents,
        favorites: state.favorites,
        firstName: state.firstName,
        lastName: state.lastName,
        notifPrefs: state.notifPrefs,
        forumDigest: state.forumDigest,
        forumTracking: state.forumTracking,
        forumAutoSubscribe: state.forumAutoSubscribe,
        calendarStartDay: state.calendarStartDay,
        calendarDefaultView: state.calendarDefaultView,
        messagePrivacy: state.messagePrivacy,
        messageEmailOffline: state.messageEmailOffline,
        dashboardLayout: state.dashboardLayout,
      }),
      migrate: (persisted: unknown, version) => {
        if (!persisted || typeof persisted !== 'object') {
          console.warn('Storage migration failed validation')
          return {
            theme: 'system',
            lang: 'da',
            isCollapsed: true,
            courseProgress: {},
            calendarEvents: {},
            favorites: [],
          } as unknown as AppState
        }
        if (version === 3) {
          return persisted as AppState
        }
        let state = persisted as Record<string, unknown>
        if (version === 0) {
          state = {
            ...state,
            courseProgress: state.courseProgress || {},
            calendarEvents: state.calendarEvents || {},
          }
        }
        if (version === 1) {
          const oldState = persisted as Record<string, unknown>
          const migrated: FavoriteItem[] = []
          const oldFavs = (oldState.toolFavorites as (string | number)[]) || []
          oldFavs.forEach((id: string | number, i: number) => {
            const numId = typeof id === 'number' ? id : parseInt(id, 10)
            migrated.push({
              id: `tool-${numId}`, type: 'tool', entityId: numId,
              addedAt: Date.now() - (oldFavs.length - i) * 1000,
              order: i,
            })
          })
          const oldCourses = (oldState.courses as { id: string | number; isStarred?: boolean }[]) || []
          const starredIds = oldCourses.filter(c => c.isStarred).map(c => c.id)
          starredIds.forEach((id, i) => {
            const numId = typeof id === 'number' ? id : parseInt(id, 10)
            if (!migrated.find(f => f.id === `course-${numId}`)) migrated.push({
              id: `course-${numId}`, type: 'course', entityId: numId,
              addedAt: Date.now() - (starredIds.length - i) * 1000,
              order: migrated.length + i,
            })
          })
          state = {
            ...state,
            favorites: migrated,
          }
        }

        if (version <= 2) {
          const expectedVisibilities: Record<string, boolean> = {
            deadlines: true,
            quickOverview: true,
            favorites: true,
            support: true,
            forumActivity: true,
            messages: false,
            calendar: false,
            courseProgress: false,
          };
          const newDefaults = [
            { id: 'deadlines', title: 'Seneste afleveringer', visible: true, size: 'medium', span: 8, defaultSize: 'medium', allowedSizes: ['small', 'medium', 'large'] },
            { id: 'messages', title: 'Beskeder', visible: true, size: 'small', span: 4, defaultSize: 'small', allowedSizes: ['small', 'medium', 'large'] },
            { id: 'calendar', title: 'Kalender', visible: true, size: 'medium', span: 8, defaultSize: 'medium', allowedSizes: ['small', 'medium', 'large'] },
            { id: 'favorites', title: 'Favoritter', visible: true, size: 'small', span: 4, defaultSize: 'small', allowedSizes: ['small', 'medium', 'large'] },
            { id: 'courseProgress', title: 'Kursusprogress', visible: false, size: 'small', span: 4, defaultSize: 'small', allowedSizes: ['small', 'medium', 'large'] },
            { id: 'forumActivity', title: 'Forum aktivitet', visible: false, size: 'small', span: 4, defaultSize: 'small', allowedSizes: ['small', 'medium', 'large'] },
            { id: 'support', title: 'ITS Support', visible: false, size: 'small', span: 4, defaultSize: 'small', allowedSizes: ['small', 'medium'] },
            { id: 'quickOverview', title: 'Dagens program', visible: false, size: 'medium', span: 8, defaultSize: 'medium', allowedSizes: ['small', 'medium', 'large'] },
          ];

          const layout = state.dashboardLayout;
          if (Array.isArray(layout)) {
            let matchesExactly = layout.length === 8;
            if (matchesExactly) {
              matchesExactly = layout.every(item => {
                if (!item || typeof item !== 'object') return false;
                const id = (item as any).id;
                if (typeof id !== 'string' || !(id in expectedVisibilities)) return false;
                return (item as any).visible === expectedVisibilities[id];
              });
            }

            if (matchesExactly) {
              state.dashboardLayout = newDefaults;
            } else {
              const layoutArray = [...layout];
              const existingIds = new Set(layoutArray.map(item => item && typeof item === 'object' ? (item as any).id : undefined).filter(Boolean));
              for (const widget of newDefaults) {
                if (!existingIds.has(widget.id)) {
                  layoutArray.push({
                    ...widget,
                    visible: false,
                  });
                }
              }
              state.dashboardLayout = layoutArray;
            }
          }
        }

        if (state && typeof state === 'object') {
          state.isCollapsed = true;
        }

        try {
          return PersistedStateSchema.parse(state) as unknown as AppState
        } catch (e) {
          console.warn('Storage migration failed validation', e)
          return {
            theme: 'system',
            lang: 'da',
            isCollapsed: true,
            courseProgress: {},
            calendarEvents: {},
            favorites: [],
          } as unknown as AppState
        }
      },
    },
  ),
)

export default useStore;

