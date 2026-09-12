import { forwardRef, useState, useEffect, useRef, useImperativeHandle } from 'react'
import { Sun, Monitor, Moon, Camera, Lock, Check } from 'lucide-react'
import {
  Avatar,
  Card,
  SectionHeader,
  FormField,
  Text,
  Input,
  Button,
  Select,
  Radio,
  useToast,
} from '@/components/ui'
import { Grid, Stack } from '@/components/Layout'
import useStore from '@/store'
import type { Theme } from '@/store'

// ==========================================
// AutosaveStatus Helper Component
// ==========================================

interface AutosaveStatusProps {
  /** Increment to trigger "Gemt" flash */
  changeCount: number
}

function AutosaveStatus({ changeCount }: AutosaveStatusProps) {
  const [showSaved, setShowSaved] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (changeCount <= 0) return
    setShowSaved(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setShowSaved(false), 2000)
    return () => clearTimeout(timerRef.current)
  }, [changeCount])

  if (showSaved) {
    return (
      <Text size="xs" className="text-success font-semibold flex items-center gap-3xs">
        <Check size={12} strokeWidth={3} />
        Gemt
      </Text>
    )
  }

  return (
    <Text size="xs" muted className="flex items-center gap-3xs">
      Gemmes automatisk
    </Text>
  )
}

// ==========================================
// ProfileTab
// ==========================================

interface ProfileTabProps {
  onDirtyChange?: (dirty: boolean) => void
}

export interface ProfileTabHandle {
  commit: () => void
}

export const ProfileTab = forwardRef<ProfileTabHandle, ProfileTabProps>(({ onDirtyChange }, ref) => {
  const store = useStore()
  const t = store.t
  const theme = store.theme

  const [draftFirst, setDraftFirst] = useState(store.firstName)
  const [draftLast, setDraftLast] = useState(store.lastName)

  const isDirty = draftFirst !== store.firstName || draftLast !== store.lastName

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useImperativeHandle(ref, () => ({
    commit: () => {
      store.setFirstName(draftFirst)
      store.setLastName(draftLast)
    },
  }), [draftFirst, draftLast, store])

  return (
    <Stack gap="lg" className="settings__profile-form max-w-[var(--container-max-width)] animate-fade-in">
      <SectionHeader title={t('settings.profile')} description={t('settings.profile_desc')} className="!mb-0" />
      <Stack direction="row" gap="md" align="center" className="profile-hero pb-lg border-b border-border/50 flex-col sm:flex-row">
        <Avatar name={`${draftFirst} ${draftLast}`} size={96} className="ring-4 ring-primary/10 shrink-0" />
        <Stack gap="xs" className="items-start">
          <Text weight="bold" size="xl" className="text-main">{`${draftFirst} ${draftLast}`}</Text>
          <Button variant="secondary" size="md" pill icon={Camera} className="normal-case tracking-normal font-semibold h-11 min-h-[44px] px-lg">{t('settings.change_photo')}</Button>
          <Text size="2xs" muted>JPG eller PNG · maks. 5 MB</Text>
        </Stack>
      </Stack>
      
      <Grid columns={2} gap="md">
        <Grid.Item span={1}>
          <FormField id="settings-first-name" label={t('settings.first_name')}>
            <Input id="settings-first-name" value={draftFirst} onChange={(e) => setDraftFirst(e.target.value)} />
          </FormField>
        </Grid.Item>
        <Grid.Item span={1}>
          <FormField id="settings-last-name" label={t('settings.last_name')}>
            <Input id="settings-last-name" value={draftLast} onChange={(e) => setDraftLast(e.target.value)} />
          </FormField>
        </Grid.Item>
      </Grid>
      
      <FormField id="settings-email" label={t("settings.email")} helpText={t('settings.email_stads_help')}>
        <div className="relative flex items-center w-full">
          <Input id="settings-email" type="email" defaultValue="student@example.com" disabled className="pr-10 bg-bg-highlight/50 opacity-70 cursor-not-allowed" />
          <div className="absolute right-3 text-slate-400 dark:text-slate-500 pointer-events-none opacity-80">
            <Lock size={15} />
          </div>
        </div>
      </FormField>

      {isDirty && (
        <Text size="sm" className="text-warning font-semibold flex items-center gap-xs">
          Du har ikke-gemte ændringer
        </Text>
      )}
      
      <Stack gap="md" className="appearance-section">
        <Text size="md" weight="bold" className="text-main">{t('settings.appearance')}</Text>
        <Text size="xs" muted className="-mt-sm">Gemmes automatisk</Text>
        <div className="appearance-grid grid grid-cols-1 sm:grid-cols-3 gap-md">
          {[
            { id: 'light', icon: Sun, label: t('theme.light') },
            { id: 'system', icon: Monitor, label: t('theme.system') },
            { id: 'dark', icon: Moon, label: t('theme.dark') }
          ].map((opt) => {
            const isSelected = theme === opt.id
            return (
              <Card
                as="button"
                key={opt.id}
                variant="outlined"
                interactive
                className={`appearance-card group p-2 rounded-[var(--radius-lg)] active:scale-[0.98] hover:-translate-y-0.5 relative ${isSelected ? 'active border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20' : 'bg-card hover:border-primary/20'}`}
                onClick={() => store.setTheme(opt.id as Theme)}
                aria-pressed={isSelected}
                aria-label={opt.label}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                    <Check size={12} strokeWidth={3} className="text-white" />
                  </div>
                )}
                <div className={`appearance-preview appearance-preview--${opt.id} border border-border rounded-[var(--radius-md)] overflow-hidden bg-bg-body aspect-video`}>
                  <div className={`preview-topbar h-2 ${opt.id === 'dark' ? 'bg-slate-800' : 'bg-aau-blue'}`} />
                  <div className="flex flex-1 h-full">
                    <div className={`preview-sidebar w-4 h-full border-r border-border ${opt.id === 'dark' ? 'bg-slate-900' : 'bg-bg-sidebar'}`} />
                    <div className="preview-content p-2 flex flex-col gap-1.5 flex-1">
                      <div className="preview-line h-1 w-4/5 bg-border rounded-full" />
                      <div className="preview-line h-1 w-3/5 bg-border rounded-full" />
                      <div className="preview-line h-1 w-2/5 bg-border rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="appearance-label flex items-center gap-sm mt-sm text-sm font-semibold">
                  <opt.icon size={14} className={isSelected ? 'text-primary' : 'text-muted'} />
                  <span className={isSelected ? 'text-primary' : 'text-muted'}>{opt.label}</span>
                </div>
              </Card>
            )
          })}
        </div>
      </Stack>
    </Stack>
  )
})
ProfileTab.displayName = 'ProfileTab'

// ==========================================
// NotificationsTab
// ==========================================

export function NotificationsTab() {
  const store = useStore()
  const { notifPrefs, setNotifPrefs, t } = store
  const [changeCount, setChangeCount] = useState(0)

  const bump = () => setChangeCount(c => c + 1)

  return (
    <Stack gap="xl" className="settings__notif-prefs max-w-[var(--container-max-width)] animate-fade-in">
      <SectionHeader title={t('settings.notif_preferences')} description={t('settings.notif_preferences_desc')} className="!mb-0" />
      <AutosaveStatus changeCount={changeCount} />
      <Grid columns={2} gap="md">
        {[
          { id: 'email', label: t('settings.notif_channel_email'), desc: t('settings.notif_channel_email_desc') },
          { id: 'push', label: t('settings.notif_channel_push'), desc: t('settings.notif_channel_push_desc') },
          { id: 'sms', label: t('settings.notif_channel_sms'), desc: t('settings.notif_channel_sms_desc') },
        ].map((ch) => {
          const isOn = notifPrefs[ch.id as keyof typeof notifPrefs]
          return (
            <Grid.Item key={ch.id} span={1}>
              <Card
                variant="outlined"
                className={`hover:border-primary/30 transition-colors ${isOn ? 'border-primary/60' : ''}`}
                onClick={() => { setNotifPrefs((prev) => ({ ...prev, [ch.id]: !prev[ch.id as keyof typeof prev] })); bump(); }}
                role="switch"
                aria-checked={isOn}
              >
                <Card.Body className="p-md">
                  <Stack direction="row" align="center" justify="between">
                    <Stack gap="2xs">
                      <Text weight="bold" size="sm" className="text-main">{ch.label}</Text>
                      <Text muted size="xs">{ch.desc}</Text>
                      {ch.id === 'sms' && (
                        <Text size="2xs" muted className="italic">SMS kræver et registreret telefonnummer.</Text>
                      )}
                    </Stack>
                    <div className={`w-11 h-6 rounded-[var(--radius-pill)] flex items-center px-[var(--space-2xs)] transition-colors ${isOn ? 'bg-primary' : 'bg-slate-300 dark:bg-white/20'}`}>
                      <div className={`w-5 h-5 rounded-[var(--radius-pill)] bg-white shadow-[var(--shadow-sm)] transition-all ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </Stack>
                </Card.Body>
              </Card>
            </Grid.Item>
          )
        })}
      </Grid>
      <Stack gap="xs" className="mt-md pt-md border-t border-border">
        <Text weight="bold" size="sm" className="text-main">{t('settings.quiet_hours')}</Text>
        <Text muted size="xs">{t('settings.quiet_hours_desc')}</Text>
        <Text size="2xs" muted className="italic">Gælder notifikationer i de valgte kanaler.</Text>
        <div className="flex items-center gap-md mt-sm">
          <div className="flex items-center gap-xs">
            <label htmlFor="quiet-hours-start" className="text-xs font-semibold text-text-secondary shrink-0">Fra</label>
            <Input id="quiet-hours-start" type="time" step="900" defaultValue="22:00" className="w-32" />
          </div>
          <Text size="sm" muted className="shrink-0">{t('settings.to_label')}</Text>
          <div className="flex items-center gap-xs">
            <label htmlFor="quiet-hours-end" className="text-xs font-semibold text-text-secondary shrink-0">Til</label>
            <Input id="quiet-hours-end" type="time" step="900" defaultValue="07:00" className="w-32" />
          </div>
        </div>
      </Stack>
    </Stack>
  )
}

// ==========================================
// LanguageTab
// ==========================================

interface LanguageTabProps {
  lang?: 'da' | 'en'
  setLang?: (lang: 'da' | 'en') => void
}

export function LanguageTab(props: LanguageTabProps) {
  const store = useStore()
  const lang = props.lang ?? store.lang
  const setLang = props.setLang ?? store.setLang

  const t = store.t
  const toast = useToast()
  const [changeCount, setChangeCount] = useState(0)

  const bump = () => setChangeCount(c => c + 1)

  return (
    <Stack gap="lg" className="settings__language max-w-[36rem] animate-fade-in">
      <SectionHeader title={t('settings.select_language')} description={t('settings.language_desc')} className="!mb-0" />
      <AutosaveStatus changeCount={changeCount} />
      <div className="mt-2xs grid grid-cols-1 sm:grid-cols-2 gap-md">
        {[
          { id: 'da', title: 'Dansk (Danish)', desc: 'Skift systemets sprog til dansk' },
          { id: 'en', title: 'English (English)', desc: 'Switch system language to English' }
        ].map((langOpt) => {
          const isSelected = lang === langOpt.id
          return (
            <Card 
              key={langOpt.id}
              variant="outlined" 
              onClick={() => {
                setLang(langOpt.id as 'da' | 'en')
                toast.success(t('settings.lang_changed_success'))
                bump()
              }}
              className={`hover:border-primary/40 transition-all shrink-0 relative ${isSelected ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20' : ''}`}
            >
              <Card.Body className="p-lg flex gap-xs items-center">
                <div className="flex-1">
                  <Text weight="bold" size="sm" className="text-main">{langOpt.title}</Text>
                  <Text size="xs" muted className="mt-3xs">{langOpt.desc}</Text>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary' : 'border-2 border-slate-300 dark:border-slate-600'}`}>
                  {isSelected && <Check size={12} strokeWidth={3} className="text-white" />}
                </div>
              </Card.Body>
            </Card>
          )
        })}
      </div>
    </Stack>
  )
}

// ==========================================
// ForumTab
// ==========================================

export function ForumTab() {
  const store = useStore()
  const { forumDigest, setForumDigest, forumTracking, setForumTracking, forumAutoSubscribe, setForumAutoSubscribe, t } = store
  const [changeCount, setChangeCount] = useState(0)

  const bump = () => setChangeCount(c => c + 1)

  return (
    <Stack gap="lg" className="settings__forum max-w-[var(--container-max-width)] animate-fade-in">
      <SectionHeader title={t('settings.forum_prefs')} description={t('settings.forum_desc')} className="!mb-0" />
      <AutosaveStatus changeCount={changeCount} />
      <Stack gap="lg" className="mt-sm">
        <FormField label={t('settings.email_digest_type')}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
            {[
              { id: 'none', label: t('settings.digest_none'), desc: t('settings.digest_none_desc') },
              { id: 'complete', label: t('settings.digest_complete'), desc: t('settings.digest_complete_desc') },
              { id: 'subjects', label: t('settings.digest_subjects'), desc: t('settings.digest_subjects_desc') }
            ].map(opt => {
              const isSelected = forumDigest === opt.id
              return (
                <Card
                  as="button"
                  key={opt.id}
                  variant="outlined"
                  interactive
                  className={`p-md text-left active:scale-[0.98] relative ${isSelected ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20' : 'bg-card hover:border-primary/20'}`}
                  onClick={() => { setForumDigest(opt.id as 'none' | 'complete' | 'subjects'); bump(); }}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                      <Check size={12} strokeWidth={3} className="text-white" />
                    </div>
                  )}
                  <Text size="sm" weight="bold" className={isSelected ? 'text-primary' : 'text-main'}>{opt.label}</Text>
                  <Text size="xs" muted className="mt-3xs leading-snug">{opt.desc}</Text>
                </Card>
              )
            })}
          </div>
        </FormField>

        <div className="border-t border-border pt-md flex items-center justify-between pointer-events-auto">
          <Stack gap="2xs" className="max-w-[75%]">
            <Text id="toggle-label-forum-tracking" weight="semibold" size="sm" className="text-main">
              {t('settings.forum_tracking')}
            </Text>
            <Text size="xs" muted>
              {t('settings.forum_tracking_desc')}
            </Text>
          </Stack>
          <button
            type="button"
            role="switch"
            aria-checked={forumTracking}
            aria-labelledby="toggle-label-forum-tracking"
            onClick={() => { setForumTracking(!forumTracking); bump(); }}
            className={`relative w-11 h-7 rounded-full flex items-center px-3xs transition-colors cursor-pointer after:absolute after:inset-[-12px] focus-visible:outline-none focus-visible:shadow-focus ${forumTracking ? 'bg-primary' : 'bg-slate-300 dark:bg-white/20'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${forumTracking ? 'ml-auto' : 'ml-0'}`} />
          </button>
        </div>

        <div className="border-t border-border pt-md flex items-center justify-between pointer-events-auto">
          <Stack gap="2xs" className="max-w-[75%]">
            <Text id="toggle-label-forum-auto-subscribe" weight="semibold" size="sm" className="text-main">
              {t('settings.auto_subscribe')}
            </Text>
            <Text size="xs" muted>
              {t('settings.auto_subscribe_desc')}
            </Text>
          </Stack>
          <button
            type="button"
            role="switch"
            aria-checked={forumAutoSubscribe}
            aria-labelledby="toggle-label-forum-auto-subscribe"
            onClick={() => { setForumAutoSubscribe(!forumAutoSubscribe); bump(); }}
            className={`relative w-11 h-7 rounded-full flex items-center px-3xs transition-colors cursor-pointer after:absolute after:inset-[-12px] focus-visible:outline-none focus-visible:shadow-focus ${forumAutoSubscribe ? 'bg-primary' : 'bg-slate-300 dark:bg-white/20'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${forumAutoSubscribe ? 'ml-auto' : 'ml-0'}`} />
          </button>
        </div>
      </Stack>
    </Stack>
  )
}

// ==========================================
// CalendarTab
// ==========================================

export function CalendarTab() {
  const store = useStore()
  const { calendarStartDay, setCalendarStartDay, calendarDefaultView, setCalendarDefaultView, t } = store
  const [changeCount, setChangeCount] = useState(0)

  const bump = () => setChangeCount(c => c + 1)

  return (
    <Stack gap="lg" className="settings__calendar max-w-[36rem] animate-fade-in">
      <SectionHeader title={t('settings.calendar_prefs')} description={t('settings.calendar_desc')} className="!mb-0" />
      <AutosaveStatus changeCount={changeCount} />
      <Stack gap="md" className="mt-xs">
        <FormField id="pref-first-day" label={t('settings.first_day_of_week')}>
          <Select
            id="pref-first-day"
            value={calendarStartDay}
            onChange={(e) => { setCalendarStartDay(e.target.value as 'monday' | 'sunday'); bump(); }}
            className="max-w-[280px]"
          >
            <option value="monday">{t('common.monday')}</option>
            <option value="sunday">{t('days.sun')}</option>
          </Select>
        </FormField>

        <FormField id="pref-default-view" label={t('settings.default_view')}>
          <Select
            id="pref-default-view"
            value={calendarDefaultView}
            onChange={(e) => { setCalendarDefaultView(e.target.value as 'month' | 'week' | 'day'); bump(); }}
            className="max-w-[280px]"
          >
            <option value="month">{t('common.month')}</option>
            <option value="week">{t('common.week')}</option>
            <option value="day">{t('common.day')}</option>
          </Select>
        </FormField>
      </Stack>
    </Stack>
  )
}

// ==========================================
// MessagesTab
// ==========================================

export function MessagesTab() {
  const store = useStore()
  const { messagePrivacy, setMessagePrivacy, messageEmailOffline, setMessageEmailOffline, t } = store
  const [changeCount, setChangeCount] = useState(0)

  const bump = () => setChangeCount(c => c + 1)

  return (
    <Stack gap="lg" className="settings__messages max-w-[36rem] animate-fade-in">
      <SectionHeader title={t('settings.message_prefs')} description={t('settings.message_desc')} className="!mb-0" />
      <AutosaveStatus changeCount={changeCount} />
      <Stack gap="lg" className="mt-sm">
        <FormField label={t('settings.who_can_contact')}>
          <div className="flex flex-col gap-sm">
            {[
              { id: 'contacts', title: t('settings.privacy_contacts'), desc: t('settings.privacy_contacts_desc') },
              { id: 'courses', title: t('settings.privacy_courses'), desc: t('settings.privacy_courses_desc') },
              { id: 'anyone', title: t('settings.privacy_anyone'), desc: t('settings.privacy_anyone_desc') }
            ].map(item => (
              <Card
                key={item.id}
                variant="outlined"
                className="flex-row gap-md p-md hover:bg-bg-hover transition-colors"
              >
                <Radio 
                  id={`msgPrivacy-${item.id}`}
                  name="msgPrivacy" 
                  checked={messagePrivacy === item.id}
                  onChange={() => { setMessagePrivacy(item.id as 'contacts' | 'courses' | 'anyone'); bump(); }}
                  className="mt-3xs"
                />
                <label htmlFor={`msgPrivacy-${item.id}`} className="cursor-pointer flex-1 select-none">
                  <Text size="sm" weight="bold" className="text-main">{item.title}</Text>
                  <Text size="xs" muted className="mt-3xs leading-normal">{item.desc}</Text>
                </label>
              </Card>
            ))}
          </div>
        </FormField>

        <div className="border-t border-border pt-md flex items-center justify-between pointer-events-auto">
          <Stack gap="2xs" className="max-w-[75%]">
            <Text id="toggle-label-message-email-copies" weight="semibold" size="sm" className="text-main">
              {t('settings.email_copies')}
            </Text>
            <Text size="xs" muted>
              Send e-mailkopier af private beskeder, når du er offline.
            </Text>
          </Stack>
          <button
            type="button"
            role="switch"
            aria-checked={messageEmailOffline}
            aria-labelledby="toggle-label-message-email-copies"
            onClick={() => { setMessageEmailOffline(!messageEmailOffline); bump(); }}
            className={`relative w-11 h-7 rounded-full flex items-center px-3xs transition-colors cursor-pointer after:absolute after:inset-[-12px] focus-visible:outline-none focus-visible:shadow-focus ${messageEmailOffline ? 'bg-primary' : 'bg-slate-300 dark:bg-white/20'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${messageEmailOffline ? 'ml-auto' : 'ml-0'}`} />
          </button>
        </div>
      </Stack>
    </Stack>
  )
}


