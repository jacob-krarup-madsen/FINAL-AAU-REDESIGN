import { useState } from 'react';


import { FileQuestion, GraduationCap, LifeBuoy, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { PageHeader } from '@/components/Layout';
import { SearchInput } from '@/components/ui';
import { Stack } from '@/components/Layout';
import { Text, Heading } from '@/components/ui';
import { PATHS } from '@/routes';
import useStore from '@/store';

function NotFound() {
  const navigate = useNavigate()
  const t = useStore(state => state.t)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`${PATHS.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <Stack className="container pb-[var(--space-2xl)]">
      <PageHeader
        pageKey="not_found"
        title={t('page_not_found')}
        subtitle={t('page_not_found_desc')}
        flat
      />

      <div className="flex justify-center py-xl">
        <Stack align="center" gap="lg" className="max-w-2xl w-full text-center">
          {/* Visual Header */}
          <div className="relative mb-[var(--space-md)]">
            <div className="p-[var(--space-lg)] rounded-[var(--radius-pill)] bg-primary/5 dark:bg-primary/10 animate-pulse-slow">
              <FileQuestion size={24} strokeWidth={2} className="text-primary opacity-20 dark:opacity-40" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pt-[var(--space-md)]">
               <Heading level={1} className="text-primary/90 dark:text-primary drop-shadow-[var(--shadow-xl)]">404</Heading>
            </div>
          </div>

          {/* Search Recovery */}
          <div className="w-full max-w-lg px-sm">
            <SearchInput
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
              iconSize={20}
            />
          </div>
          <Text size="xs" weight="bold" className="mt-[var(--space-md)] text-text-disabled uppercase tracking-widest block w-full text-center whitespace-nowrap">
            {t('or_try_shortcuts')}
          </Text>

          {/* Action Buttons */}
          <Stack direction="row" gap="md" wrap className="justify-center px-sm w-full sm:w-auto">
            <Button variant="primary" onClick={() => navigate(PATHS.DASHBOARD)} size="md" icon={LayoutDashboard} pill className="w-full sm:w-auto shadow-[var(--shadow-lg)] shadow-primary/20">
              {t('go_to_dashboard')}
            </Button>
            <Button variant="secondary" onClick={() => navigate(PATHS.COURSES)} size="md" icon={GraduationCap} pill className="w-full sm:w-auto bg-bg-card shadow-[var(--shadow-md)]">
              {t('find_modules')}
            </Button>
            <Button variant="ghost" onClick={() => navigate(PATHS.SUPPORT)} size="md" icon={LifeBuoy} pill className="w-full sm:w-auto">
              {t('contact_support')}
            </Button>
          </Stack>
        </Stack>
      </div>
    </Stack>
  )
}

export default NotFound
