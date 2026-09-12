import { ArrowRight } from 'lucide-react'
import { TeaserCard, Button, HighlightText } from '@/components/ui'
import { Stack } from '@/components/Layout'
import { ASSETS } from '@/lib/constants'
import useStore from '@/store'

interface SearchResultItem {
  label: string
  path: string
  group: string
  description: string
  img?: string
  code?: string
  professor?: string
}

interface SearchResultCardProps {
  item: SearchResultItem
  query: string
  actionLabel: string
  onClick: () => void
  isStarred?: boolean
  onStarToggle?: () => void
}

export function SearchResultCard({
  item,
  query,
  actionLabel,
  onClick,
  isStarred,
  onStarToggle,
}: SearchResultCardProps) {
  return (
    <TeaserCard
      variant="horizontal"
      image={item.img || ASSETS.fallback.searchThumbnail}
      badge={item.group}
      title={<HighlightText text={item.label} query={query} />}
      description={item.description}
      isStarred={isStarred}
      onStarToggle={onStarToggle}
      action={
        <Button variant="primary" size="md" iconRight={ArrowRight} pill className="px-md" onClick={(e) => { e.stopPropagation(); onClick() }}>
          {actionLabel}
        </Button>
      }
      onClick={onClick}
    />
  )
}

interface SearchResultFiltersProps {
  categories: string[]
  activeFilter: string
  onFilterChange: (filter: string) => void
}

export function SearchResultFilters({
  categories,
  activeFilter,
  onFilterChange,
}: SearchResultFiltersProps) {
  const t = useStore(state => state.t)

  return (
    <Stack
      direction="row"
      gap="sm"
      align="center"
      className="search-filters overflow-x-auto pb-xs no-scrollbar"
    >
      {categories.map((cat) => (
        <Button
          key={cat}
          variant={activeFilter === cat ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onFilterChange(cat)}
          pill
          className={
            activeFilter !== cat
              ? 'dark:text-text-muted dark:bg-bg-highlight/30'
              : 'shadow-[var(--shadow-md)]'
          }
        >
          {cat === 'all' ? t('all') : cat}
        </Button>
      ))}
    </Stack>
  )
}
