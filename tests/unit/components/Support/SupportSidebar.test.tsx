import useStore from '@/store'
import { linkifyText } from '@/lib/utils'
import { FaqSection, LocalDesksSection, ContactForm, SupportSidebar } from '@/components/Support'

describe('Support Sections Subcomponents', () => {
  beforeEach(() => {
    useStore.setState({ lang: 'da' })
  })

  describe('FaqSection', () => {
    it('renders FAQs lists', () => {
      render(<FaqSection />)
      expect(screen.getByText('Ofte stillede spørgsmål')).toBeInTheDocument()
      expect(screen.getByText('Hvordan nulstiller jeg min adgangskode?')).toBeInTheDocument()
    })
  })

  describe('LocalDesksSection', () => {
    it('renders desks locations and schedules', () => {
      render(<LocalDesksSection />)
      expect(screen.getByText('Find din lokale servicedesk')).toBeInTheDocument()
      expect(screen.getByText('Aalborg Øst')).toBeInTheDocument()
    })
  })

  describe('ContactForm', () => {
    it('renders write a message button by default', () => {
      const setSubject = vi.fn()
      const setDescription = vi.fn()
      const setIsFormOpen = vi.fn()
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <ContactForm
          subject=""
          setSubject={setSubject}
          description=""
          setDescription={setDescription}
          isFormOpen={false}
          setIsFormOpen={setIsFormOpen}
          isSubmitting={false}
          fieldErrors={{ subject: false, description: false }}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )

      expect(screen.getByRole('button', { name: 'Send besked' })).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Send besked' }))
      expect(setIsFormOpen).toHaveBeenCalledWith(true)
    })

    it('renders form inputs and handles submission when open', () => {
      const setSubject = vi.fn()
      const setDescription = vi.fn()
      const setIsFormOpen = vi.fn()
      const onSubmit = vi.fn()
      const onCancel = vi.fn()

      render(
        <ContactForm
          subject="Test subject"
          setSubject={setSubject}
          description="Test desc"
          setDescription={setDescription}
          isFormOpen={true}
          setIsFormOpen={setIsFormOpen}
          isSubmitting={false}
          fieldErrors={{ subject: false, description: false }}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )

      expect(screen.getByDisplayValue('Test subject')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test desc')).toBeInTheDocument()

      fireEvent.change(screen.getByLabelText('Emne', { exact: false }), { target: { value: 'New Subject' } })
      expect(setSubject).toHaveBeenCalledWith('New Subject')

      const form = screen.getByRole('button', { name: 'Send besked' }).closest('form')
      fireEvent.submit(form!)
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  describe('SupportSidebar', () => {
    it('renders sidebar lists and child elements', () => {
      render(
        <SupportSidebar>
          <div data-testid="child">Child component</div>
        </SupportSidebar>
      )

      expect(screen.getByText('Vejledninger')).toBeInTheDocument()
      expect(screen.getByText('Selvbetjening')).toBeInTheDocument()
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })
  })

  it('linkifyText handles non-http links', () => {
    render(<>{linkifyText('see support.its.aau.dk or http://test.com')}</>)
    const link = screen.getByText('support.its.aau.dk')
    expect(link).toHaveAttribute('href', 'https://support.its.aau.dk')
  })
})
