import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, MessageSquare, Users } from 'lucide-react'
import { Grid, Stack } from '@/components/Layout'
import { Card, Button, Icon, Heading, Text, TeaserCard, SearchInput, MasterItem, Select } from '@/components/ui'
import { PATHS } from '@/routes'
import useStore, { type CourseWithStatus } from '@/store'
import { courses as coursesDataMap } from '@/lib/data'
import { useFilteredCollection } from '@/hooks'
import { getFileTypeConfig } from '@/lib/utils'

// ==========================================
// CourseInfo
// ==========================================

export const CourseInfo = memo(function CourseInfo() {
  const t = useStore((state) => state.t)

  return (
    <div className="animate-fade-in">
      <Card variant="elevated">
        <Card.Header>
          <Heading level={3}>{t('course_information')}</Heading>
        </Card.Header>
        <Card.Body>
          <Stack gap="lg">
            <Stack gap="xs">
              <Text weight="bold">{t('description')}</Text>
              <Text muted>{t('course_description_placeholder')}</Text>
            </Stack>
            <Stack gap="xs">
              <Text weight="bold">{t('learning_goals')}</Text>
              <ul className="list-disc pl-[var(--space-lg)] text-muted space-y-3xs">
                <li>{t('goal_understand_principles')}</li>
                <li>{t('goal_apply_methods')}</li>
              </ul>
            </Stack>
          </Stack>
        </Card.Body>
      </Card>
    </div>
  )
})

// ==========================================
// CourseParticipants
// ==========================================

interface CourseParticipantsProps {
  participantsData: { name: string; role: string; email?: string }[]
}

export const CourseParticipants = memo(function CourseParticipants({ participantsData }: CourseParticipantsProps) {
  const t = useStore((state) => state.t)
  const { searchQuery, setSearchQuery, activeFilter: roleFilter, setActiveFilter: setRoleFilter, items: filteredParticipants } = useFilteredCollection(participantsData, {
    searchKeys: p => [p.name],
    filterKey: p => p.role,
    filterDefault: 'all',
  })

  return (
    <div className="animate-fade-in">
      <Card variant="elevated">
        <Card.Header className="flex-col items-start gap-md">
          <Heading level={3}>{t('participants')}</Heading>
          <div className="flex flex-col sm:flex-row gap-sm w-full">
            <SearchInput
              placeholder={t('search_participants_placeholder')}
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />
            <label htmlFor="participant-role-filter" className="sr-only">{t('filter')}</label>
            <Select
              id="participant-role-filter"
              value={roleFilter ?? 'all'}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="sm:w-[150px]"
            >
              <option value="all">{t('all_roles')}</option>
              <option value="student">{t('role_student')}</option>
              <option value="teacher">{t('role_teacher')}</option>
            </Select>
          </div>
        </Card.Header>
        <Card.Body className="p-[var(--space-0)]">
          <Stack gap="none">
            {filteredParticipants.map((p, i) => (
              <MasterItem
                key={i}
                leading={Users}
                title={p.name}
                subtitle={
                  <span className="flex flex-col sm:flex-row sm:items-center sm:gap-xs text-xs text-muted">
                    <span className="font-semibold text-foreground/70">
                      {p.role === 'student' ? t('role_student') : t('role_teacher')}
                    </span>
                    {p.email && (
                      <>
                        <span className="hidden sm:inline">·</span>
                        <a href={`mailto:${p.email}`} className="hover:underline text-primary break-all">
                          {p.email}
                        </a>
                      </>
                    )}
                  </span>
                }
                className="border-b border-border/50 last:border-0"
              />
            ))}
          </Stack>
        </Card.Body>
      </Card>
    </div>
  )
})

// ==========================================
// CourseResources
// ==========================================

export const CourseResources = memo(function CourseResources() {
  const t = useStore((state) => state.t)

  const pdfConfig = getFileTypeConfig('pdf')
  const PdfIcon = pdfConfig.icon

  const fileConfig = getFileTypeConfig('file')
  const FileIcon = fileConfig.icon

  const linkConfig = getFileTypeConfig('link')
  const LinkIcon = linkConfig.icon

  return (
    <div className="animate-fade-in">
      <Card variant="elevated">
        <Card.Header>
          <Heading level={3}>{t('tab_resources')}</Heading>
        </Card.Header>
        <Card.Body>
          <Stack gap="md">
            <MasterItem
              leading={PdfIcon}
              leadingClassName={pdfConfig.colorClass}
              title={t('syllabus')}
              subtitle="PDF, 2.4 MB"
              onClick={(e) => e.preventDefault()}
            />
            <MasterItem
              leading={FileIcon}
              leadingClassName={fileConfig.colorClass}
              title={t('reading_list')}
              subtitle="Excel, 150 KB"
              onClick={(e) => e.preventDefault()}
            />
            <MasterItem
              leading={LinkIcon}
              leadingClassName={linkConfig.colorClass}
              title={t('exam_schedule')}
              subtitle="Link"
              onClick={(e) => e.preventDefault()}
            />
          </Stack>
        </Card.Body>
      </Card>
    </div>
  )
})

// ==========================================
// CoursesGrid
// ==========================================

interface CoursesGridProps {
  isLoading?: boolean
  sortedCourses: CourseWithStatus[]
  forums: { id: number; title: string; titleEn: string; label: string; labelEn: string; img: string; color: string }[]
  showCourses: boolean
  setShowCourses: (val: boolean) => void
  showForums: boolean
  setShowForums: (val: boolean) => void
  isFavorite: (type: 'course' | 'forum', id: number) => boolean
  toggleFavorite: (type: 'course' | 'forum', id: number) => void
  searchQuery: string
  setSearchQuery: (val: string) => void
}

export const CoursesGrid = memo(function CoursesGrid({
  isLoading = false,
  sortedCourses,
  forums,
  showCourses,
  setShowCourses,
  showForums,
  setShowForums,
  isFavorite,
  toggleFavorite,
  searchQuery,
  setSearchQuery,
}: CoursesGridProps) {
  const navigate = useNavigate()
  const t = useStore((state) => state.t)
  const getCourseProgress = useStore((state) => state.getCourseProgress)

  return (
    <>
      <Stack
        tag="button"
        type="button"
        className="section-block-header mt-[var(--space-xl)] w-full text-left border-none bg-transparent p-0 cursor-pointer focus-visible:outline-none focus-visible:shadow-focus rounded-[var(--radius-md)]"
        direction="row"
        align="center"
        gap="sm"
        onClick={() => setShowCourses(!showCourses)}
        aria-expanded={showCourses}
      >
        <Heading level={2} className="section-block-header__title m-0 text-[1.25rem]">
          {t('your_courses')}
          <Text tag="span" size="sm" muted className="section-block-header__count ml-[var(--space-sm)] font-normal">
            ({sortedCourses.length} {sortedCourses.length === 1 ? t('courses.active_course_singular') : t('courses.active_courses')})
          </Text>
        </Heading>
        <Icon name={showCourses ? 'chevron-down' : 'chevron-right'} className="section-chevron text-[0.9rem] opacity-60 transition-transform duration-[var(--transition-fast)]" />
      </Stack>

      {showCourses && (
        <>
          {isLoading ? (
            <div key="loading">
              <Grid columns={12} gap="lg">
                {[1, 2, 3].map((id) => (
                  <Grid.Item span={4} key={`skeleton-course-${id}`}>
                    <TeaserCard variant="vertical" isLoading={true} hasAction={true} />
                  </Grid.Item>
                ))}
              </Grid>
            </div>
          ) : sortedCourses.length > 0 ? (
            <div key="courses-grid">
              <Grid columns={12} gap="lg">
                {sortedCourses.map((course) => {
                  const courseBadge = t(`course_${course.id}_label`) || t('active')
                  const courseDetails = coursesDataMap[course.id]
                  const totalItems = courseDetails?.sections?.reduce((acc, sec) => acc + (sec.items?.length || 0), 0) || 0
                  const progress = course.status === 'active' && totalItems > 0 ? getCourseProgress(course.id, totalItems) : undefined
                  return (
                    <Grid.Item span={4} key={course.id}>
                      <TeaserCard
                        variant="vertical"
                        badge={courseBadge}
                        badgeColor={course.status === 'active' ? 'success' : (course.status === 'inactive' ? 'danger' : 'warning')}
                        title={t(`course_${course.id}_title`)}
                        description={`${t(`course_${course.id}_label`)} · ${course.code || ''} ${courseDetails?.professor ? `· ${courseDetails.professor}` : ''}`}
                        progress={progress}
                        isStarred={isFavorite('course', course.id)}
                        onStarToggle={() => {
                          toggleFavorite('course', course.id)
                        }}
                        onClick={() => navigate(PATHS.COURSE(course.id))}
                        action={
                          <Button 
                            variant="primary" 
                            size="md" 
                            iconRight={ArrowRight} 
                            pill
                            className="normal-case tracking-normal"
                          >
                            {t('open_module')}
                          </Button>
                        }
                      />
                    </Grid.Item>
                  )
                })}
              </Grid>
            </div>
          ) : (
            <div key="courses-empty">
              <Card className="bg-bg-card border-dashed py-[var(--space-3xl)]">
                <Stack align="center" justify="center" gap="md">
                  <Icon name="magnifying-glass" className="text-muted opacity-20" size="3xl" />
                  <Text muted>{t('no_search_results')}</Text>
                  {searchQuery && (
                    <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                      {t('clear_search')}
                    </Button>
                  )}
                </Stack>
              </Card>
            </div>
          )}
        </>
      )}

      <Stack
        direction="row"
        align="center"
        gap="sm"
        className="mt-[var(--space-2xl)]"
      >
        <Stack
          tag="button"
          type="button"
          className="section-block-header section-block-header--forums text-left border-none bg-transparent p-0 cursor-pointer focus-visible:outline-none focus-visible:shadow-focus rounded-[var(--radius-md)]"
          direction="row"
          align="center"
          gap="sm"
          onClick={() => setShowForums(!showForums)}
          aria-expanded={showForums}
        >
          <Heading level={2} className="section-block-header__title m-0 text-[1.25rem]">
            {t('your_forums')}
          </Heading>
          <Icon name={showForums ? 'chevron-down' : 'chevron-right'} className="section-chevron text-[0.9rem] opacity-60 transition-transform duration-[var(--transition-fast)]" />
        </Stack>
        <Button variant="ghost" size="sm" iconRight={ChevronRight} className="text-sm font-extrabold normal-case tracking-normal h-[44px] min-h-[44px]" onClick={() => navigate(PATHS.COURSES)}>{t('view_all')}</Button>
      </Stack>

      {showForums && (
        <>
          {isLoading ? (
            <div key="forums-loading">
              <Grid columns={12} gap="lg" className="courses__forums-grid mb-2xl">
                {[1, 2].map((id) => (
                  <Grid.Item span={6} key={`skeleton-forum-${id}`}>
                    <TeaserCard variant="horizontal" isLoading={true} hasAction={true} />
                  </Grid.Item>
                ))}
              </Grid>
            </div>
          ) : (
            <div key="forums-grid">
              <Grid columns={12} gap="lg" className="courses__forums-grid mb-2xl">
                {forums.map((forum) => (
                  <Grid.Item span={6} key={forum.id}>
                    <TeaserCard
                      variant="horizontal"
                      image={forum.img}
                      badge={t(`forum_${forum.id}_label`)}
                      badgeColor="default"
                      title={t(`forum_${forum.id}_title`)}
                      description={t('shared_forum_description')}
                      isStarred={isFavorite('forum', forum.id)}
                      onStarToggle={() => {
                        toggleFavorite('forum', forum.id)
                      }}
                      onClick={() => navigate(PATHS.COURSE(forum.id))}
                      action={
                        <Button variant="secondary" size="sm" iconRight={MessageSquare} className="normal-case tracking-normal">
                          {t('open_forum')}
                        </Button>
                      }
                    />
                  </Grid.Item>
                ))}
              </Grid>
            </div>
          )}
        </>
      )}
    </>
  )
})
