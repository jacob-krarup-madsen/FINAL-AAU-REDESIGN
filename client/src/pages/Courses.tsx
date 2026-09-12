import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { Filter, ArrowDownZA, ArrowUpAZ } from 'lucide-react';
import { CoursesGrid } from '@/components/Courses';
import { Badge, Button, Tabs } from '@/components/ui';
import { SearchInput } from '@/components/ui';
import { PageLayout } from '@/components/Layout';
import { Card } from '@/components/ui';
import { Stack } from '@/components/Layout';
import { Heading, Text } from '@/components/ui';
import { Dropdown } from '@/components/ui';
import { ASSETS } from '@/lib/constants';
import { useFilteredCollection } from '@/hooks';
import { env } from '@/lib/utils';
import useStore from '@/store';

import type { CourseWithStatus } from '@/store';

const forums = [
  { id: 10, title: 'Studienævn for DDK', titleEn: 'Study Board for DDK', label: 'Information', labelEn: 'Information', img: '/images/student-life/2wb0369.webp', color: 'var(--color-success)' },
  { id: 11, title: 'Semesterforum (4. Semester)', titleEn: 'Semester Forum (4th Semester)', label: 'Fælles', labelEn: 'Shared', img: '/images/campus/2wb3689.webp', color: 'var(--color-primary)' },
]

const STATUS_WEIGHT: Record<string, number> = { active: 0, upcoming: 1, inactive: 2 }
const TAB_MAP = { current: 'active', finished: 'inactive', upcoming: 'upcoming' } as const

const tabItems = [
  { key: 'current', labelDa: 'I gang', labelEn: 'Current' },
  { key: 'finished', labelDa: 'Afsluttede', labelEn: 'Completed' },
  { key: 'upcoming', labelDa: 'Kommende', labelEn: 'Upcoming' },
]

function Courses() {
  const t = useStore((state) => state.t)
  const lang = useStore((state) => state.lang)
  const courses = useStore((state) => state.courses)
  const toggleFavorite = useStore((state) => state.toggleFavorite)
  const isFavorite = useStore((state) => state.isFavorite)

  const [showCourses, setShowCourses] = useState<boolean>(true)
  const [showForums, setShowForums] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'current' | 'finished' | 'upcoming'>('current')
  const [sortBy, setSortBy] = useState<'alpha' | 'status'>('status')

  useEffect(() => {
    if (import.meta.env.MODE !== 'test') {
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), 300)
      return () => clearTimeout(timer)
    }
  }, [])

  const tabCourses = useMemo(
    () => courses.filter(c => c.status === TAB_MAP[activeTab]),
    [courses, activeTab]
  )

  const {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filterOptions: labelFilters,
    sortDirection: sortOrder,
    setSortDirection: setSortOrder,
    items: sortedCourses,
  } = useFilteredCollection<CourseWithStatus>(tabCourses, {
    searchKeys: c => [
      t(`course_${c.id}_title`),
      c.code ?? '',
      t(`course_${c.id}_label`),
    ],
    filterKey: c => t(`course_${c.id}_label`),
    filterDefault: null,
    filterOptions: items => Array.from(new Set(items.map(c => t(`course_${c.id}_label`)).filter(Boolean))).sort(),
    sortComparator: (a, b, dir) => {
      if (sortBy === 'status') {
        const diff = (STATUS_WEIGHT[a.status] ?? 0) - (STATUS_WEIGHT[b.status] ?? 0)
        if (diff !== 0) return diff * (dir === 'asc' ? 1 : -1)
      }
      const aTitle = t(`course_${a.id}_title`)
      const bTitle = t(`course_${b.id}_title`)
      return dir === 'asc'
        ? aTitle.localeCompare(bTitle, lang)
        : bTitle.localeCompare(aTitle, lang)
    },
  })

  const handleToggleFavorite = useCallback((type: 'course' | 'forum', id: number) => {
    toggleFavorite(type, id)
  }, [toggleFavorite])

  const handleSortToggle = () => {
    if (sortBy === 'status') {
      if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else {
        setSortBy('alpha')
        setSortOrder('asc')
      }
    } else {
      if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else {
        setSortBy('status')
        setSortOrder('asc')
      }
    }
  }

  return (
    <PageLayout
      className="courses-page"
      pageKey="courses"
      title={t('courses')}
      subtitle={t('courses.subtitle')}
      flat
    >

      <div className="container container--courses pb-[var(--space-2xl)] mx-auto">
        <div className="courses-toolbar-wrapper w-full mb-[var(--space-lg)]">
          <Stack gap="sm" className="courses-toolbar bg-bg-highlight/30 dark:bg-white/5 p-[var(--space-sm)] rounded-[var(--radius-lg)] border border-border/40 flex-col md:flex-row md:justify-between md:items-center">
            <Tabs
              items={tabItems.map((ti) => ({
                ...ti,
                label: t(ti.key === 'current' ? 'tab_current' : ti.key === 'finished' ? 'tab_finished' : 'tab_upcoming')
              }))}
              activeTab={activeTab}
              onChange={(v) => setActiveTab(v as 'current' | 'finished' | 'upcoming')}
            />
            <Stack gap="sm" className="flex-col md:flex-row md:items-center w-full md:w-auto bg-bg-card/40 dark:bg-white/5 p-xs rounded-lg border border-border/20 md:border-none md:bg-transparent md:p-0">
              <SearchInput
                placeholder={t('search_courses')}
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
              />
              <Stack direction="row" gap="xs" className="flex items-center">
                <div className="relative flex-1">
                  <Dropdown>
                    <Dropdown.Trigger>
                      <Button
                        variant={activeFilter ? 'primary' : 'secondary'}
                        size="md"
                        icon={Filter}
                      >
                        {t('filter')}
                      </Button>
                    </Dropdown.Trigger>
                    <Dropdown.Menu className="min-w-[200px]">
                      <Dropdown.Item
                        onClick={() => setActiveFilter(null)}
                        className={!activeFilter ? 'bg-primary/10 text-primary font-semibold' : ''}
                      >
                        {t('all')}
                      </Dropdown.Item>
                      {labelFilters.map(label => (
                        <Dropdown.Item
                          key={label}
                          onClick={() => setActiveFilter(label)}
                          className={activeFilter === label ? 'bg-primary/10 text-primary font-semibold' : ''}
                        >
                          {label}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  icon={sortOrder === 'asc' ? ArrowDownZA : ArrowUpAZ}
                  className="flex-1"
                  onClick={handleSortToggle}
                >
                  {sortBy === 'status'
                    ? (sortOrder === 'asc' ? t('active_first') : t('inactive_first'))
                    : (sortOrder === 'asc' ? 'A-Å' : 'Å-A')}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </div>

        <CoursesGrid
          isLoading={isLoading}
          sortedCourses={sortedCourses}
          forums={forums}
          showCourses={showCourses}
          setShowCourses={setShowCourses}
          showForums={showForums}
          setShowForums={setShowForums}
          isFavorite={isFavorite}
          toggleFavorite={handleToggleFavorite}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <Card variant="brand" className="courses__promo-card relative overflow-hidden mt-xl">
          <Badge className="absolute right-[var(--space-lg)] top-[var(--space-lg)] bg-[var(--aau-dark-orange)] text-white border-none font-bold shadow-sm">
            {t('enrollment_open')}
          </Badge>
          <div className="courses__promo-bg absolute right-0 top-0 bottom-0 w-[40%] opacity-30 pointer-events-none bg-cover bg-center [mask-image:linear-gradient(to_left,black,transparent)] [-webkit-mask-image:linear-gradient(to_left,black,transparent)]" style={{ backgroundImage: `url('${ASSETS.promo.student}')` }} />
          <Card.Body className="courses__promo-body p-lg">
            <Stack className="courses__promo-content relative z-[1] max-w-[var(--container-max-width)]">
              <Stack direction="row" gap="sm" align="center" className="courses__promo-badge-tag mb-[var(--space-sm)]">
                <Badge className="inline-flex items-center gap-1.5 bg-[var(--aau-dark-orange)] text-white border-none font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-[var(--radius-pill)] bg-white animate-pulse" />
                  {t('enrollment_deadline_approaching')}
                </Badge>
              </Stack>
              <Heading level={2} className="courses__promo-title mb-[var(--space-md)] text-xl sm:text-2xl font-black text-white mt-xs">
                {t('ready_for_next_semester')}
              </Heading>
              <Text className="courses__promo-text text-white/90 text-sm leading-relaxed block font-medium max-w-xl">
                {t('upcoming_modules_stads_desc')}
              </Text>
              <div className="courses__promo-action mt-md">
                <Button
                  onClick={() => env.open('https://kursuskatalog.aau.dk')}
                  className="bg-white text-primary hover:bg-white/90 hover:-translate-y-1 border-none font-bold px-md h-10 text-xs rounded-[var(--radius-md)] shadow-sm"
                >
                  {t('course_catalog')}
                </Button>
              </div>
            </Stack>
          </Card.Body>
        </Card>
      </div>
    </PageLayout>
  )
}

export default memo(Courses)

