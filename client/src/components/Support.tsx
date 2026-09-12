import { memo, useCallback } from 'react'
import {
  X,
  Phone,
  Mail,
  MapPin,
  ShieldHalf,
  Monitor,
  Signal,
  ChevronRight,
  AlertTriangle,
  Lock,
  MessageSquare,
  GraduationCap,
  ExternalLink,
} from 'lucide-react'
import {
  Card,
  FormField,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  SectionHeader,
  AccordionWrapper,
  AccordionItemRow,
  KeyValue,
} from '@/components/ui'
import { Stack } from '@/components/Layout'
import useStore from '@/store'
import { linkifyText } from '@/lib/utils'
import { supportLocations, supportDeskHours, supportNotes } from '@/lib/data'

// ==========================================
// ContactForm
// ==========================================

interface ContactFormProps {
  subject: string
  setSubject: (val: string) => void
  description: string
  setDescription: (val: string) => void
  isFormOpen: boolean
  setIsFormOpen: (val: boolean) => void
  isSubmitting: boolean
  fieldErrors: { subject: boolean; description: boolean }
  onSubmit: (e?: React.FormEvent) => Promise<void>
  onCancel: () => void
}

const ContactForm = memo(function ContactForm({
  subject,
  setSubject,
  description,
  setDescription,
  isFormOpen,
  setIsFormOpen,
  isSubmitting,
  fieldErrors,
  onSubmit,
  onCancel,
}: ContactFormProps) {
  const t = useStore(state => state.t)
  const lang = useStore(state => state.lang)
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en

  return (
    <Card className="h-auto overflow-visible min-h-[200px]">
      <Card.Body padding="compact" className="p-lg">
        <Heading level={3} className="mb-xs">{l('Send besked', 'Send message')}</Heading>
        {!isFormOpen ? (
          <div className="flex flex-col items-start">
            <Text size="xs" className="text-muted mb-sm">{t('send_message_desc')}</Text>
            <Button variant="primary" onClick={() => setIsFormOpen(true)}>
              {l('Send besked', 'Send message')}
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-md">
            <FormField
              id="support-subject"
              label={t('support_subject')}
              required
              error={fieldErrors.subject ? t('support_subject_error') : undefined}
            >
              <Input
                placeholder={t('support_subject_placeholder')}
                value={subject}
                error={fieldErrors.subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </FormField>

            <FormField
              id="support-description"
              label={t('support_description')}
              required
              error={fieldErrors.description ? t('support_description_error') : undefined}
            >
              <Textarea
                placeholder={t('support_description_placeholder')}
                rows={4}
                value={description}
                error={fieldErrors.description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormField>
            <div className="flex items-center gap-sm">
              <Button type="submit" variant="primary" disabled={isSubmitting} loading={isSubmitting} aria-label={t('send_message')}>
                {isSubmitting ? '' : t('send_message')}
              </Button>
              <Button type="button" variant="ghost" size="sm" icon={X} onClick={onCancel}>
                {t('cancel')}
              </Button>
            </div>
          </form>
        )}
      </Card.Body>
    </Card>
  )
})

// ==========================================
// FaqSection
// ==========================================

/** Map FAQ group-index → item-index → next-step action */
const FAQ_ACTIONS: Record<string, { labelDa: string; labelEn: string; href: string }> = {
  '0-0': { labelDa: 'Gå til password-nulstilling', labelEn: 'Go to password reset', href: 'https://serviceportal.aau.dk' },
  '0-1': { labelDa: 'Se Wi-Fi-vejledning', labelEn: 'View Wi-Fi guide', href: 'https://www.en.aau.dk/digital-identity/moodle/' },
  '1-0': { labelDa: 'Gå til Moodle-support', labelEn: 'Go to Moodle support', href: 'https://www.en.aau.dk/digital-identity/moodle/' },
  '1-1': { labelDa: 'Gå til eksamenssystemer', labelEn: 'Go to exam systems', href: 'https://eksamen.aau.dk' },
  '2-0': { labelDa: 'Bestil assistance på stedet', labelEn: 'Request on-site assistance', href: 'https://serviceportal.aau.dk' },
}

const FaqSection = memo(function FaqSection() {
  const t = useStore(state => state.t)
  const lang = useStore(state => state.lang)
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en

  const faqGroups = [
    {
      labelDa: 'Adgang',
      labelEn: 'Access',
      items: [
        { q: t('faq_q1'), a: t('faq_a1') },
        { q: t('faq_q3'), a: t('faq_a3') },
      ]
    },
    {
      labelDa: 'Systemer',
      labelEn: 'Systems',
      items: [
        { q: t('faq_q2'), a: t('faq_a2') },
        { q: t('faq_q4'), a: t('faq_a4') },
      ]
    },
    {
      labelDa: 'Udstyr og drift',
      labelEn: 'Equipment & operations',
      items: [
        { q: t('faq_q5'), a: t('faq_a5') },
        { q: t('faq_q6'), a: t('faq_a6') },
        { q: t('faq_q7'), a: t('faq_a7') },
      ]
    },
  ]

  return (
    <Card>
      <SectionHeader
        title={t('faq')}
        level={2}
        className="mb-xs"
      />
      <Stack gap="md">
        {faqGroups.map((group, gi) => (
          <div key={gi}>
            <div className="text-xs font-bold uppercase tracking-wider text-text-muted px-xs mb-xs pt-xs select-none">
              {l(group.labelDa, group.labelEn)}
            </div>
            <AccordionWrapper>
              {group.items.map((faq, ii) => {
                const actionKey = `${gi}-${ii}`
                const action = FAQ_ACTIONS[actionKey]
                return (
                  <AccordionItemRow key={actionKey} value={`faq-${gi}-${ii}`} title={faq.q}>
                    <Text size="sm" className="text-text-muted leading-relaxed pb-sm">{linkifyText(faq.a)}</Text>
                    {action && (
                      <a
                         href={action.href}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-flex items-center gap-3xs text-xs font-semibold text-primary hover:underline mt-2xs mb-sm"
                      >
                        {l(action.labelDa, action.labelEn)}
                        <ExternalLink size={11} strokeWidth={2} />
                      </a>
                    )}
                  </AccordionItemRow>
                )
              })}
            </AccordionWrapper>
          </div>
        ))}
      </Stack>
    </Card>
  )
})

// ==========================================
// LocalDesksSection
// ==========================================

const LocalDesksSection = memo(function LocalDesksSection() {
  const t = useStore(state => state.t)
  const localize = useStore(state => state.localize)
  const lang = useStore(state => state.lang)
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en

  return (
    <Stack gap="md">
      <Card>
        <SectionHeader
          title={t('find_local_service_desk')}
          level={2}
          className="mb-sm"
        />
        <Text size="xs" className="text-muted mb-sm px-md">{t('local_desk_helper')}</Text>
        <AccordionWrapper>
          {supportLocations.map((loc, i) => (
            <AccordionItemRow key={`loc-${i}`} value={loc.city} title={loc.city}>
              <Stack gap="md" className="pb-sm">
                {/* Adresse */}
                <div>
                  <Text size="2xs" weight="bold" muted className="uppercase tracking-wider mb-3xs">{l('Adresse', 'Address')}</Text>
                  <Text size="sm" className="text-main">{loc.address}</Text>
                  <Text size="xs" className="text-muted">{loc.zip}</Text>
                  {loc.mapUrl && (
                    <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3xs text-xs font-semibold text-primary hover:underline mt-3xs">
                      <MapPin size={12} strokeWidth={2} />
                      {l('Vis på kort', 'Show on map')}
                    </a>
                  )}
                </div>

                {/* Kontakt */}
                {loc.phone && (
                  <div>
                    <Text size="2xs" weight="bold" muted className="uppercase tracking-wider mb-3xs">{l('Kontakt', 'Contact')}</Text>
                    <a href={`tel:${loc.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-xs text-sm font-semibold text-primary hover:underline">
                      <Phone size={14} strokeWidth={2} className="shrink-0" />
                      {loc.phone}
                    </a>
                  </div>
                )}

                {/* Åbningstid */}
                <div>
                  <Text size="2xs" weight="bold" muted className="uppercase tracking-wider mb-3xs">{t('opening_hours_service_desk')}</Text>
                  <Stack gap="2xs">
                    {supportDeskHours.map((oh, j) => (
                      <KeyValue
                        key={j}
                        label={localize(oh, 'days')}
                        value={oh.hours}
                        divider={false}
                        className="text-sm"
                      />
                    ))}
                  </Stack>
                </div>
              </Stack>
            </AccordionItemRow>
          ))}
        </AccordionWrapper>
        <div className="border-t border-border/40 pt-md mt-md px-md pb-xs">
          <Heading level={3} className="text-sm font-bold mb-xs">{t('special_opening_hours')}</Heading>
          <Stack gap="sm" className="divide-y divide-border/40 [&>div:not(:first-child)]:pt-sm">
            <div className="flex items-start gap-sm">
              <span className="shrink-0 px-2xs py-3xs text-[10px] font-bold uppercase tracking-wider rounded bg-warning/10 text-warning border border-warning/20">{t('low_service_days')}</span>
              <Text size="sm" className="text-muted">{localize(supportNotes, 'specialDays')}</Text>
            </div>
            <div className="flex items-start gap-sm">
              <span className="shrink-0 px-2xs py-3xs text-[10px] font-bold uppercase tracking-wider rounded bg-info/10 text-info border border-info/20">{t('july_month')}</span>
              <Text size="sm" className="text-muted">{localize(supportNotes, 'july')}</Text>
            </div>
            <div className="flex items-start gap-sm">
              <span className="shrink-0 px-2xs py-3xs text-[10px] font-bold uppercase tracking-wider rounded bg-primary/10 text-primary border border-primary/20">{t('christmas_ny')}</span>
              <Text size="sm" className="text-muted">{localize(supportNotes, 'christmas')}</Text>
            </div>
          </Stack>
        </div>
      </Card>
    </Stack>
  )
})

// ==========================================
// SupportSidebar
// ==========================================

interface SupportSidebarProps {
  children?: React.ReactNode
}

const SupportSidebar = memo(function SupportSidebar({ children }: SupportSidebarProps) {
  const t = useStore(state => state.t)
  const lang = useStore(state => state.lang)
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en

  return (
    <aside className="support-sidebar flex flex-col gap-lg">
      {/* Group 1: Kontakt */}
      <div>
        <SectionHeader
          title={l('Kontakt', 'Contact')}
          level={3}
        />
        <Stack gap="xs">
          {children}
          <a
            href="tel:+4599402020"
            className="flex items-center justify-between gap-xs p-md rounded-[var(--radius-md)] border border-border bg-bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group"
          >
            <Stack gap="2xs">
              <Text size="sm" weight="bold" className="text-main">+45 9940 2020</Text>
              <Text size="2xs" muted>{l('Man–fre 08:00–15:00', 'Mon–Fri 08:00–15:00')}</Text>
            </Stack>
            <Phone size={18} strokeWidth={2} className="text-primary shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        </Stack>
      </div>

      {/* Group 2: Selvhjælp */}
      <div>
        <SectionHeader
          title={l('Selvhjælp', 'Self-help')}
          level={3}
        />
        <Card>
          <Card.Body padding="compact">
            <Text size="xs" weight="bold" className="text-muted uppercase tracking-wider mb-xs">{t('guides')}</Text>
            {[
              { label: t('guide_overview'), url: 'https://www.en.aau.dk/digital-identity/moodle/' },
              { label: t('guide_students'), url: 'https://www.en.aau.dk/digital-identity/moodle/' },
              { label: t('guide_teachers'), url: 'https://www.en.aau.dk/digital-identity/moodle/' },
              { label: t('guide_staff'), url: 'https://www.en.aau.dk/digital-identity/moodle/' },
            ].map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2xs px-xs text-sm text-primary hover:underline underline-offset-2 rounded-md hover:bg-bg-hover transition-colors group"
              >
                {item.label}
                <ChevronRight size={14} className="shrink-0 text-muted opacity-0 group-hover:opacity-40 transition-opacity" />
              </a>
            ))}
            <div className="border-t border-border mt-xs pt-xs">
              <Text size="xs" weight="bold" className="text-muted uppercase tracking-wider mb-3xs">{t('self_service')}</Text>
              <Button variant="ghost" size="sm" icon={ShieldHalf} className="justify-start text-primary hover:underline underline-offset-2 w-full">
                {t('gdpr_faq')}
              </Button>
              <Button variant="ghost" size="sm" icon={Monitor} className="justify-start text-primary hover:underline underline-offset-2 w-full">
                {t('it_support_portal')}
              </Button>
              <Button variant="ghost" size="sm" icon={Signal} className="justify-start text-primary hover:underline underline-offset-2 w-full">
                {t('system_status')}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Group 3: Status */}
      <div>
        <SectionHeader
          title={l('Status', 'Status')}
          level={3}
        />
        <Card>
          <Card.Body padding="compact">
            <Stack gap="sm">
              <Stack direction="row" align="center" gap="xs">
                <span className="w-2 h-2 rounded-full bg-muted shrink-0" />
                <Text size="sm" className="text-muted">
                  {l('Chat: Lukket nu · Åbner mandag kl. 08:00', 'Chat: Closed now · Opens Monday 08:00')}
                </Text>
              </Stack>
            </Stack>
          </Card.Body>
        </Card>
      </div>

      {/* Group 4: Kontaktoplysninger (collapsed by default) */}
      <details className="group">
        <summary className="flex items-center gap-xs text-sm font-bold text-muted cursor-pointer py-xs px-xs rounded-md hover:bg-bg-hover transition-colors [&::-webkit-details-marker]:hidden">
          <ChevronRight size={14} className="shrink-0 transition-transform duration-200 group-open:rotate-90" />
          {l('Kontaktoplysninger', 'Contact Information')}
        </summary>
        <div className="pt-sm pb-xs px-xs">
          <Card className="bg-subtle">
            <Card.Body padding="compact">
              <Heading level={3} className="mb-xs text-sm text-main">
                <MapPin size={16} strokeWidth={2} className="inline mr-2xs align-text-bottom text-muted" />
                {t('main_office')}
              </Heading>
              <Text size="sm" className="text-muted leading-relaxed">
                Fredrik Bajers Vej 7K<br />
                9220 Aalborg Ø<br />
                <a href="tel:+4599402020" className="text-primary hover:underline flex items-center gap-sm mt-2xs">
                  <Phone size={14} strokeWidth={2} /> Tlf.: 9940 2020
                </a>
                <a href="mailto:aau@aau.dk" className="text-primary hover:underline flex items-center gap-sm mt-2xs">
                  <Mail size={14} strokeWidth={2} /> aau@aau.dk
                </a>
              </Text>
            </Card.Body>
          </Card>
        </div>
      </details>
    </aside>
  )
})

// ==========================================
// TriageSection
// ==========================================

interface TriageOption {
  id: string
  icon: typeof AlertTriangle
  titleDa: string
  titleEn: string
  descDa: string
  descEn: string
  metaDa: string
  metaEn: string
  ctaDa: string
  ctaEn: string
  href?: string
  onClick?: () => void
}

const TriageSection = memo(function TriageSection() {
  const lang = useStore(state => state.lang)
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en

  const handleCall = useCallback(() => {
    window.location.href = 'tel:+4599402020'
  }, [])

  const handleServicePortal = useCallback(() => {
    window.open('https://serviceportal.aau.dk', '_blank', 'noopener,noreferrer')
  }, [])

  const handleExamSelfService = useCallback(() => {
    window.open('https://eksamen.aau.dk', '_blank', 'noopener,noreferrer')
  }, [])

  const handleContact = useCallback(() => {
    window.location.href = 'mailto:aau@aau.dk'
  }, [])

  const options: TriageOption[] = [
    {
      id: 'akut',
      icon: AlertTriangle,
      titleDa: 'Akut problem',
      titleEn: 'Urgent issue',
      descDa: 'Adgangsfejl, systemnede, presserende',
      descEn: 'Access errors, system down, urgent',
      metaDa: '+45 9940 2020 · Man–fre 08:00–15:00',
      metaEn: '+45 9940 2020 · Mon–Fri 08:00–15:00',
      ctaDa: 'Ring op',
      ctaEn: 'Call now',
      onClick: handleCall,
    },
    {
      id: 'login',
      icon: Lock,
      titleDa: 'Login eller adgang',
      titleEn: 'Login or access',
      descDa: 'Nulstil password, brugeradministration',
      descEn: 'Reset password, user administration',
      metaDa: 'Kræver AAU login',
      metaEn: 'Requires AAU login',
      ctaDa: 'Åbn portal',
      ctaEn: 'Open portal',
      onClick: handleServicePortal,
    },
    {
      id: 'eksamen',
      icon: GraduationCap,
      titleDa: 'Eksamenssystemer',
      titleEn: 'Exam systems',
      descDa: 'Digital Eksamen, STADS, karakterer',
      descEn: 'Digital Exam, STADS, grades',
      metaDa: '',
      metaEn: '',
      ctaDa: 'Se selvbetjening',
      ctaEn: 'Self-service',
      onClick: handleExamSelfService,
    },
    {
      id: 'ikke-akut',
      icon: MessageSquare,
      titleDa: 'Ikke akut',
      titleEn: 'Non-urgent',
      descDa: 'Svar inden for 1–2 hverdage',
      descEn: 'Reply within 1–2 business days',
      metaDa: '',
      metaEn: '',
      ctaDa: 'Send besked',
      ctaEn: 'Send message',
      onClick: handleContact,
    },
  ]

  return (
    <section className="triage-section">
      <SectionHeader
        title={l('Hvad har du brug for hjælp til?', 'What do you need help with?')}
        subtitle={l('Vælg den hurtigste vej til hjælp', 'Choose the fastest way to get help')}
        level={2}
        className="mb-lg"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        {options.map((option) => {
          const Icon = option.icon
          return (
            <Card
              key={option.id}
              interactive
              className="transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
              onClick={option.onClick}
            >
              <Card.Body>
                <Stack gap="sm">
                  <Stack direction="row" align="center" gap="sm">
                    <span className="p-xs rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon size={20} strokeWidth={2} />
                    </span>
                    <Heading level={4} className="m-0 text-sm font-semibold">
                      {l(option.titleDa, option.titleEn)}
                    </Heading>
                  </Stack>
                  <Text size="sm" muted className="leading-relaxed">
                    {l(option.descDa, option.descEn)}
                  </Text>
                  {option.metaDa && (
                    <Text size="xs" muted className="leading-relaxed">
                      {l(option.metaDa, option.metaEn)}
                    </Text>
                  )}
                  <div className="mt-auto pt-sm">
                    <Button size="md" variant="primary" className="w-full sm:w-auto font-bold">
                      {l(option.ctaDa, option.ctaEn)}
                      {option.id === 'login' || option.id === 'eksamen' ? (
                        <ExternalLink size={14} className="ml-2xs" />
                      ) : null}
                    </Button>
                  </div>
                </Stack>
              </Card.Body>
            </Card>
          )
        })}
      </div>
    </section>
  )
})

// ==========================================
// Exports
// ==========================================

export { ContactForm, FaqSection, LocalDesksSection, SupportSidebar, TriageSection }
