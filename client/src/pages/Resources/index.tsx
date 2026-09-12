import { useState, useMemo } from 'react';
import { Search, X, Star, ExternalLink, Lock } from 'lucide-react';
import { Input, Text, EmptyState, Button, Card, SectionHeader, Badge, InfoCard } from '@/components/ui';
import { SplitLayout, Grid, PageLayout } from '@/components/Layout';
import useStore from '@/store';
import { allToolsList, cn, env } from '@/lib/utils';
import type { ResourceTool } from '@/lib/types';

interface ResourcesSectionProps {
  title: string
  subtitle: string
  tools: ResourceTool[]
  isStarredOnly?: boolean
  showSsoWarning?: boolean
  className?: string
  onToggleFavorite?: (id: number) => void
}

function ResourcesSection({ title, subtitle, tools, isStarredOnly = false, showSsoWarning = true, className, onToggleFavorite }: ResourcesSectionProps) {
  const t = useStore(state => state.t)
  const lang = useStore(state => state.lang)
  const localize = useStore(state => state.localize)
  const isFavorite = useStore(state => state.isFavorite)
  const toggleFavorite = useStore(state => state.toggleFavorite)
  const l = (da: string, en: string) => lang === 'da' ? da : en

  return (
    <>
      <SectionHeader title={title} subtitle={subtitle} />
      {isStarredOnly && (
        <Text size="sm" muted className="mb-md block">
          {l('Stjernemarkér dine yndlingsværktøjer for at fastgøre dem her på din startside.', 'Star your favorite tools to pin them here on your dashboard.')}
        </Text>
      )}
      <Grid columns={12} gap="md" className={className}>
        {tools.map((tool) => {
          const titleText = tool.titleKey ? t(tool.titleKey) : localize(tool, 'title')
          const handleStar = () => onToggleFavorite ? onToggleFavorite(tool.id) : toggleFavorite('tool', tool.id)
          const shortTitle = l(tool.shortTitleDa ?? titleText, tool.shortTitleEn ?? titleText)
          const ctaLabel = l(`Åbn ${shortTitle}`, `Open ${shortTitle}`)
          const ctaAriaLabel = l(`Åbn ${shortTitle} - åbner i nyt vindue`, `Open ${shortTitle} - opens in a new window`)

          return (
            <Grid.Item span={6} key={tool.id} className="resources-grid-item">
              <InfoCard
                icon={tool.icon}
                iconBg={tool.bg}
                iconColor={tool.color}
                iconSize={32}
                title={titleText}
                description={localize(tool, 'desc')}
                elevated
                isStarred={isStarredOnly ? true : isFavorite('tool', tool.id)}
                onStarToggle={handleStar}
                addFavoriteLabel={l(`Føj ${titleText} til favoritter`, `Add ${titleText} to favorites`)}
                removeFavoriteLabel={l(`Fjern ${titleText} fra favoritter`, `Remove ${titleText} from favorites`)}
                helpText={isStarredOnly ? undefined : localize(tool, 'help')}
              >
                <div className="flex flex-wrap gap-xs items-center justify-between mt-sm">
                  <div>
                    {showSsoWarning && !tool.sso && (
                      <Badge variant="default" pill className="gap-2xs px-xs py-0.5 text-xs font-bold h-auto">
                        <Lock size={12} strokeWidth={2.5} />
                        {l('AAU-login', 'AAU login')}
                      </Badge>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); env.open(tool.url) }}
                    aria-label={ctaAriaLabel}
                    className="text-primary font-bold text-sm flex items-center gap-xs px-md py-2 rounded-md transition-all hover:bg-primary/15 hover:-translate-y-0.5 border border-primary/60 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <span>{ctaLabel}</span>
                    <ExternalLink size={16} strokeWidth={2.5} aria-hidden="true" />
                    <span className="sr-only"> ({l('åbner i nyt vindue', 'opens in a new window')})</span>
                  </button>
                </div>
              </InfoCard>
            </Grid.Item>
          )
        })}
      </Grid>
    </>
  )
}

function Resources() {
  const t = useStore(state => state.t)
  const lang = useStore(state => state.lang)
  const favorites = useStore(state => state.favorites)
  const toggleFavorite = useStore(state => state.toggleFavorite)
  const l = (da: string, en: string) => lang === 'da' ? da : en

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'popular' | 'tools' | 'comm' | 'files' | 'eval'>('all')

  const categoriesList = useMemo(() => [
    { id: 'all',     label: l('Alle', 'All') },
    { id: 'popular', label: l('Populære', 'Popular') },
    { id: 'tools',   label: l('Studieadministrative', 'Administrative') },
    { id: 'comm',    label: l('Kommunikation', 'Communication') },
    { id: 'files',   label: l('Filer & dokumenter', 'Files & Documents') },
    { id: 'eval',    label: l('Undervisning & evaluering', 'Teaching & Evaluation') },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [lang])

  const pinnedTools = useMemo(() => {
    const toolFavIds = new Set(favorites.filter(f => f.type === 'tool').map(f => f.entityId))
    return allToolsList.filter(tool => toolFavIds.has(tool.id))
  }, [favorites])

  const popularTools = useMemo(() => allToolsList.filter(tool => tool.popular), [])

  const filteredToolsList = useMemo(() => {
    if (!searchQuery) return allToolsList
    const q = searchQuery.toLowerCase()
    return allToolsList.filter(tool => {
      const name = (tool.titleKey ? t(tool.titleKey) : l(tool.titleDa || '', tool.titleEn || '')).toLowerCase()
      const shortTitle = l(tool.shortTitleDa ?? '', tool.shortTitleEn ?? '')
      const desc = l(tool.descDa, tool.descEn || '').toLowerCase()
      const searchable = [name, shortTitle.toLowerCase(), desc, (tool.category || ''), (tool.keywords || []).join(' ')].join(' ').toLowerCase()
      return searchable.includes(q)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, t, lang])

  const filteredPopularTools = useMemo(() => filteredToolsList.filter(t => t.popular), [filteredToolsList])
  const filteredTools        = useMemo(() => filteredToolsList.filter(t => t.category === 'tools'), [filteredToolsList])
  const essentialsCommunication = useMemo(() => filteredToolsList.filter(t => t.category === 'essentials' && [5, 6, 12].includes(t.id)), [filteredToolsList])
  const essentialsFiles         = useMemo(() => filteredToolsList.filter(t => t.category === 'essentials' && [7, 8, 9].includes(t.id)), [filteredToolsList])
  const essentialsTeaching      = useMemo(() => filteredToolsList.filter(t => t.category === 'essentials' && [10, 11].includes(t.id)), [filteredToolsList])

  const showEmptyState = useMemo(() => {
    if (filteredToolsList.length === 0) return true
    if (activeCategory === 'popular' && filteredPopularTools.length === 0) return true
    if (activeCategory === 'tools'   && filteredTools.length === 0) return true
    if (activeCategory === 'comm'    && essentialsCommunication.length === 0) return true
    if (activeCategory === 'files'   && essentialsFiles.length === 0) return true
    if (activeCategory === 'eval'    && essentialsTeaching.length === 0) return true
    return false
  }, [filteredToolsList, activeCategory, filteredPopularTools, filteredTools, essentialsCommunication, essentialsFiles, essentialsTeaching])

  return (
    <PageLayout
      tag="main"
      className="resources-page container"
      pageKey="toolbox"
      title={t('toolbox')}
      subtitle={t('toolbox_subtitle')}
      breadcrumbs={[{ label: t('dashboard'), href: '/' }, { label: t('toolbox') }]}
      flat
    >
      <div className="pb-xl">
        <SplitLayout
          fullHeight={false}
          mainSpan={8}
          sidebarSpan={4}
          main={
            <div className="flex flex-col gap-xl">
              <div className="flex flex-col gap-0">
                <Text weight="bold" size="lg" className="mb-xs">
                  {l('Find system eller værktøj', 'Find system or tool')}
                </Text>
                <div className="relative mb-2xs">
                  <Input
                    type="text"
                    placeholder={l('Søg efter Moodle, eksamen, mail, STADS...', 'Search for Moodle, exams, mail, STADS...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base rounded-lg"
                  />
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary opacity-85" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label={l('Annuller søgning', 'Cancel search')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md px-1.5 py-1"
                    >
                      <X size={16} strokeWidth={2.5} aria-hidden="true" />
                      <span className="hidden sm:inline">{l('Annuller', 'Cancel')}</span>
                    </button>
                  )}
                </div>
                <Text size="sm" muted className="mb-sm">
                  {l('Søg fx "eksamen", "mail", "software" eller "STADS"', 'Try "exam", "mail", "software" or "STADS"')}
                </Text>

                <div className="flex flex-wrap gap-xs" role="tablist" aria-label={l('Kategorifiltrering', 'Category filtering')}>
                  {categoriesList.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
                        className={cn(
                          "px-md py-2 rounded-full text-xs font-bold transition-all border outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          isActive
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-bg-card text-text-secondary border-border/80 hover:bg-bg-hover hover:text-main"
                        )}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {pinnedTools.length > 0 && !searchQuery && activeCategory === 'all' && (
                <div className="bg-primary/5 dark:bg-primary/10 p-md rounded-2xl border border-primary/10">
                  {pinnedTools.length <= 3 ? (
                    <>
                      <Text weight="bold" size="md" className="mb-sm">
                        {l('Dine fastgjorte værktøjer', 'Your pinned tools')}
                      </Text>
                      <div className="flex flex-wrap gap-sm">
                        {pinnedTools.map(tool => {
                          const shortTitle = l(tool.shortTitleDa ?? tool.titleDa ?? '', tool.shortTitleEn ?? tool.titleEn ?? '')
                          return (
                            <button
                              key={tool.id}
                              type="button"
                              onClick={() => env.open(tool.url)}
                              aria-label={l(`Åbn ${shortTitle}`, `Open ${shortTitle}`)}
                              className="flex items-center gap-sm bg-bg-card border border-border/60 hover:bg-bg-hover hover:border-primary/40 rounded-full px-lg py-2 text-sm font-bold transition-all cursor-pointer shadow-sm text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                              <Star size={14} strokeWidth={2} fill="currentColor" className="text-warning shrink-0" />
                              <span>{shortTitle}</span>
                              <ExternalLink size={14} strokeWidth={2.5} aria-hidden="true" />
                            </button>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <ResourcesSection
                      title={l('Dine fastgjorte værktøjer', 'Your pinned tools')}
                      subtitle={l('Hurtig genvej til dine foretrukne systemer', 'Quick shortcut to your favorite tools')}
                      tools={pinnedTools}
                      isStarredOnly
                      showSsoWarning={false}
                      onToggleFavorite={(id) => toggleFavorite('tool', id)}
                    />
                  )}
                </div>
              )}

              {!searchQuery && activeCategory === 'all' && popularTools.length > 0 && (
                <div className="flex flex-col gap-sm">
                  <Text weight="bold" size="md">{l('Populære systemer', 'Popular systems')}</Text>
                  <div className="flex flex-wrap gap-sm">
                    {popularTools.map(tool => {
                      const shortTitle = l(tool.shortTitleDa ?? tool.titleDa ?? '', tool.shortTitleEn ?? tool.titleEn ?? '')
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => env.open(tool.url)}
                          className="flex items-center gap-xs bg-bg-card border border-border/80 hover:bg-bg-hover hover:border-primary/40 rounded-full px-md py-2 text-sm font-bold transition-all cursor-pointer"
                        >
                          <span>{shortTitle}</span>
                          <ExternalLink size={14} strokeWidth={2.5} aria-hidden="true" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeCategory === 'popular' && filteredPopularTools.length > 0 && (
                <ResourcesSection
                  title={l('Populære systemer', 'Popular systems')}
                  subtitle={l('Mest brugte systemer', 'Most used systems')}
                  tools={filteredPopularTools}
                  onToggleFavorite={(id) => toggleFavorite('tool', id)}
                />
              )}

              {(activeCategory === 'all' || activeCategory === 'tools') && filteredTools.length > 0 && (
                <ResourcesSection
                  title={l('Studieadministrative', 'Administrative')}
                  subtitle={t('administrative_systems_desc')}
                  tools={filteredTools}
                  onToggleFavorite={(id) => toggleFavorite('tool', id)}
                />
              )}

              {(activeCategory === 'all' || activeCategory === 'comm') && essentialsCommunication.length > 0 && (
                <ResourcesSection
                  title={l('Kommunikation', 'Communication')}
                  subtitle={l('Outlook Mail, Microsoft Teams og Zoom', 'Outlook Mail, Microsoft Teams, and Zoom')}
                  tools={essentialsCommunication}
                  onToggleFavorite={(id) => toggleFavorite('tool', id)}
                />
              )}

              {(activeCategory === 'all' || activeCategory === 'files') && essentialsFiles.length > 0 && (
                <ResourcesSection
                  title={l('Filer & dokumenter', 'Files & Documents')}
                  subtitle={l('OneDrive lagring, Word & Office, OneNote', 'OneDrive storage, Word & Office, OneNote')}
                  tools={essentialsFiles}
                  onToggleFavorite={(id) => toggleFavorite('tool', id)}
                />
              )}

              {(activeCategory === 'all' || activeCategory === 'eval') && essentialsTeaching.length > 0 && (
                <ResourcesSection
                  title={l('Undervisning & evaluering', 'Teaching & Evaluation')}
                  subtitle={l('Forms undersøgelser og Panopto video', 'Forms surveys and Panopto video')}
                  tools={essentialsTeaching}
                  onToggleFavorite={(id) => toggleFavorite('tool', id)}
                />
              )}

              {showEmptyState && (
                <EmptyState
                  title={l(
                    `Ingen systemer fundet${searchQuery ? ` for "${searchQuery}"` : ''}`,
                    `No systems found${searchQuery ? ` for "${searchQuery}"` : ''}`
                  )}
                  description={l(
                    'Prøv at søge efter fx "eksamen", "mail", "software" eller "STADS".',
                    'Try searching for "exam", "mail", "software" or "STADS".'
                  )}
                  action={
                    <div className="flex items-center gap-sm">
                      <Button variant="primary" size="sm" onClick={() => setSearchQuery('')} className="normal-case tracking-normal font-bold">
                        {l('Ryd søgning', 'Clear search')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => env.open('https://support.its.aau.dk/')} className="text-primary normal-case tracking-normal font-bold">
                        {l('Kontakt IT-support', 'Contact IT support')}
                      </Button>
                    </div>
                  }
                />
              )}
            </div>
          }
          sidebar={
            <aside className="flex flex-col gap-lg">
              <Card variant="elevated" className="border-primary/20">
                <Card.Header padding="compact" className="flex items-center gap-xs">
                  <Search size={18} className="text-primary" />
                  <Text weight="bold" size="md">
                    {l('Kan du ikke finde systemet?', "Can't find the system?")}
                  </Text>
                </Card.Header>
                <Card.Body padding="compact" className="flex flex-col gap-sm">
                  <Text size="sm" className="text-text-muted leading-[1.6]">
                    {l('Søg efter system, opgave eller nøgleord — fx "eksamen", "mail" eller "software".', 'Search by system, task or keyword — e.g. "exam", "mail" or "software".')}
                  </Text>
                  <div className="flex flex-col gap-xs mt-xs">
                    <Button variant="primary" size="sm" onClick={() => env.open('https://support.its.aau.dk/')} className="normal-case tracking-normal font-bold">
                      {l('Kontakt IT-support', 'Contact IT support')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => env.open('https://support.its.aau.dk/')} className="text-primary normal-case tracking-normal font-bold">
                      {l('Besøg help-portalen', 'Visit the help portal')}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </aside>
          }
        />
      </div>
    </PageLayout>
  )
}

export default Resources
