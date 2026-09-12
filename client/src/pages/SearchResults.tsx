import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchResultCard, SearchResultFilters } from '@/components/Search';
import { EmptyState, Button } from '@/components/ui';
import { Grid, PageHeader, Stack } from '@/components/Layout';
import useStore from '@/store';
import { useSearch } from '@/hooks';

function SearchResults() {
  const t = useStore(state => state.t)
  const lang = useStore(state => state.lang)
  const l = (da: string, en: string) => lang === 'da' ? da : en
  const isFavorite = useStore(state => state.isFavorite)
  const toggleFavorite = useStore(state => state.toggleFavorite)
  const _favorites = useStore(state => state.favorites)
  void _favorites
  const navigate = useNavigate()
  const { query, results, filteredResults, categories, activeFilter, setActiveFilter, getActionLabel, subtitle } = useSearch()

  return (
    <Stack tag="main" className="search-results-page">
      <PageHeader
        pageKey="search"
        title={`${t('search_results')} for "${query}"`}
        subtitle={subtitle}
        breadcrumbs={[{ label: t('dashboard'), href: '/' }, { label: t('search_results') }]}
      />

      <div className="container pb-[var(--space-3xl)]">
        {results.length > 0 ? (
          <div key="results">
            <Stack gap="xl">
              <SearchResultFilters
                categories={categories}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />

              <Grid columns={12} gap="lg">
                {filteredResults.map((res) => {
                  const isCourse = res.path.startsWith('/course/')
                  const courseId = isCourse ? Number(res.path.split('/').pop()) : null
                  return (
                    <Grid.Item span={12} key={res.path}>
                      <SearchResultCard
                        item={res}
                        query={query}
                        actionLabel={getActionLabel(res)}
                        onClick={() => navigate(res.path)}
                        isStarred={courseId !== null ? isFavorite('course', courseId) : undefined}
                        onStarToggle={courseId !== null ? () => toggleFavorite('course', courseId) : undefined}
                      />
                    </Grid.Item>
                  )
                })}
              </Grid>
            </Stack>
          </div>
        ) : (
          <div key="empty" className="flex justify-center">
            <div className="w-full max-w-md">
              <EmptyState
                icon={Search}
                title={t('no_search_results')}
                description={t('search_no_results_desc')}
                className="w-full text-center border border-border shadow-md bg-bg-card p-xl rounded-2xl"
                action={
                  <div className="flex flex-col gap-md text-left w-full mt-sm">
                     <div className="border-t border-border/60 pt-sm">
                       <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-xs">
                         {l('Søgetip:', 'Search Tips:')}
                       </span>
                       <ul className="list-disc pl-sm text-xs text-text-muted space-y-1">
                         <li>{l('Tjek for stavefejl', 'Check for spelling errors')}</li>
                         <li>{l('Prøv mere generelle søgeord', 'Try more general keywords')}</li>
                         <li>{l('Prøv at bruge færre søgeord', 'Try using fewer keywords')}</li>
                       </ul>
                     </div>
 
                     <div className="border-t border-border/60 pt-sm">
                       <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-xs">
                         {l('Søgningen dækkede:', 'Search Scope:')}
                       </span>
                       <div className="flex flex-wrap gap-2xs">
                         {categories.map((cat) => (
                           <span
                             key={cat}
                             className="px-2 py-0.5 rounded bg-bg-highlight/50 text-[10px] font-bold text-text-secondary border border-border/40"
                           >
                             {cat}
                           </span>
                         ))}
                       </div>
                     </div>
 
                     <div className="flex flex-col sm:flex-row gap-xs mt-sm w-full">
                       <Button
                         variant="outline"
                         full
                         onClick={() => {
                           navigate('/search?q=')
                         }}
                         className="font-bold border-border/80 hover:border-primary"
                       >
                         {l('Ryd søgning', 'Clear search')}
                       </Button>
                       <Button
                         variant="primary"
                         full
                         onClick={() => navigate('/')}
                         className="font-bold shadow-md hover:shadow-primary/20"
                       >
                         {l('Gå til dashboard', 'Go to dashboard')}
                       </Button>
                     </div>
                  </div>
                }
              />
            </div>
          </div>
        )}
      </div>
    </Stack>
  )
}

export default SearchResults
