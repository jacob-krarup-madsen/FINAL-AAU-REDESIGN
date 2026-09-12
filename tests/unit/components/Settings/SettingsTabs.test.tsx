/* eslint-disable @typescript-eslint/no-explicit-any */
import useStore from '@/store'
import { ProfileTab, NotificationsTab, LanguageTab, ForumTab, CalendarTab, MessagesTab } from '@/components/Settings'

let mockToast: any = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}

vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual<typeof import('@/components/ui')>('@/components/ui')
  return {
    ...actual,
    useToast: () => mockToast,
  }
})

describe('Settings Tabs Components', () => {
  beforeEach(() => {
    mockToast = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    }
    useStore.setState({ lang: 'da' })
  })

  describe('ProfileTab', () => {
    beforeEach(() => {
      useStore.setState({
        firstName: 'Test User',
        lastName: 'Madsen',
        theme: 'light',
      })
    })

    it('renders profile fields and stages changes locally', () => {
      render(<ProfileTab />)

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Madsen')).toBeInTheDocument()
      expect(screen.getByText('Skift profilbillede')).toBeInTheDocument()

      const firstInput = screen.getByLabelText('Fornavn')
      fireEvent.change(firstInput, { target: { value: 'NewFirst' } })
      expect((firstInput as HTMLInputElement).value).toBe('NewFirst')

      const darkThemeButton = screen.getByLabelText('Mørk')
      fireEvent.click(darkThemeButton)
      expect(useStore.getState().theme).toBe('dark')
    })

    it('calls onDirtyChange when name fields are modified', () => {
      const onDirtyChange = vi.fn()
      render(<ProfileTab onDirtyChange={onDirtyChange} />)
      expect(onDirtyChange).toHaveBeenCalledWith(false)

      const firstInput = screen.getByLabelText('Fornavn')
      fireEvent.change(firstInput, { target: { value: 'Changed' } })
      expect(onDirtyChange).toHaveBeenCalledWith(true)
    })
  })

  describe('NotificationsTab', () => {
    it('renders notification options and handles switch clicks', () => {
      const setNotifPrefs = vi.fn()
      useStore.setState({
        notifPrefs: { email: true, push: false, sms: false },
        setNotifPrefs,
      })

      render(<NotificationsTab />)

      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Push')).toBeInTheDocument()

      const emailSwitch = screen.getAllByRole('switch')[0]
      fireEvent.click(emailSwitch)
      expect(setNotifPrefs).toHaveBeenCalled()
    })
  })

  describe('LanguageTab', () => {
    it('renders language choices and handles selection', () => {
      const setLang = vi.fn()
      useStore.setState({
        lang: 'da',
        setLang,
      })

      renderWithProviders(<LanguageTab />)

      expect(screen.getByText('Dansk (Danish)')).toBeInTheDocument()
      expect(screen.getByText('English (English)')).toBeInTheDocument()

      fireEvent.click(screen.getByText('English (English)'))
      expect(setLang).toHaveBeenCalledWith('en')
    })
  })

  describe('ForumTab', () => {
    it('renders forum configuration settings and calls handlers', () => {
      const setForumDigest = vi.fn()
      const setForumTracking = vi.fn()
      const setForumAutoSubscribe = vi.fn()
      useStore.setState({
        forumDigest: 'complete',
        forumTracking: true,
        forumAutoSubscribe: false,
        setForumDigest,
        setForumTracking,
        setForumAutoSubscribe,
      })

      render(<ForumTab />)

      expect(screen.getByText('E-mail opsamlingstype')).toBeInTheDocument()

      const noneBtn = screen.getByText('Ingen opsamling')
      fireEvent.click(noneBtn)
      expect(setForumDigest).toHaveBeenCalledWith('none')

      const trackingToggle = screen.getByLabelText('Forumsporing')
      fireEvent.click(trackingToggle)
      expect(setForumTracking).toHaveBeenCalledWith(false)

      const autoSubscribeToggle = screen.getByLabelText('Automatisk abonnement')
      fireEvent.click(autoSubscribeToggle)
      expect(setForumAutoSubscribe).toHaveBeenCalledWith(true)
    })

    it('renders forum tracking toggle in inactive state', () => {
      useStore.setState({ forumTracking: false })
      render(<ForumTab />)
      expect(screen.getByLabelText('Forumsporing')).toBeInTheDocument()
    })
  })

  describe('CalendarTab', () => {
    it('renders calendar dropdown settings and calls handlers', () => {
      const setCalendarStartDay = vi.fn()
      const setCalendarDefaultView = vi.fn()
      useStore.setState({
        calendarStartDay: 'monday',
        calendarDefaultView: 'month',
        setCalendarStartDay,
        setCalendarDefaultView,
      })

      render(<CalendarTab />)

      expect(screen.getByText('Ugens første dag')).toBeInTheDocument()
      expect(screen.getByText('Standard visning')).toBeInTheDocument()

      const startDaySelect = screen.getAllByRole('combobox')[0]
      fireEvent.change(startDaySelect, { target: { value: 'sunday' } })
      expect(setCalendarStartDay).toHaveBeenCalledWith('sunday')

      const defaultViewSelect = screen.getAllByRole('combobox')[1]
      fireEvent.change(defaultViewSelect, { target: { value: 'week' } })
      expect(setCalendarDefaultView).toHaveBeenCalledWith('week')
    })
  })

  describe('MessagesTab', () => {
    it('renders message privacy controls and calls handlers', () => {
      const setMessagePrivacy = vi.fn()
      const setMessageEmailOffline = vi.fn()
      useStore.setState({
        messagePrivacy: 'courses',
        messageEmailOffline: true,
        setMessagePrivacy,
        setMessageEmailOffline,
      })

      render(<MessagesTab />)

      expect(screen.getByText('Hvem kan kontakte mig')).toBeInTheDocument()

      const radio = screen.getByLabelText(/Kun mine kontakter/i)
      fireEvent.click(radio)
      expect(setMessagePrivacy).toHaveBeenCalledWith('contacts')

      const emailSwitch = screen.getByRole('switch')
      fireEvent.click(emailSwitch)
      expect(setMessageEmailOffline).toHaveBeenCalled()
    })

    it('renders message email copies toggle in inactive state', () => {
      useStore.setState({ messageEmailOffline: false })
      render(<MessagesTab />)
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })
  })
})

