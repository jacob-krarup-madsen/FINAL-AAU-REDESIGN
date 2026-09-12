import React, { type ReactNode } from 'react'
import { clsx, type ClassValue } from 'clsx'
import {
  FileText, type LucideIcon, Play, Upload, Link2, File,
  PenSquare, BookOpen, Wifi, Mail, Users, Cloud, Book, ClipboardList, Video,
  Wrench, MessageSquare
} from 'lucide-react'
import type { StagedFile, ResourceTool, FavoriteItem, FavoriteType, CourseListItem, CourseItem } from '@/lib/types'
import { registryTools, courseList, courses as coursesMap, forums } from '@/lib/data'
import { translations } from '@/translations'
import routes from '@/routes'

// ── Types ────────────────────────────────────────────────────────────────────

export type Theme = 'system' | 'light' | 'dark'
export type Lang = 'da' | 'en'

export interface ResolvedFavorite {
  id: string
  type: FavoriteType
  entityId: number
  title: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  link: string
  external?: boolean
}

// ── env ──────────────────────────────────────────────────────────────────────

export const env = {
  open: (url: string, target = '_blank', features = 'noopener,noreferrer') => {
    try {
      if (typeof window !== 'undefined' && window.open) {
        return window.open(url, target, features)
      }
      console.warn('window.open is not available in this environment.')
    } catch (error) {
      console.error('Failed to execute window.open:', error)
    }
    return null
  },

  getInnerWidth: () => {
    try {
      return typeof window !== 'undefined' ? window.innerWidth : 0
    } catch {
      return 0
    }
  },

  matchMedia: (query: string) => {
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia(query)
      }
    } catch (error) {
      console.error('matchMedia is not available:', error)
    }
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList
  },

  isIframe: () => {
    try {
      return typeof window !== 'undefined' && window.self !== window.top
    } catch {
      return true
    }
  }
}

// ── theme ────────────────────────────────────────────────────────────────────

export function computeIsDarkMode(theme: Theme): boolean {
  if (typeof window === 'undefined') return false
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return env.matchMedia('(prefers-color-scheme: dark)').matches
}

interface ThemeConfig {
  icon: LucideIcon
  color: string
  bg: string
}

export const ITEM_TYPE_MAP: Record<string, ThemeConfig> = {
  pdf: { icon: FileText, color: 'danger', bg: 'bg-danger/10' },
  video: { icon: Play, color: 'success', bg: 'bg-success/10' },
  assignment: { icon: Upload, color: 'accent', bg: 'bg-accent/10' },
  link: { icon: Link2, color: 'info', bg: 'bg-info/10' },
  default: { icon: File, color: 'muted', bg: 'bg-bg-highlight/50' },
  file: { icon: File, color: 'muted', bg: 'bg-bg-highlight/50' },
}

const fileTypeConfig = (key: keyof typeof ITEM_TYPE_MAP) => {
  const entry = ITEM_TYPE_MAP[key]
  return { icon: entry.icon, colorClass: `text-${entry.color} ${entry.bg}` }
}

export function getFileTypeConfig(typeOrName: string | undefined | null) {
  const name = (typeOrName || '').toLowerCase()
  if (name === 'pdf' || name.endsWith('.pdf')) return fileTypeConfig('pdf')
  if (name === 'video' || name.match(/\.(mp4|mkv|avi|mov|mp3|wav)$/)) return fileTypeConfig('video')
  if (name === 'link' || name.startsWith('http')) return fileTypeConfig('link')
  if (name === 'assignment') return fileTypeConfig('assignment')
  return fileTypeConfig('file')
}

export const UI_PALETTE: Record<string, { bg: string; text: string }> = {
  'var(--aau-light-blue)': { bg: 'var(--color-event-blue-bg)', text: 'var(--color-event-blue-text)' },
  'var(--color-accent)': { bg: 'var(--color-event-blue-bg)', text: 'var(--color-event-blue-text)' },
  'var(--color-primary)': { bg: 'var(--color-event-primary-bg)', text: 'var(--color-event-primary-text)' },
  'var(--color-danger)': { bg: 'var(--color-event-danger-bg)', text: 'var(--color-event-danger-text)' },
  'var(--color-danger-dark)': { bg: 'var(--color-event-danger-bg)', text: 'var(--color-event-danger-text)' },
  danger: { bg: 'var(--color-event-danger-bg)', text: 'var(--color-event-danger-text)' },
  accent: { bg: 'var(--color-event-blue-bg)', text: 'var(--color-event-blue-text)' },
  primary: { bg: 'var(--color-event-primary-bg)', text: 'var(--color-event-primary-text)' },
}

// ── cn ───────────────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

// ── files ────────────────────────────────────────────────────────────────────

export function processFileMetadata(fileList: FileList): StagedFile[] {
  return Array.from(fileList).map((file) => ({
    name: file.name,
    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    id: crypto.randomUUID(),
  }))
}

// ── text ─────────────────────────────────────────────────────────────────────

export function linkifyText(text: string): ReactNode {
  const urlPattern = /(https?:\/\/[^\s]+|[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g
  const parts = text.split(urlPattern)
  return parts.map((part, i) => {
    if (urlPattern.test(part)) {
      const href = part.startsWith('http') ? part : `https://${part}`
      return React.createElement(
        'a',
        {
          key: i,
          href,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'text-primary hover:underline'
        },
        part
      )
    }
    return part
  })
}

// ── storage ──────────────────────────────────────────────────────────────────

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return defaultValue
      }
      const item = window.localStorage.getItem(key)
      if (!item) return defaultValue
      try {
        return JSON.parse(item)
      } catch {
        if (typeof defaultValue === 'string') {
          return item as unknown as T
        }
        console.warn(`Could not parse storage key "${key}" as JSON, using default.`)
        return defaultValue
      }
    } catch (error) {
      console.error(`Error reading storage key "${key}":`, error)
      return defaultValue
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Error writing storage key "${key}":`, error)
    }
  },

  remove: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing storage key "${key}":`, error)
    }
  }
}

// ── date ─────────────────────────────────────────────────────────────────────

export function formatTime(date: Date, lang: Lang): string {
  return date.toLocaleTimeString(localeForLang(lang), { hour: '2-digit', minute: '2-digit' })
}

export function formatLongDateTime(date: Date, lang: Lang): string {
  return date.toLocaleString(localeForLang(lang), { dateStyle: 'long', timeStyle: 'short' })
}

function formatShortDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(localeForLang(lang), { day: 'numeric', month: 'short' })
}

export function formatRelativeDateGroup(date: Date, lang: Lang, now = new Date()): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (target.getTime() === today.getTime()) {
    return translations[lang].today as string
  }

  if (target.getTime() === yesterday.getTime()) {
    return translations[lang].yesterday as string
  }

  return formatShortDate(date, lang)
}

interface DeadlineInfo {
  label: string
  urgency: 'overdue' | 'today' | 'tomorrow' | 'soon' | 'later'
  color: string
  relativeLabel?: string
  dateLabel?: string
}

export function getDeadlineInfo(dateInput: string | Date, lang: Lang, now = new Date()): DeadlineInfo {
  const target = new Date(dateInput)
  const targetTime = target.getTime()
  const nowTime = now.getTime()

  const todayDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDateObj = new Date(target.getFullYear(), target.getMonth(), target.getDate())

  const diffDays = Math.round((targetDateObj.getTime() - todayDateObj.getTime()) / (1000 * 60 * 60 * 24))

  const hoursUntil = (targetTime - nowTime) / (1000 * 60 * 60)

  let urgency: 'overdue' | 'today' | 'tomorrow' | 'soon' | 'later'
  if (targetTime < nowTime) {
    urgency = 'overdue'
  } else if (diffDays === 0) {
    urgency = 'today'
  } else if (diffDays === 1) {
    urgency = 'tomorrow'
  } else if (hoursUntil <= 48) {
    urgency = 'soon'
  } else {
    urgency = 'later'
  }

  const dayNameRaw = target.toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-US', { weekday: 'long' })
  const dayName = dayNameRaw.charAt(0).toUpperCase() + dayNameRaw.slice(1)
  const hh = String(target.getHours()).padStart(2, '0')
  const mm = String(target.getMinutes()).padStart(2, '0')
  const timeStr = `${hh}:${mm}`
  const weekdayAndTime = lang === 'da' ? `${dayName} kl. ${timeStr}` : `${dayName} at ${timeStr}`
  const monthDay = target.toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-US', { day: 'numeric', month: 'short' })
  
  const relativeLabel = urgency === 'overdue'
    ? (lang === 'da' ? 'Overskredet' : 'Overdue')
    : urgency === 'today'
    ? (lang === 'da' ? 'I dag' : 'Today')
    : urgency === 'tomorrow'
    ? (lang === 'da' ? 'I morgen' : 'Tomorrow')
    : (lang === 'da' ? `Om ${diffDays} dage` : `In ${diffDays} days`)

  const dateLabel = (urgency === 'today' || urgency === 'tomorrow')
    ? (lang === 'da' ? `kl. ${timeStr}` : `at ${timeStr}`)
    : (lang === 'da' ? `${dayName} ${monthDay} kl. ${timeStr}` : `${dayName}, ${monthDay} at ${timeStr}`)

  const label = urgency === 'overdue'
    ? (lang === 'da' ? `Overskredet · ${weekdayAndTime}` : `Overdue · ${weekdayAndTime}`)
    : `${relativeLabel} · ${dateLabel}`

  let color = ''
  if (urgency === 'overdue') {
    color = 'var(--color-status-overdue)'
  } else if (urgency === 'today') {
    color = 'var(--color-status-urgent)'
  } else if (urgency === 'tomorrow' || urgency === 'soon') {
    color = 'var(--color-status-warning)'
  } else {
    color = 'var(--color-status-neutral)'
  }

  return { label, urgency, color, relativeLabel, dateLabel }
}

export function getCourseItemMetadata(item: CourseItem, lang: Lang): string {
  const typeLabel = (() => {
    switch (item.type) {
      case 'pdf': return 'PDF'
      case 'video': return 'Video'
      case 'link': return lang === 'da' ? 'Ekstern ressource' : 'External resource'
      case 'assignment': return lang === 'da' ? 'Aflevering' : 'Assignment'
      default: return ''
    }
  })()

  if (item.type === 'pdf' && item.size) {
    return `PDF · ${item.size}`
  }
  if (item.type === 'video' && item.duration) {
    return `Video · ${item.duration}`
  }
  if (item.type === 'assignment' && item.deadline) {
    const parsedDate = new Date(item.deadline)
    if (!isNaN(parsedDate.getTime())) {
      const info = getDeadlineInfo(parsedDate, lang)
      const formattedDead = info.relativeLabel || ''
      const prefix = lang === 'da' ? 'Aflevering' : 'Assignment'
      return formattedDead ? `${prefix} · ${formattedDead}` : prefix
    }
  }
  return typeLabel
}

// ── tools ────────────────────────────────────────────────────────────────────

interface RawTool {
  iconName: string;
  [key: string]: unknown;
}

const ICON_MAP: Record<string, LucideIcon> = {
  PenSquare,
  FileText,
  BookOpen,
  Wifi,
  Mail,
  Users,
  Cloud,
  Book,
  ClipboardList,
  Video,
}

const mapTool = (tool: RawTool): ResourceTool => ({
  ...tool,
  icon: ICON_MAP[tool.iconName] || /* istanbul ignore next */ FileText,
}) as unknown as ResourceTool

export const allTools: ResourceTool[] = registryTools
  .filter(t => t.category === 'tools')
  .map(mapTool)

export const allEssentials: ResourceTool[] = registryTools
  .filter(t => t.category === 'essentials')
  .map(mapTool)

export const allToolsList: ResourceTool[] = [...allTools, ...allEssentials]

// ── breadcrumbs ──────────────────────────────────────────────────────────────

export const getAutomaticBreadcrumbs = (
  pathname: string,
  lang: Lang,
  t: (key: string) => string
): { label: string; href?: string }[] => {
  if (pathname === '/' || pathname === '/dashboard') {
    return [{ label: t('dashboard') }]
  }

  const crumbs: { label: string; href?: string }[] = [
    { label: t('dashboard'), href: '/' }
  ]

  const courseMatch = pathname.match(/^\/course\/(\d+)/)
  if (courseMatch) {
    const courseId = parseInt(courseMatch[1], 10)
    const course = courseList.find(c => c.id === courseId)
    crumbs.push({ label: t('courses'), href: '/courses' })
    if (course) {
      crumbs.push({ label: lang === 'da' ? course.title : (course.titleEn || course.title) })
    }
    return crumbs
  }

  const submissionMatch = pathname.match(/^\/submission\/(\d+)\/(\d+)/)
  if (submissionMatch) {
    const courseId = parseInt(submissionMatch[1], 10)
    const course = courseList.find(c => c.id === courseId)
    crumbs.push({ label: t('courses'), href: '/courses' })
    if (course) {
      crumbs.push({ label: lang === 'da' ? course.title : (course.titleEn || course.title), href: `/course/${courseId}` })
    }
    crumbs.push({ label: t('submission') })
    return crumbs
  }

  const forumMatch = pathname.match(/^\/forum\/(\d+)/)
  if (forumMatch) {
    crumbs.push({ label: t('courses'), href: '/courses' })
    crumbs.push({ label: t('forum_thread') })
    return crumbs
  }

  const staticRoutes = routes.filter(r => r.path !== '/' && !r.path.includes(':'))
  const matchedRoute = staticRoutes.find(r => pathname.startsWith(r.path))
  if (matchedRoute) {
    crumbs.push({ label: t(matchedRoute.breadcrumbKey ?? matchedRoute.label) })
  } else {
    const segments = pathname.split('/').filter(Boolean)
    segments.forEach((seg, idx) => {
      const isLast = idx === segments.length - 1
      const label = t(seg) || seg
      crumbs.push({
        label,
        href: isLast ? undefined : '/' + segments.slice(0, idx + 1).join('/')
      })
    })
  }

  return crumbs
}

// ── favorites ────────────────────────────────────────────────────────────────

function getFavoriteColor(type: FavoriteType): string {
  switch (type) {
    case 'course': return 'var(--color-primary)'
    case 'tool': return 'var(--color-success)'
    case 'file': return 'var(--color-warning)'
    case 'forum': return 'var(--color-info)'
    case 'link': return 'var(--aau-light-pink)'
  }
}

function getFavoriteBg(type: FavoriteType): string {
  switch (type) {
    case 'course': return 'rgba(59, 130, 246, 0.1)'
    case 'tool': return 'rgba(16, 185, 129, 0.1)'
    case 'file': return 'rgba(245, 158, 11, 0.1)'
    case 'forum': return 'rgba(6, 182, 212, 0.1)'
    case 'link': return 'rgba(219, 39, 119, 0.1)'
  }
}

export function getFavoriteLabel(type: FavoriteType, lang: Lang): string {
  return (translations[lang]?.[`fav_${type}`] as string) || type
}

export function resolveFavorite(
  fav: FavoriteItem,
  lang: Lang,
  courses: CourseListItem[],
  t: (key: string) => string,
): ResolvedFavorite | null {
  switch (fav.type) {
    case 'course': {
      const course = courses.find(c => c.id === fav.entityId)
      if (!course) return null
      return {
        id: fav.id,
        type: fav.type,
        entityId: fav.entityId,
        title: lang === 'da' ? course.title : course.titleEn,
        icon: BookOpen,
        iconBg: getFavoriteBg('course'),
        iconColor: getFavoriteColor('course'),
        link: `/course/${course.id}`,
      }
    }
    case 'tool': {
      const tool = allToolsList.find(t => t.id === fav.entityId)
      if (!tool) return null
      return {
        id: fav.id,
        type: fav.type,
        entityId: fav.entityId,
        title: (tool.titleKey ? t(tool.titleKey) : (lang === 'da' ? tool.titleDa : tool.titleEn)) || '',
        icon: Wrench,
        iconBg: getFavoriteBg('tool'),
        iconColor: getFavoriteColor('tool'),
        link: tool.url,
        external: true,
      }
    }
    case 'forum': {
      const forum = forums.find(f => f.id === fav.entityId)
      if (!forum) return null
      return {
        id: fav.id,
        type: fav.type,
        entityId: fav.entityId,
        title: lang === 'da' ? forum.title : forum.titleEn,
        icon: MessageSquare,
        iconBg: getFavoriteBg('forum'),
        iconColor: getFavoriteColor('forum'),
        link: '/courses',
      }
    }
    case 'file': {
      let foundTitle: string | null = null
      let foundLink = '/courses'
      for (const courseId in coursesMap) {
        const course = coursesMap[courseId]
        for (const section of course.sections) {
          const item = section.items.find(i => i.id === fav.entityId)
          if (item) {
            foundTitle = lang === 'da' ? item.title : item.titleEn
            foundLink = `/course/${courseId}`
            break
          }
        }
        if (foundTitle) break
      }
      if (!foundTitle) return null
      return {
        id: fav.id,
        type: fav.type,
        entityId: fav.entityId,
        title: foundTitle,
        icon: FileText,
        iconBg: getFavoriteBg('file'),
        iconColor: getFavoriteColor('file'),
        link: foundLink,
      }
    }
    case 'link': {
      return null
    }
  }
}

export function sortFavorites(favorites: FavoriteItem[]): FavoriteItem[] {
  return [...favorites].sort((a, b) => a.order - b.order)
}

// ── Private helpers ──────────────────────────────────────────────────────────

function localeForLang(lang: Lang): string {
  return lang === 'da' ? 'da-DK' : 'en-US'
}

export function l<T>(lang: Lang, da: T, en: T): T {
  return lang === 'da' ? da : en
}
