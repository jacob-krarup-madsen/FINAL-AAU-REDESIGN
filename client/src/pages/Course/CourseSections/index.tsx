import { useState, memo, useCallback } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { Book, BookOpen, Target, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Stack } from '@/components/Layout';
import { Card, Heading, Text, MasterItem, Button } from '@/components/ui';
import { PATHS } from '@/routes';
import { cn, ITEM_TYPE_MAP } from '@/lib/utils';
import useStore from '@/store';
import { getCourseItemMetadata } from '@/lib/utils';
import type { CourseSection, CourseItem } from '@/lib/types';

// 1. CourseModulesAnchorNav Component
interface CourseModulesAnchorNavProps {
  courseId: string
  sections: CourseSection[]
}

function CourseModulesAnchorNav({
  courseId,
  sections,
}: CourseModulesAnchorNavProps) {
  const t = useStore((state) => state.t)
  
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`section-card-${sectionId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="sticky top-[73px] bg-bg-card/95 backdrop-blur-md z-20 py-sm px-md -mx-md sm:mx-0 rounded-xl border border-border/60 shadow-sm flex items-center gap-xs overflow-x-auto no-scrollbar mb-md">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => scrollToSection(section.id)}
          className="px-sm py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-bg-highlight/40 hover:bg-bg-highlight/85 text-text-secondary border border-border/40 hover:border-primary/50 transition-all duration-150"
        >
          {t(`course_${courseId}_${section.id}_title`)}
        </button>
      ))}
    </div>
  )
}

// 2. LiteratureItemRow Component
interface LiteratureItemRowProps {
  item: CourseItem;
  isCompleted: boolean;
  lang: string;
  toggleItem: (id: number) => void;
  t: (key: string) => string;
}

const LiteratureItemRow = memo(function LiteratureItemRow({
  item,
  isCompleted,
  lang,
  toggleItem,
  t,
}: LiteratureItemRowProps) {
  const l = (da: string, en: string) => lang === 'da' ? da : en
  const themeConfig = ITEM_TYPE_MAP[item.type] || ITEM_TYPE_MAP.default;
  const Icon = themeConfig.icon;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-sm rounded-xl border transition-all duration-150 relative group",
        isCompleted
          ? "bg-success/5 border-success/30 dark:border-success/20 hover:bg-success/10"
          : "bg-bg-card border-border hover:bg-bg-hover hover:border-primary/45"
      )}
    >
      <div className="flex items-center gap-sm min-w-0 flex-1">
        <div className={cn(
          "p-xs rounded-lg shrink-0",
          isCompleted ? "bg-success/15 text-success" : "bg-primary/5 text-primary"
        )}>
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <Text size="xs" weight="bold" className="block truncate leading-tight text-main">
            {l(item.title, item.titleEn)}
          </Text>
          <Text size="3xs" muted className="block leading-none mt-3xs">
            {item.size || (item.type === 'link' ? 'Link' : 'Resource')}
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-xs shrink-0">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider hidden xs:inline-block",
          isCompleted ? "text-success" : "text-text-secondary opacity-60"
        )}>
          {isCompleted
            ? l('Fuldført', 'Completed')
            : l('Ikke fuldført', 'Not completed')}
        </span>
        <Button
          variant={isCompleted ? 'primary' : 'ghost'}
          size="icon"
          className="lesson-item__checkbox w-7 h-7 shrink-0 border-border hover:border-primary/50 dark:border-white/20"
          onClick={() => toggleItem(item.id)}
          aria-label={isCompleted ? t('mark_incomplete') : t('mark_complete')}
          type="button"
        >
          {isCompleted ? (
            <Check size={16} strokeWidth={2.5} aria-hidden="true" />
          ) : (
            <Check
              size={16}
              strokeWidth={2.5}
              aria-hidden="true"
              className="opacity-0 group-hover:opacity-30 transition-opacity"
            />
          )}
        </Button>
      </div>
    </div>
  );
});

// 3. LessonItemRow Component
interface LessonItemRowProps {
  item: CourseItem
  courseId: string
  sectionId: string
  completed: boolean
  onToggleItem: (id: number) => void
  navigate: NavigateFunction
}

const LessonItemRow = memo(function LessonItemRow({
  item,
  courseId,
  sectionId,
  completed,
  onToggleItem,
  navigate,
}: LessonItemRowProps) {
  const t = useStore((state) => state.t)

  const handleClick = item.type === 'assignment'
    ? () => navigate(PATHS.SUBMISSION(courseId, item.id))
    : () => {}

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleItem(item.id)
  }, [item.id, onToggleItem])

  const lang = useStore(state => state.lang)
  const metadata = getCourseItemMetadata(item, lang)

  const isAutomatic = item.type === 'assignment'
  const themeConfig = ITEM_TYPE_MAP[item.type] || ITEM_TYPE_MAP.default
  const Icon = themeConfig.icon

  return (
    <MasterItem
      className="rounded-[var(--radius-md)] border-none bg-bg-highlight/20 hover:bg-bg-highlight/40"
      leading={Icon}
      leadingClassName={cn(themeConfig.bg, `text-${themeConfig.color}`)}
      title={
        <span className="font-bold text-sm leading-tight">
          {t(`course_${courseId}_${sectionId}_i${item.id}_title`)}
        </span>
      }
      subtitle={metadata}
      onClick={handleClick}
      trailing={
        <div className="flex items-center gap-xs shrink-0">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider hidden xs:inline-block",
            completed ? "text-success" : "text-text-secondary opacity-60"
          )}>
            {completed 
              ? t('course.completed') 
              : t('course.incomplete')}
          </span>
          <Button
            variant={completed ? 'primary' : 'ghost'}
            size="icon"
            className={`lesson-item__checkbox w-7 h-7 shrink-0 ${completed ? '' : isAutomatic ? 'border-dashed opacity-30 cursor-default border-border' : 'border-border hover:border-primary/50 dark:border-white/20'}`}
            onClick={handleToggle}
            aria-label={completed ? t('mark_incomplete') : t('mark_complete')}
            type="button"
            disabled={isAutomatic}
          >
            {completed ? (
              <Check size={16} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              !isAutomatic && (
                <Check
                  size={16}
                  strokeWidth={2.5}
                  aria-hidden="true"
                  className="opacity-0 group-hover/check:opacity-30 transition-opacity"
                />
              )
            )}
          </Button>
        </div>
      }
    />
  )
})

// 4. CourseSectionCard Component
interface CourseSectionCardProps {
  section: CourseSection
  courseId: string
  completedItems: number[]
  isExpanded: boolean
  toggleSection: (id: string) => void
  toggleItem: (id: number) => void
  lang: string
  t: (key: string) => string
  navigate: any
}

function CourseSectionCard({
  section,
  courseId,
  completedItems,
  isExpanded,
  toggleSection,
  toggleItem,
  lang,
  t,
  navigate,
}: CourseSectionCardProps) {
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en
  const [themesOpen, setThemesOpen] = useState(false)
  const [goalsOpen, setGoalsOpen] = useState(false)
  const [materialsOpen, setMaterialsOpen] = useState(true)

  const totalItems = section.items.length
  const completedSectionItems = section.items.filter(item => completedItems.includes(item.id)).length
  const sectionProgress = totalItems > 0 ? Math.round((completedSectionItems / totalItems) * 100) : 0

  const statusDotClass = sectionProgress === 100
    ? 'active bg-success shadow-[0_0_6px_rgba(var(--color-success-rgb),0.3)]'
    : sectionProgress > 0
      ? 'pending bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.3)]'
      : 'pending bg-[var(--color-border)] dark:bg-white/20';

  const statusTitle = sectionProgress === 100
    ? l('Gennemført', 'Completed')
    : sectionProgress > 0
      ? l('I gang', 'In Progress')
      : l('Ikke startet', 'Not Started');

  const primaryLitItems = section.items.filter(item => item.litType === 'primary')
  const secondaryLitItems = section.items.filter(item => item.litType === 'secondary')
  const otherActivities = section.items.filter(item => !item.litType)

  return (
    <Card id={`section-card-${section.id}`} variant="elevated" className="course-section mb-md overflow-hidden shadow-[var(--shadow-md)]">
      <Card.Header className="section-header p-0 bg-bg-card overflow-hidden relative">
        <button
          type="button"
          data-section-id={section.id}
          className="w-full text-left p-sm px-md flex items-start justify-between transition-colors duration-150 hover:bg-bg-hover focus-visible:outline-none focus-visible:shadow-focus border-none bg-transparent"
          onClick={() => toggleSection(section.id)}
          aria-expanded={isExpanded}
        >
          <Stack direction="row" align="start" gap="sm" className="flex-1 min-w-0 text-left">
            <div className={`status-dot w-2 h-2 rounded-[var(--radius-pill)] shrink-0 mt-1.5 ${statusDotClass}`} title={statusTitle} />
            <Stack gap="2xs" className="flex-1 min-w-0">
              <Heading level={4} as="h2" className="m-0 text-left leading-snug">{t(`course_${courseId}_${section.id}_title`)}</Heading>
              <div className="flex items-center gap-xs text-[10px] text-muted flex-wrap">
                {section.date && (
                  <>
                    <span className="font-bold text-primary dark:text-[var(--aau-light-blue-sec)]">
                      {l(section.date, section.dateEn || section.date)}
                    </span>
                    <span>·</span>
                  </>
                )}
                <span className="font-bold">{statusTitle}</span>
                <span>·</span>
                <span>{completedSectionItems} / {totalItems} {l('gennemført', 'completed')} ({sectionProgress}%)</span>
              </div>
            </Stack>
          </Stack>
          <div className="flex items-center gap-xs shrink-0 self-center">
            <span className="text-xs font-bold text-muted-foreground mr-xs">{sectionProgress}%</span>
            {isExpanded ? (
              <ChevronUp size={20} strokeWidth={2.5} className="text-muted transition-transform duration-150 shrink-0" />
            ) : (
              <ChevronDown size={20} strokeWidth={2.5} className="text-muted transition-transform duration-150 shrink-0" />
            )}
          </div>
        </button>
        
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-border/20 overflow-hidden">
          <div
            className="h-full bg-success transition-all duration-300"
            style={{ width: `${sectionProgress}%` }}
          />
        </div>
      </Card.Header>
      
      {isExpanded && (
        <Card.Body padding="compact" className="section-content">
          <Stack gap="md">
            {(section.description || section.descriptionEn) && (
              <div className="section-description bg-bg-highlight/40 dark:bg-white/5 p-sm rounded-lg border border-[var(--border-color)]/25 text-xs text-text-muted leading-relaxed text-left">
                <div className="font-bold text-main mb-2xs">
                  {l('Forberedelse til denne kursusgang:', 'Preparation for this session:')}
                </div>
                <p className="m-0">{l(section.description, section.descriptionEn || section.description)}</p>
              </div>
            )}

            {((section.themes && section.themes.length > 0) || (section.goals && section.goals.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                {section.themes && section.themes.length > 0 && (
                  <div className="rounded-xl overflow-hidden bg-bg-highlight/30 dark:bg-white/5 border-none shadow-none">
                    <button
                      type="button"
                      onClick={() => setThemesOpen(!themesOpen)}
                      className="w-full flex items-center justify-between p-sm text-left hover:bg-bg-hover transition-colors font-bold text-main text-sm border-none bg-transparent"
                    >
                      <div className="flex items-center gap-xs">
                        <BookOpen size={14} className="text-primary shrink-0" />
                        <span>{t('themes_content')}</span>
                      </div>
                      {themesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {themesOpen && (
                      <div className="p-sm pt-none border-t border-border/40 text-left">
                        <ul className="list-disc pl-4 text-xs text-text-muted space-y-1 mt-xs">
                          {(l(section.themes, section.themesEn || section.themes) || []).map((theme, i) => (
                            <li key={i}>{theme}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {section.goals && section.goals.length > 0 && (
                  <div className="rounded-xl overflow-hidden bg-bg-highlight/30 dark:bg-white/5 border-none shadow-none">
                    <button
                      type="button"
                      onClick={() => setGoalsOpen(!goalsOpen)}
                      className="w-full flex items-center justify-between p-sm text-left hover:bg-bg-hover transition-colors font-bold text-main text-sm border-none bg-transparent"
                    >
                      <div className="flex items-center gap-xs">
                        <Target size={14} className="text-primary shrink-0" />
                        <span>{t('session_goals')}</span>
                      </div>
                      {goalsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {goalsOpen && (
                      <div className="p-sm pt-none border-t border-border/40 text-left">
                        <ul className="list-disc pl-4 text-xs text-text-muted space-y-1 mt-xs">
                          {(l(section.goals, section.goalsEn || section.goals) || []).map((goal, i) => (
                            <li key={i}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl overflow-hidden bg-bg-highlight/30 dark:bg-white/5 border-none shadow-none">
              <button
                type="button"
                onClick={() => setMaterialsOpen(!materialsOpen)}
                className="w-full flex items-center justify-between p-sm text-left hover:bg-bg-hover transition-colors font-bold text-main text-sm border-none bg-transparent"
              >
                <div className="flex items-center gap-xs">
                  <Book size={14} className="text-primary shrink-0" />
                  <span>{l('Materialer', 'Materials')}</span>
                </div>
                {materialsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {materialsOpen && (
                <div className="p-sm border-t border-border/40 text-left flex flex-col gap-md">
                  {primaryLitItems.length > 0 && (
                    <div className="flex flex-col gap-2xs">
                      <Text size="2xs" weight="bold" muted className="uppercase tracking-wider font-bold">
                        {t('primary_literature')}
                      </Text>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-xs">
                        {primaryLitItems.map((item) => (
                          <LiteratureItemRow
                            key={item.id}
                            item={item}
                            isCompleted={completedItems.includes(item.id)}
                            lang={lang}
                            toggleItem={toggleItem}
                            t={t}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {secondaryLitItems.length > 0 && (
                    <div className="flex flex-col gap-2xs">
                      <Text size="2xs" weight="bold" muted className="uppercase tracking-wider font-bold">
                        {t('secondary_literature')}
                      </Text>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-xs">
                        {secondaryLitItems.map((item) => (
                          <LiteratureItemRow
                            key={item.id}
                            item={item}
                            isCompleted={completedItems.includes(item.id)}
                            lang={lang}
                            toggleItem={toggleItem}
                            t={t}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {otherActivities.length > 0 && (
                    <div className="flex flex-col gap-2xs">
                      <Text size="2xs" weight="bold" muted className="uppercase tracking-wider font-bold">
                        {t('other_activities')}
                      </Text>
                      <Stack gap="2xs">
                        {otherActivities.map((item) => (
                          <LessonItemRow
                            key={item.id}
                            item={item}
                            courseId={courseId}
                            sectionId={section.id}
                            completed={completedItems.includes(item.id)}
                            onToggleItem={toggleItem}
                            navigate={navigate}
                          />
                        ))}
                      </Stack>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Stack>
        </Card.Body>
      )}
    </Card>
  )
}

// 5. CourseModules Component
interface CourseModulesProps {
  courseId: string
  progress: number
  completedItems: number[]
  expandedSections: string[]
  sections: CourseSection[]
  toggleItem: (itemId: number) => void
  toggleSection: (sectionId: string) => void
  navigate: NavigateFunction
}

export function CourseModules({
  courseId,
  progress: _progress,
  completedItems,
  expandedSections,
  sections,
  toggleItem,
  toggleSection,
  navigate,
}: CourseModulesProps) {
  const t = useStore((state) => state.t)
  const lang = useStore((state) => state.lang)

  return (
    <Stack gap="lg">
      <CourseModulesAnchorNav courseId={courseId} sections={sections} />
      {sections.map((section) => (
        <CourseSectionCard
          key={section.id}
          section={section}
          courseId={courseId}
          completedItems={completedItems}
          isExpanded={expandedSections.includes(section.id)}
          toggleSection={toggleSection}
          toggleItem={toggleItem}
          lang={lang}
          t={t}
          navigate={navigate}
        />
      ))}
    </Stack>
  )
}
