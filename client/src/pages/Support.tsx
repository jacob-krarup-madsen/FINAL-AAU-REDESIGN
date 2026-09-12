import { useState } from 'react';
import { Phone, Globe, ExternalLink } from 'lucide-react';
import { Grid, PageLayout, Stack } from '@/components/Layout';
import { Text, useToast } from '@/components/ui';

import { submitSupportTicket } from '@/lib/api';
import useStore from '@/store';
import { FaqSection, LocalDesksSection, ContactForm, SupportSidebar, TriageSection } from '@/components/Support';

function Support() {
  const t = useStore(state => state.t)
  const lang = useStore(state => state.lang)
  const l = (da: string, en: string) => lang === 'da' ? da : en
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ subject: boolean; description: boolean }>({ subject: false, description: false })

  const handleSendSupport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const errors = { subject: !subject.trim(), description: !description.trim() }
    setFieldErrors(errors)

    if (errors.subject || errors.description) {
        toast.error(t('support.fill_all'))
      return
    }

    setIsSubmitting(true)
    try {
      await submitSupportTicket({ subject, description })
      toast.success(t('support.message_sent'))
      setSubject('')
      setDescription('')
      setIsFormOpen(false)
    } catch {
      toast.error(t('support.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelForm = () => {
    setIsFormOpen(false)
    setSubject('')
    setDescription('')
    setFieldErrors({ subject: false, description: false })
  }

  return (
    <PageLayout
      className="support-page relative animate-fade-in"
      flat
      pageKey="support"
      title={t('support_page_title')}
      subtitle={t('support_page_subtitle')}
      breadcrumbs={[{ label: t('dashboard'), href: '/' }, { label: t('support') }]}
    >

      <div className="container pb-lg">
        <Grid>
          <Grid.Item span={7}>
            <Stack gap="md">
              <TriageSection />
              <div className="flex flex-wrap gap-sm items-center pt-xs pb-xs">
                <Text size="xs" weight="bold" muted className="uppercase tracking-wider shrink-0">{l('Hurtige kontaktveje', 'Quick contacts')}</Text>
                <a href="tel:+4599402020" className="inline-flex items-center gap-xs px-md py-xs rounded-[var(--radius-md)] border border-border bg-bg-card text-sm font-semibold text-main hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <Phone size={14} />
                  <span>+45 9940 2020</span>
                  <Text size="2xs" muted className="hidden sm:inline">· {l('Man–fre 08:00–15:00', 'Mon–Fri 08:00–15:00')}</Text>
                </a>
                <a href="https://serviceportal.aau.dk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-xs px-md py-xs rounded-[var(--radius-md)] border border-border bg-bg-card text-sm font-semibold text-main hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <Globe size={14} />
                  <span>{l('Serviceportal', 'Service Portal')}</span>
                  <ExternalLink size={12} className="text-muted" />
                </a>
              </div>

              <FaqSection />

              <LocalDesksSection />
            </Stack>
          </Grid.Item>

          <Grid.Item span={5} className="min-w-0 overflow-visible">
            <SupportSidebar>
              <ContactForm
                subject={subject}
                setSubject={setSubject}
                description={description}
                setDescription={setDescription}
                isFormOpen={isFormOpen}
                setIsFormOpen={setIsFormOpen}
                isSubmitting={isSubmitting}
                fieldErrors={fieldErrors}
                onSubmit={handleSendSupport}
                onCancel={cancelForm}
              />
            </SupportSidebar>
          </Grid.Item>
        </Grid>
      </div>
    </PageLayout>
  )
}

export default Support
