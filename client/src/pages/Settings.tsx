import { User, Globe, MessageSquare, Code, Calendar, Database, Key, Mail, Bell, Archive, FileText, Settings as SettingsIcon, ExternalLink, PlusCircle, Award, Sliders, ArrowLeft } from 'lucide-react'
import { type KeyboardEvent, useRef, useState, useCallback, useMemo } from 'react'
import { PageLayout, Stack, SplitLayout } from '@/components/Layout';
import { Card, Text, Button, Icon, Avatar, MasterItem, useToast } from '@/components/ui'
import useStore from '@/store'
import { useSearchParams } from 'react-router-dom'
import { ProfileTab, NotificationsTab, LanguageTab, ForumTab, CalendarTab, MessagesTab, type ProfileTabHandle } from '@/components/Settings'

export const SETTINGS_CATEGORIES = [
  {
    id: 'bruger', nameKey: 'categories.user_account', items: [
      { id: 'profil', nameKey: 'categories.edit_profile' },
      { id: 'sprog', nameKey: 'categories.select_language' },
    ],
  },
  {
    id: 'indstillinger', nameKey: 'categories.preferences', items: [
      { id: 'notifikationer', nameKey: 'categories.notification_settings' },
      { id: 'beskeder', nameKey: 'categories.message_settings' },
      { id: 'forum', nameKey: 'categories.forum_settings' },
      { id: 'kalender', nameKey: 'categories.calendar_settings' },
    ],
  },
  {
    id: 'avanceret', nameKey: 'categories.advanced', items: [
      { id: 'sikkerhedsnogler', nameKey: 'categories.security_keys' },
      { id: 'editor', nameKey: 'categories.editor_settings' },
      { id: 'indholdsbank', nameKey: 'categories.content_bank' },
      { id: 'arkiver', nameKey: 'categories.file_archives' },
      { id: 'eksempler', nameKey: 'categories.manage_samples' },
      { id: 'blogindstillinger', nameKey: 'categories.blog_settings' },
      { id: 'eksterneb', nameKey: 'categories.external_blogs' },
      { id: 'registrerb', nameKey: 'categories.register_blog' },
      { id: 'badgeadm', nameKey: 'categories.manage_badges' },
      { id: 'badgeind', nameKey: 'categories.badge_settings' },
    ],
  },
] as const;

const catIcons: Record<string, typeof User> = {
  bruger: User,
  indstillinger: SettingsIcon,
  avanceret: Sliders,
}

const itemIcons: Record<string, typeof User> = {
  profil: User,
  sprog: Globe,
  forum: MessageSquare,
  editor: Code,
  kalender: Calendar,
  indholdsbank: Database,
  sikkerhedsnogler: Key,
  beskeder: Mail,
  notifikationer: Bell,
  arkiver: Archive,
  eksempler: FileText,
  blogindstillinger: SettingsIcon,
  eksterneb: ExternalLink,
  registrerb: PlusCircle,
  badgeadm: Award,
  badgeind: Sliders,
}

const TAB_SUBTITLES: Record<string, string> = {
  profil: 'Opdater navn, profilbillede og udseende.',
  sprog: 'Vælg sprog for portalens brugerflade.',
  notifikationer: 'Vælg hvordan og hvornår du vil modtage notifikationer.',
  forum: 'Finjustér dine præferencer for forumaktivitet.',
  kalender: 'Tilpas hvordan din kalender vises.',
  beskeder: 'Styr hvem der kan kontakte dig og hvordan.',
}

function Settings() {
  const t = useStore(state => state.t)
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const activeTab = searchParams.get('tab') || 'profil'
  const [expandedCats, setExpandedCats] = useState<string[]>(['bruger', 'indstillinger'])
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [profileDirty, setProfileDirty] = useState(false)
  const profileRef = useRef<ProfileTabHandle>(null)

  const firstName = useStore(state => state.firstName)
  const lastName = useStore(state => state.lastName)
  const isSaving = useStore(state => state.isSaving)
  const handleStoreSave = useStore(state => state.handleSave)

  const handleSave = useCallback(async () => {
    profileRef.current?.commit()
    await handleStoreSave(toast, t)
    setProfileDirty(false)
  }, [handleStoreSave, toast, t])

  const handleTabClick = useCallback((id: string) => {
    setSearchParams({ tab: id })
    setMobileDetailOpen(true)
  }, [setSearchParams])

  const toggleCat = useCallback((id: string): void => {
    setExpandedCats(prev => prev.includes(id)
      ? prev.filter(c => c !== id)
      : [...prev, id]
    )
  }, [])

  const activeTabLabel = useMemo(
    () => {
      const allItems = (SETTINGS_CATEGORIES as ReadonlyArray<{ id: string; nameKey: string; items: ReadonlyArray<{ id: string; nameKey: string }> }>)
        .flatMap(c => c.items)
      return allItems.find(i => i.id === activeTab)?.nameKey ?? 'settings'
    },
    [activeTab]
  )

  const categories = SETTINGS_CATEGORIES

  return (
    <PageLayout
      className="two-panel-page settings-page"
      pageKey="settings"
      flat
      breadcrumbs={[{ label: t('nav.dashboard'), href: '/' }, { label: t('nav.settings') }]}
    >

      <div className="container pb-2xl pt-sm">
        <SplitLayout
          sidebarPosition="left"
          showDetailOnMobile={mobileDetailOpen}
          fullHeight={false}
          detailHeader={
            <div className="md:hidden flex items-center h-14 px-md border-b border-border bg-bg-card">
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
                onClick={() => setMobileDetailOpen(false)}
                className="font-bold"
              >
                {t('common.back')}
              </Button>
            </div>
          }
          sidebar={
            <Card className="flex flex-col p-[var(--space-0)] h-full w-full border-none">
              <Card.Header className="border-b border-border py-sm px-2">
                <Stack direction="row" gap="sm" align="center">
                  <Avatar name={`${firstName} ${lastName}`} size="sm" className="scale-75 origin-left" />
                  <Text weight="bold" size="xs" className="text-main truncate">{`${firstName} ${lastName}`}</Text>
                </Stack>
              </Card.Header>
              <Card.Body className="p-1">
                {categories.map((cat) => (
                  <Stack key={cat.id} gap="2xs" className="mb-1">
                    <Stack
                      direction="row"
                      align="center"
                      justify="between"
                      onClick={() => toggleCat(cat.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e: KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleCat(cat.id)
                        }
                      }}
                      className="settings__cat-header cursor-pointer py-1 px-1 hover:bg-bg-hover rounded-[var(--radius-sm)] transition-colors"
                    >                      <Stack direction="row" align="center" gap="xs">
                        {(() => {
                           const CatIcon = catIcons[cat.id]
                           /* istanbul ignore next */
                           return CatIcon ? <CatIcon size={11} strokeWidth={2} className="text-muted opacity-50 shrink-0" /> : null
                        })()}
                        <Text size="2xs" weight="bold" muted className="text-uppercase tracking-wider">{t(cat.nameKey)}</Text>
                      </Stack>
                      <Icon name={`chevron-${expandedCats.includes(cat.id) ? 'up' : 'down'}`} className="settings__chevron text-[0.6rem] opacity-40 text-muted" />
                    </Stack>
                    {expandedCats.includes(cat.id) && cat.items.map((item) => (
                      <MasterItem
                        key={item.id}
                        leading={itemIcons[item.id]}
                        title={t(item.nameKey)}
                        selected={activeTab === item.id}
                        onClick={() => handleTabClick(item.id)}
                        className="rounded-[var(--radius-md)] ml-0 border-none"
                      />
                    ))}
                  </Stack>
                ))}
              </Card.Body>
            </Card>
          }
          main={
            <Card className="flex flex-col p-[var(--space-0)] h-full w-full border-none">
              <Card.Header className="border-b border-border shrink-0">
                <Stack gap="2xs">
                  <Text weight="bold" size="lg" className="card__title text-main">{t(activeTabLabel)}</Text>
                  <Text muted size="sm">{TAB_SUBTITLES[activeTab] || t('settings.subtitle')}</Text>
                </Stack>
              </Card.Header>
              
              <Card.Body className="p-lg overflow-y-auto flex-1 min-h-0">
                <div key={activeTab}>
                  {activeTab === 'profil' ? (
                    <ProfileTab ref={profileRef} onDirtyChange={setProfileDirty} />
                  ) : activeTab === 'notifikationer' ? (
                    <NotificationsTab />
                  ) : activeTab === 'sprog' ? (
                    <LanguageTab />
                  ) : activeTab === 'forum' ? (
                    <ForumTab />
                  ) : activeTab === 'kalender' ? (
                    <CalendarTab />
                  ) : activeTab === 'beskeder' ? (
                    <MessagesTab />
                  ) : (
                    <Stack align="center" justify="center" className="settings__empty-state py-[var(--space-3xl)] border-2 border-dashed border-border rounded-[var(--radius-lg)] bg-bg-highlight/50">
                       <Icon name="gear" size="3xl" className="text-muted opacity-30 mb-md" />
                       <Text muted>{t('settings.under_development')}</Text>
                    </Stack>
                  )}
                </div>
              </Card.Body>

              {activeTab === 'profil' && (
                <Card.Footer className="border-t border-border p-lg shrink-0 bg-bg-card z-10 sticky bottom-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.2)]">
                  <Button variant="primary" size="md" onClick={handleSave} loading={isSaving} disabled={!profileDirty} className="self-start">{t('settings.save_changes')}</Button>
                </Card.Footer>
              )}
            </Card>
          }
        />
      </div>
    </PageLayout>
  )
}

export default Settings
