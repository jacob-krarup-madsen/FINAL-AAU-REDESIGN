import { memo, useState } from 'react';
import { X, type LucideIcon, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, SearchInput, SegmentedControl, Card, Heading, Text } from '@/components/ui';
import Button from '@/components/ui/Button';
import { Stack } from '@/components/Layout';
import { cn, getFavoriteLabel } from '@/lib/utils';
import type { Lang } from '@/lib/utils';
import { translations } from '@/translations';
import type { FavoriteType } from '@/lib/types';

// ── FavoriteItem ─────────────────────────────────────────────────────────────

const typeClasses: Record<FavoriteType, string> = {
  course: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground',
  tool: 'bg-success/10 text-success dark:bg-success/20 dark:text-success',
  file: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning',
  forum: 'bg-info/10 text-info dark:bg-info/20 dark:text-info',
  link: 'bg-[var(--aau-light-pink)]/10 text-[var(--aau-light-pink)] dark:bg-[var(--aau-light-pink)]/20 dark:text-[var(--aau-light-pink)]',
}

interface FavoriteItemData {
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

interface FavoriteItemProps {
  item: FavoriteItemData
  lang: Lang
  onRemove: (type: FavoriteType, entityId: number) => void
  onClick?: () => void
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void
  draggable?: boolean
}

export const FavoriteItem = memo(function FavoriteItem({
  item,
  lang,
  onRemove,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  draggable = false,
}: FavoriteItemProps) {
  const Icon = item.icon
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-xs p-xs rounded-[var(--radius-xl)] border border-[var(--border-color)] bg-bg-card hover:border-primary/30 focus-within:shadow-focus focus-within:outline-none transition-all cursor-pointer select-none",
        "hover:-translate-y-1 active:scale-[0.98] duration-150 ease-[var(--transition-ease)]",
        draggable && "active:opacity-60",
      )}
    >
      {item.external ? (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10 rounded-[var(--radius-xl)] focus:outline-none"
          aria-label={item.title}
          onClick={(e) => {
            if (onClick) {
              e.preventDefault()
            }
          }}
        />
      ) : (
        <Link
          to={item.link}
          className="absolute inset-0 z-10 rounded-[var(--radius-xl)] focus:outline-none"
          aria-label={item.title}
          onClick={(e) => {
            if (onClick) {
              e.preventDefault()
            }
          }}
        />
      )}

      <div
        className={cn(
          "relative z-20 flex items-center justify-center w-10 h-10 rounded-[var(--radius-lg)] shrink-0 pointer-events-none",
          typeClasses[item.type]
        )}
      >
        <Icon size={18} strokeWidth={2} />
      </div>

      <div className="relative z-20 flex-1 min-w-0 pointer-events-none">
        <div className="text-sm font-medium truncate text-main">
          {item.title}
        </div>
        <Badge
          className={cn(
            "rounded-[var(--radius-pill)] px-[var(--space-sm)] text-[0.7rem] font-bold leading-tight",
            typeClasses[item.type]
          )}
        >
          {getFavoriteLabel(item.type, lang)}
        </Badge>
      </div>

      <div className="relative z-30 flex items-center justify-center w-6 h-6 shrink-0 ml-auto">
        <ChevronRight 
          size={16} 
          strokeWidth={2.5} 
          className="text-muted/60 absolute transition-opacity duration-150 group-hover:opacity-0" 
        />
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          onClick={(e) => { 
            e.stopPropagation()
            e.preventDefault()
            onRemove(item.type, item.entityId) 
          }}
          className="text-muted hover:text-danger hover:bg-danger/10 absolute opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-all"
          aria-label={(translations[lang as 'da' | 'en']?.remove_favorite as string) || 'Remove from favorites'}
        >
          <X size={14} strokeWidth={2} />
        </Button>
      </div>
    </div>
  )
})

// ── FavoritesFilter ──────────────────────────────────────────────────────────

const TYPE_FILTERS: { label: Record<'da' | 'en', string>; value: FavoriteType | 'all' }[] = [
  { label: { da: 'Alle', en: 'All' }, value: 'all' },
  { label: { da: 'Kurser', en: 'Courses' }, value: 'course' },
  { label: { da: 'Værktøjer', en: 'Tools' }, value: 'tool' },
  { label: { da: 'Filer', en: 'Files' }, value: 'file' },
  { label: { da: 'Fora', en: 'Forums' }, value: 'forum' },
  { label: { da: 'Links', en: 'Links' }, value: 'link' },
]

interface FavoritesFilterProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  typeFilter: FavoriteType | 'all'
  onTypeFilterChange: (val: FavoriteType | 'all') => void
  lang: 'da' | 'en'
  t: (key: string) => string
  totalCount?: number
  compact?: boolean
}

export function FavoritesFilter({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  lang,
  t,
  totalCount = 0,
  compact = false,
}: FavoritesFilterProps) {
  const options = TYPE_FILTERS.map((f) => ({
    value: f.value,
    label: f.label[lang],
  }))

  return (
    <div className="flex flex-col md:flex-row gap-[var(--space-sm)] md:gap-[var(--space-md)] items-stretch md:items-center">
      <div className="flex-1">
        <SearchInput
          placeholder={t('search_favorites_placeholder')}
          value={searchQuery}
          onChange={onSearchChange}
          onClear={() => onSearchChange('')}
        />
      </div>
      {totalCount > 0 && (
        <div className="text-xs text-text-muted font-semibold whitespace-nowrap shrink-0">
          {t('search_found_count').replace('{count}', String(totalCount))}
        </div>
      )}
      <div className={compact ? 'md:w-[320px] max-w-full' : 'md:w-[480px] max-w-full'}>
        <SegmentedControl
          options={options}
          value={typeFilter}
          onChange={(val) => onTypeFilterChange(val as FavoriteType | 'all')}
          className="!my-0"
        />
      </div>
    </div>
  )
}

// ── FavoritesList ────────────────────────────────────────────────────────────

interface FavoritesListProps {
  filtered: FavoriteItemData[]
  lang: 'da' | 'en'
  searchQuery: string
  typeFilter: FavoriteType | 'all'
  t: (key: string) => string
  onRemove: (type: FavoriteType, entityId: number) => void
  onReorder: (dragIndex: number, hoverIndex: number) => void
  onNavigate: (link: string, external?: boolean) => void
  onGoToDashboard: () => void
}

export default function FavoritesList({
  filtered,
  lang,
  searchQuery,
  typeFilter,
  t,
  onRemove,
  onReorder,
  onNavigate,
  onGoToDashboard,
}: FavoritesListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)

  return (
    <>
      {filtered.length === 0 ? (
        <div key="empty">
          <Card className="py-[var(--space-3xl)] border-dashed">
            <Stack align="center" justify="center" gap="md">
              <div className="p-[var(--space-md)] bg-bg-main rounded-[var(--radius-pill)]">
                <Star size={24} strokeWidth={2} className="text-[var(--aau-light-orange)]" fill="var(--aau-light-orange)" />
              </div>
              <Heading level={3}>{t('favorites_empty')}</Heading>
              <Text muted className="max-w-[300px] text-center">
                {searchQuery || typeFilter !== 'all'
                  ? t('no_favorites_match')
                  : t('favorites_empty_hint')}
              </Text>
              <Button variant="primary" onClick={onGoToDashboard}>
                {t('go_to_dashboard')}
              </Button>
            </Stack>
          </Card>
        </div>
      ) : (
        <div
          key="grid"
          className={filtered.length <= 3 ? 'flex flex-wrap justify-start gap-[var(--space-xs)] transition-all duration-150' : 'grid gap-[var(--space-xs)] transition-all duration-150'}
          style={filtered.length <= 3 ? {} : { gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
        >
          {filtered.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault()
                setDropTargetIndex(index)
                if (dragIndex !== null && dragIndex !== index) {
                   onReorder(dragIndex, index)
                   setDragIndex(index)
                }
              }}
              onDragLeave={() => setDropTargetIndex(null)}
              onDragEnd={() => {
                setDragIndex(null)
                setDropTargetIndex(null)
              }}
              className={
                dragIndex === index
                  ? 'opacity-40 border-2 border-dashed border-primary rounded-[var(--radius-lg)] bg-primary/5 transition-all'
                  : dropTargetIndex === index
                  ? 'border-2 border-primary/60 rounded-[var(--radius-lg)] bg-primary/[0.04] transition-all'
                  : filtered.length <= 3 ? 'w-full sm:w-[360px] max-w-full' : ''
              }
            >
              <FavoriteItem
                item={item}
                lang={lang}
                onRemove={onRemove}
                onClick={() => onNavigate(item.link, item.external)}
                draggable
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
