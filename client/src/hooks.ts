import { useState, useRef, useEffect, useCallback, useMemo, type MouseEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { Book, House, CalendarDays, GraduationCap, FolderOpen, type LucideIcon } from 'lucide-react'
import { courses } from '@/lib/data'
import useStore from '@/store'

// ── useDropdown ─────────────────────────────────────────────────────────────

export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setIsOpen(false)
    buttonRef.current?.focus()
  }, [])

  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const firstItem = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"], button.w-full')
        firstItem?.focus()
      }, 50)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const mouseDownListener = handleClickOutside as unknown as EventListener
    const keyDownListener = handleKeyDown as unknown as EventListener
    document.addEventListener('mousedown', mouseDownListener)
    document.addEventListener('keydown', keyDownListener)
    return () => {
      document.removeEventListener('mousedown', mouseDownListener)
      document.removeEventListener('keydown', keyDownListener)
    }
  }, [close])

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      close()
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"], button.w-full'))
      const activeIdx = items.indexOf(document.activeElement as HTMLElement)
      let nextIdx = activeIdx
      if (e.key === 'ArrowDown') {
        nextIdx = activeIdx < items.length - 1 ? activeIdx + 1 : 0
      } else {
        nextIdx = activeIdx > 0 ? activeIdx - 1 : items.length - 1
      }
      items[nextIdx]?.focus()
    }
  }

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(true)
    }
  }

  return {
    isOpen,
    setIsOpen,
    dropdownRef,
    menuRef,
    buttonRef,
    close,
    toggle,
    handleMenuKeyDown,
    handleTriggerKeyDown,
  }
}

// ── useFilteredCollection ───────────────────────────────────────────────────

export interface FilteredCollectionConfig<T> {
  searchKeys: (item: T) => string[]
  filterKey?: (item: T) => string
  filterDefault?: string | null
  filterOptions?: (items: T[]) => string[]
  sortComparator?: (a: T, b: T, direction: 'asc' | 'desc') => number
  sortDefault?: 'asc' | 'desc'
}

export interface FilteredCollectionResult<T> {
  searchQuery: string
  setSearchQuery: (q: string) => void
  activeFilter: string | null
  setActiveFilter: (f: string | null) => void
  filterOptions: string[]
  sortDirection: 'asc' | 'desc'
  setSortDirection: (d: 'asc' | 'desc') => void
  items: T[]
}

export function useFilteredCollection<T>(
  allItems: T[],
  config: FilteredCollectionConfig<T>
): FilteredCollectionResult<T> {
  const {
    searchKeys,
    filterKey,
    filterDefault = null,
    filterOptions: deriveFilterOptions,
    sortComparator,
    sortDefault = 'asc',
  } = config

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string | null>(filterDefault ?? null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(sortDefault)

  const filterOptions = useMemo(
    () => (deriveFilterOptions ? deriveFilterOptions(allItems) : []),
    [allItems, deriveFilterOptions]
  )

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allItems.filter(item => {
      const matchesSearch =
        !q || searchKeys(item).some(k => k.toLowerCase().includes(q))

      const isAllFilter =
        !filterKey || activeFilter === null || activeFilter === filterDefault
      const matchesFilter =
        isAllFilter || filterKey!(item) === activeFilter

      return matchesSearch && matchesFilter
    })
  }, [allItems, searchQuery, activeFilter, filterKey, filterDefault, searchKeys])

  const sortedItems = useMemo(() => {
    if (!sortComparator) return filteredItems
    return [...filteredItems].sort((a, b) => sortComparator(a, b, sortDirection))
  }, [filteredItems, sortDirection, sortComparator])

  return {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filterOptions,
    sortDirection,
    setSortDirection,
    items: sortedItems,
  }
}

// ── useManagedCollection ─────────────────────────────────────────────────────

export interface ManagedCollectionConfig<T> extends FilteredCollectionConfig<T> {
  searchKeys: (item: T) => string[]
}

export interface ManagedCollectionResult<T> {
  items: T[]
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  view: 'active' | 'archive'
  setView: (v: 'active' | 'archive') => void
  archiveItem: (id: number, e: MouseEvent) => void
  restoreItem: (id: number, e: MouseEvent) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  activeFilter: string | null
  setActiveFilter: (f: string | null) => void
  filterOptions: string[]
  sortDirection: 'asc' | 'desc'
  setSortDirection: (d: 'asc' | 'desc') => void
  filteredItems: T[]
}

export function useManagedCollection<T extends { id: number; archived: boolean }>(
  initialItems: T[],
  config: ManagedCollectionConfig<T>
): ManagedCollectionResult<T> {
  const [view, setView] = useState<'active' | 'archive'>('active')
  const [items, setItems] = useState<T[]>(initialItems)

  const archiveItem = useCallback((id: number, e: MouseEvent): void => {
    e.stopPropagation()
    setItems(prev => prev.map(i => i.id === id ? { ...i, archived: true } : i))
  }, [])

  const restoreItem = useCallback((id: number, e: MouseEvent): void => {
    e.stopPropagation()
    setItems(prev => prev.map(i => i.id === id ? { ...i, archived: false } : i))
  }, [])

  const archivableFiltered = useMemo(() =>
    items.filter(i => view === 'active' ? !i.archived : i.archived),
    [items, view]
  )

  const {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filterOptions,
    sortDirection,
    setSortDirection,
    items: filteredItems,
  } = useFilteredCollection(archivableFiltered, config)

  return {
    items,
    setItems,
    view,
    setView,
    archiveItem,
    restoreItem,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filterOptions,
    sortDirection,
    setSortDirection,
    filteredItems,
  }
}


// ── useSearch ────────────────────────────────────────────────────────────────

export interface SearchResult {
  label: string
  path: string
  icon: LucideIcon
  group: string
  description: string
  img?: string
  code?: string
  professor?: string
}

export interface UseSearchReturn {
  query: string
  results: SearchResult[]
  filteredResults: SearchResult[]
  categories: string[]
  activeFilter: string
  setActiveFilter: (f: string) => void
  getActionLabel: (res: SearchResult) => string
  subtitle: string
}

export function useSearch(): UseSearchReturn {
  const t = useStore(state => state.t)
  const localize = useStore(state => state.localize)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const query = (queryParams.get('q') || '').trim()

  const [activeFilter, setActiveFilter] = useState<string>('all')

  const results = useMemo(() => {
    const courseItems = Object.entries(courses).map(([id, course]) => ({
      label: localize(course, 'title'),
      path: `/course/${id}`,
      icon: Book,
      group: course.group || t('courses'),
      description: course.description || t('moodle_course_module'),
      img: course.img,
      code: course.code,
      professor: course.professor,
    })) as SearchResult[]

    const pages: SearchResult[] = [
      { label: t('dashboard'), path: '/', icon: House, group: t('pages'), description: t('personal_overview') },
      { label: t('calendar'), path: '/calendar', icon: CalendarDays, group: t('pages'), description: t('schedule_and_deadlines') },
      { label: t('courses'), path: '/courses', icon: GraduationCap, group: t('pages'), description: t('overview_all_modules') },
      { label: t('resources'), path: '/resources', icon: FolderOpen, group: t('pages'), description: t('tools_and_guidelines') },
    ]

    const searchData = [...pages, ...courseItems]
    if (!query) return []
    const q = query.toLowerCase()
    return searchData.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.code?.toLowerCase().includes(q) ||
      item.professor?.toLowerCase().includes(q)
    )
  }, [query, t, localize])

  const filteredResults = useMemo(() => {
    if (activeFilter === 'all') return results
    return results.filter(r => r.group.toLowerCase() === activeFilter.toLowerCase())
  }, [results, activeFilter])

  const categories = useMemo(() => {
    const cats = ['all']
    results.forEach(r => {
      if (!cats.includes(r.group)) cats.push(r.group)
    })
    return cats
  }, [results])

  const getActionLabel = useCallback((res: SearchResult) => {
    if (res.group === t('courses')) return t('go_to_course')
    if (res.group === t('pages')) return `${t('open')} ${res.label}`
    return t('go_to_content')
  }, [t])

  const subtitle = useMemo(() => {
    const resultsText = results.length === 1 ? t('search_results_singular') : t('search_results_plural')
    return t('search_found_results')
      .replace('{count}', results.length.toString())
      .replace('{results}', resultsText)
  }, [results.length, t])

  return { query, results, filteredResults, categories, activeFilter, setActiveFilter, getActionLabel, subtitle }
}
