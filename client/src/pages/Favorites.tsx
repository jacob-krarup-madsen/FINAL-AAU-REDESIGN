
import { useMemo, useState } from 'react';
import { Trash2, Wrench, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FavoritesList, { FavoritesFilter } from '@/components/Favorites';

import Button from '@/components/ui/Button';
import { PATHS } from '@/routes';
import { PageHeader } from '@/components/Layout';
import { Stack } from '@/components/Layout';
import {
  Text,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui';
import { DASHBOARD_CONFIG } from '@/lib/constants';
import { env, resolveFavorite, sortFavorites, allToolsList } from '@/lib/utils';
import type { ResolvedFavorite } from '@/lib/utils';
import useStore from '@/store';
import { useFilteredCollection } from '@/hooks';
import type { FavoriteType } from '@/lib/types';

function Favorites() {
  const navigate = useNavigate()
  const t = useStore((state) => state.t)
  const lang = useStore((state) => state.lang)
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en
  const toggleFavorite = useStore((state) => state.toggleFavorite)
  const clearFavorites = useStore((state) => state.clearFavorites)
  const reorderFavorites = useStore((state) => state.reorderFavorites)
  const favorites = useStore(state => state.favorites)
  const courses = useStore(state => state.courses)
  const [confirmingRemoveAll, setConfirmingRemoveAll] = useState(false)

  const recommendedTools = useMemo(() => {
    const favToolIds = new Set(
      favorites.filter((fav) => fav.type === 'tool').map((fav) => fav.entityId)
    );
    return allToolsList
      .filter((tool) => !favToolIds.has(tool.id))
      .slice(0, 4);
  }, [favorites]);

  const resolved = useMemo(() => {
    const sorted = sortFavorites(favorites)
    return sorted
      .map(fav => resolveFavorite(fav, lang, courses, t))
      .filter(Boolean) as ResolvedFavorite[]
  }, [favorites, lang, courses, t])

  const {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    items: filtered,
  } = useFilteredCollection(resolved, {
    searchKeys: (item) => [item.title],
    filterKey: (item) => item.type,
    filterDefault: 'all',
  })

  const typeFilter = activeFilter as FavoriteType | 'all'
  const setTypeFilter = (val: FavoriteType | 'all') => setActiveFilter(val)

  return (
    <Stack className="favorites-page">
      <PageHeader
        pageKey="favorites"
        title={t('favorites_page_title')}
        subtitle={t('favorites_page_subtitle')}
        breadcrumbs={[{ label: t('dashboard'), href: '/' }, { label: t('favorites') }]}
        flat
      />

      <div className="container pb-[var(--space-lg)]">
        <div className="flex flex-col gap-sm mb-[var(--space-md)] bg-bg-highlight/30 dark:bg-white/5 p-sm rounded-[var(--radius-lg)] border border-border/40">
          <div className="flex items-center justify-between pb-sm border-b border-border/40">
            <Text size="sm" muted className="font-semibold text-text-muted">
              {resolved.length}/{DASHBOARD_CONFIG.FAVORITES_LIMIT} {t('favorites_limit')} ({filtered.length} {l('fundet', 'found')})
            </Text>
            {resolved.length > 0 && (
              <Dialog open={confirmingRemoveAll} onOpenChange={setConfirmingRemoveAll}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingRemoveAll(true)}
                  className="text-xs font-semibold px-[var(--space-xs)] h-[2rem] rounded-[var(--radius-md)] flex items-center gap-[var(--space-xs)] text-danger hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                  {t('remove_all')}
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {l('Fjern alle favoritter?', 'Remove all favorites?')}
                    </DialogTitle>
                    <DialogDescription>
                      {l(
                        'Er du sikker på, at du vil fjerne alle favoritter? Denne handling kan ikke fortrydes.',
                        'Are you sure you want to remove all favorites? This action cannot be undone.'
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose>
                      <Button variant="ghost">
                        {t('common.cancel')}
                      </Button>
                    </DialogClose>
                    <Button
                      variant="danger"
                      onClick={() => {
                        clearFavorites()
                        setConfirmingRemoveAll(false)
                      }}
                    >
                      {t('confirm_remove_all')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <FavoritesFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            lang={lang}
            t={t}
            totalCount={filtered.length}
            compact={resolved.length <= 3}
          />
        </div>

        {resolved.length > 0 && resolved.length <= 3 && filtered.length > 0 && (
          <Text size="xs" muted className="text-center mb-[var(--space-md)]">
            {t('favorites_empty_hint')}
          </Text>
        )}

        <FavoritesList
          filtered={filtered}
          lang={lang}
          searchQuery={searchQuery}
          typeFilter={typeFilter}
          t={t}
          onRemove={(type: any, entityId: any) => toggleFavorite(type, entityId)}
          onReorder={reorderFavorites}
          onNavigate={(link: string, external?: boolean) => {
            if (external) {
              env.open(link)
            } else {
              navigate(link)
            }
          }}
          onGoToDashboard={() => navigate(PATHS.DASHBOARD)}
        />

        {favorites.length <= 3 && recommendedTools.length > 0 && (
          <div className="mt-xl border-t border-border/40 pt-lg animate-fade-in w-full">
            <h3 className="text-sm font-bold text-main mb-sm uppercase tracking-wider">
              {l('Anbefalede genveje', 'Recommended Shortcuts')}
            </h3>
            <div className="grid gap-[var(--space-xs)] grid-cols-1 sm:grid-cols-2 md:grid-cols-4 w-full">
              {recommendedTools.map((tool) => {
                const Icon = tool.icon || Wrench;
                const description = l((tool as any).descDa, (tool as any).descEn);
                return (
                  <div
                    key={tool.id}
                    onClick={() => toggleFavorite('tool', tool.id)}
                    className="group flex items-center justify-between p-xs rounded-[var(--radius-xl)] border border-[var(--border-color)] bg-bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-xs min-w-0 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-lg)] bg-primary/10 text-primary shrink-0">
                        <Icon size={18} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0 pr-2xs">
                        <div className="text-sm font-semibold truncate text-main">
                          {tool.titleKey
                            ? t(tool.titleKey)
                            : l((tool as any).nameDa || (tool as any).nameEn, (tool as any).nameEn || (tool as any).nameDa)}
                        </div>
                        {description && (
                          <div className="text-xs text-muted line-clamp-1 mt-2xs">
                            {description}
                          </div>
                        )}
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-3xs block">
                          {l('Anbefalet genvej', 'Recommended')}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-muted group-hover:text-primary transition-all shrink-0 h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center p-0 rounded-full"
                      aria-label={l('Føj til favoritter', 'Add to favorites')}
                    >
                      <Star size={18} strokeWidth={2.5} />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Stack>
  )
}

export default Favorites
