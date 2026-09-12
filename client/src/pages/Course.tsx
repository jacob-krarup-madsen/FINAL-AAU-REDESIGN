import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PageLayout, SplitLayout, Stack } from '@/components/Layout';
import { PATHS } from '@/routes';
import {
  Card, Text, ProgressBar,
  Avatar, Button, ModuleHeader, Tabs
} from '@/components/ui';
import { courses, participantsData, courseTabItems } from '@/lib/data';
import { storage, cn, ITEM_TYPE_MAP } from '@/lib/utils';
import { STORAGE_KEYS, ASSETS } from '@/lib/constants';
import useStore from '@/store';
import { ForumWidget } from '@/components/Widgets';
import { CourseModules } from './Course/CourseSections';
import { CourseInfo, CourseParticipants, CourseResources } from '@/components/Courses';

function Course() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const t = useStore((state) => state.t)
  const lang = useStore((state) => state.lang)
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en
  const [activeTab, setActiveTab] = useState<string>('modules')
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const course = courses[Number(id)]
    if (!course) return []
    return storage.get(`${STORAGE_KEYS.EXPANDED_SECTIONS_PREFIX}${id}`, course.sections.map((s) => s.id))
  })
  const [completedItems, setCompletedItems] = useState<number[]>(() => {
    return storage.get(`${STORAGE_KEYS.COURSE_PROGRESS_PREFIX}${id}`, [])
  })
  const [descExpanded, setDescExpanded] = useState(false)

  const courseIdNum = Number(id)
  const data = courses[courseIdNum]

  useEffect(() => {
    if (!data) navigate(PATHS.COURSES)
  }, [id, data, navigate])

  useEffect(() => {
    storage.set(`${STORAGE_KEYS.EXPANDED_SECTIONS_PREFIX}${id}`, expandedSections)
  }, [expandedSections, id])

  useEffect(() => {
    storage.set(`${STORAGE_KEYS.COURSE_PROGRESS_PREFIX}${id}`, completedItems)
  }, [completedItems, id])

  const toggleItem = useCallback((itemId: number): void => {
    setCompletedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((i) => i !== itemId)
      }
      return [...prev, itemId]
    })
  }, [])

  const toggleSection = useCallback((sectionId: string): void => {
    setExpandedSections((prev) => {
      if (prev.includes(sectionId)) {
        return prev.filter((s) => s !== sectionId)
      }
      return [...prev, sectionId]
    })
  }, [])

  const totalItems = useMemo(
    () => data?.sections.reduce((acc, section) => acc + section.items.length, 0) || 0,
    [data]
  )
  const progress = totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : 0

  const nextSession = useMemo(() => {
    if (!data) return null
    for (const section of data.sections) {
      const completedSectionItems = section.items.filter(item => completedItems.includes(item.id)).length
      if (completedSectionItems < section.items.length) {
        return section
      }
    }
    return data.sections[0] || null
  }, [data, completedItems])

  const tabItems = useMemo(
    () => courseTabItems.map((ti) => ({ ...ti, label: t(ti.label) })),
    [t]
  )

  const getProgressMessage = (pct: number) => {
    if (pct === 0) return t('progress_0')
    if (pct < 50) return t('progress_25')
    if (pct < 75) return t('progress_50')
    if (pct < 100) return t('progress_75')
    return t('progress_100')
  }

  if (!data) return null

  const courseDesc = t(`course_${id}_desc`)

  return (
    <PageLayout
      className="container animate-fade-in"
      pageKey={`course_${id}`}
      headerClassName="hidden"
      flat
    >
      <ModuleHeader
        image={data.img}
        code={data.code}
        title={t(`course_${id}_title`)}
        semester={t('course_semester_spring')}
        professor={data.professor}
        campus={t('course_campus_aalborg')}
      />

      <div className="mt-md">
        <Card variant="elevated" className="overflow-hidden">
          <Card.Body padding="compact">
            <Stack gap="xs">
              <Text weight="bold" size="sm" className="text-muted text-uppercase tracking-wider">
                {t('description')}
              </Text>
              <div 
                className={cn(
                  "text-sm text-foreground/80 transition-all duration-300 relative",
                  !descExpanded && "line-clamp-2"
                )}
                style={{
                  display: !descExpanded ? '-webkit-box' : 'block',
                  WebkitLineClamp: !descExpanded ? 2 : undefined,
                  WebkitBoxOrient: !descExpanded ? 'vertical' : undefined,
                  overflow: 'hidden'
                }}
              >
                {courseDesc}
              </div>
              <div className="flex justify-start">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-0 py-none h-fit hover:bg-transparent text-primary font-bold hover:text-primary-dark"
                  onClick={() => setDescExpanded(!descExpanded)}
                >
                  {descExpanded ? 'Vis mindre' : 'Vis mere'}
                </Button>
              </div>
            </Stack>
          </Card.Body>
        </Card>
      </div>
      <div className="mt-xl">
        <SplitLayout
          fullHeight={false}
          main={
            <Stack gap="lg">
              <Tabs
                items={tabItems}
                activeTab={activeTab}
                onChange={(val) => setActiveTab(val || 'modules')}
              />
              <div className="min-h-[300px]">
                <div>
                  {activeTab === 'modules' && (
                    <CourseModules
                      courseId={id!}
                      progress={progress}
                      completedItems={completedItems}
                      expandedSections={expandedSections}
                      sections={data.sections}
                      toggleItem={toggleItem}
                      toggleSection={toggleSection}
                      navigate={navigate}
                    />
                  )}

                  {activeTab === 'forum' && (
                    <ForumWidget professor={data.professor} />
                  )}

                  {activeTab === 'info' && (
                    <CourseInfo />
                  )}

                  {activeTab === 'participants' && (
                    <CourseParticipants participantsData={participantsData} />
                  )}
                </div>
              </div>
            </Stack>
          }
          sidebar={
            <aside className="flex flex-col gap-lg">
              {/* Compact "Dit fremskridt" widget in the sidebar */}
              <Card variant="elevated" accent="left" className="h-fit">
                <Card.Header padding="compact" className="pb-none">
                  <Stack gap="2xs" className="flex-1 min-w-0">
                    <Text weight="bold" size="sm" className="card__title">{t('your_progress')}</Text>
                    <Text size="2xs" muted>{getProgressMessage(progress)}</Text>
                  </Stack>
                  <div className="progress-stat text-right shrink-0">
                    <Text size="md" weight="bold" className="progress-value text-[var(--color-primary)] block leading-[1]">
                      {progress}%
                    </Text>
                  </div>
                </Card.Header>
                <Card.Body padding="compact" className="pt-2xs">
                  <Stack gap="xs">
                    <ProgressBar value={progress} />
                    <div className="flex justify-between items-center text-xs text-muted">
                      <span>{t('completed_short')}:</span>
                      <span className="font-bold text-foreground">
                        {completedItems.length} / {totalItems}
                      </span>
                    </div>
                  </Stack>
                </Card.Body>
              </Card>

              {/* Til næste lektion checklist widget in the sidebar */}
              {nextSession && (
                <Card variant="elevated" className="h-fit border border-primary/20 bg-bg-highlight/5">
                  <Card.Header padding="compact" className="pb-none">
                    <Stack gap="2xs" className="flex-1 min-w-0">
                      <Text weight="bold" size="sm" className="card__title text-primary">
                        {l('Til næste lektion', 'For Next Session')}
                      </Text>
                      <Text size="2xs" muted className="truncate block">
                        {t(`course_${id}_${nextSession.id}_title`)}
                      </Text>
                    </Stack>
                  </Card.Header>
                  <Card.Body padding="compact" className="pt-xs">
                    <Stack gap="xs">
                      {nextSession.items.map((item) => {
                        const isCompleted = completedItems.includes(item.id)
                        const themeConfig = ITEM_TYPE_MAP[item.type] || ITEM_TYPE_MAP.default
                        const Icon = themeConfig.icon
                        
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => toggleItem(item.id)}
                            className={cn(
                              "flex items-center gap-xs p-xs rounded-lg border text-left cursor-pointer transition-all duration-150 group",
                              isCompleted 
                                ? "bg-success/5 border-success/15 hover:bg-success/10" 
                                : "bg-bg-card border-border hover:bg-bg-hover hover:border-primary/30"
                            )}
                          >
                            <button
                              type="button"
                              className={cn(
                                "w-4.5 h-4.5 rounded border flex items-center justify-center transition-colors shrink-0",
                                isCompleted 
                                  ? "bg-success border-success text-white" 
                                  : "border-border bg-transparent group-hover:border-primary/50"
                              )}
                            >
                              {isCompleted && <Check size={10} strokeWidth={3} />}
                            </button>
                            <div className="min-w-0 flex-1 flex items-center gap-2xs">
                              <Icon size={12} className="text-muted shrink-0" />
                              <Text size="2xs" weight="medium" className={cn("truncate block text-main text-left", isCompleted && "line-through opacity-60")}>
                                {l(item.title, item.titleEn)}
                              </Text>
                            </div>
                          </div>
                        )
                      })}
                    </Stack>
                  </Card.Body>
                </Card>
              )}

              {/* Course resources relocated to sidebar */}
              <CourseResources />

              <Card variant="elevated" className="h-fit">
                <Card.Header padding="compact" className="pb-none">
                  <Text weight="bold" size="sm" className="card__title">{t('instructor')}</Text>
                </Card.Header>
                <Card.Body padding="compact" className="pt-xs">
                  <Stack gap="sm">
                    <Stack direction="row" align="center" gap="md">
                      <Avatar
                        src={ASSETS.promo.instructor}
                        name={data.professor}
                        size="md"
                        status="online"
                      />
                      <Stack gap="none" className="min-w-0 flex-1">
                        <Text size="xs" weight="bold" className="truncate block">{data.professor}</Text>
                        <Text size="2xs" muted className="break-all block">{data.email}</Text>
                      </Stack>
                    </Stack>
                    <Button variant="secondary" size="sm" className="w-full mt-2xs">
                      {t('send_message')}
                    </Button>
                  </Stack>
                </Card.Body>
              </Card>
            </aside>
          }
          mainSpan={8}
          sidebarSpan={4}
        />
      </div>
    </PageLayout>
  )
}

export function CourseWrapper() {
  const { id } = useParams<{ id: string }>()
  return <Course key={id} />
}

export { Course, CourseModules }

export default memo(CourseWrapper)
