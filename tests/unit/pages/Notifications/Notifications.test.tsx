import { MemoryRouter } from 'react-router-dom';
import { waitFor } from '@testing-library/react';
import Notifications from '@/pages/Notifications/index';
import useStore from '@/store';

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Notifications Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const renderNotifications = (lang: 'da' | 'en' = 'da') => {
    useStore.setState({ lang })
    return render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    )
  }

  it('renders notifications correctly', () => {
    renderNotifications('da')
    expect(screen.getAllByText(/Modul 4: Projektrapport v1/i)[0]).toBeInTheDocument()
  })

  it('filters by active and archive', () => {
    renderNotifications('da')
    const tabs = screen.getAllByText('Arkiv')
    const archiveTab = tabs.find(t => t.closest('.notifications-tabs-container'))
    fireEvent.click(archiveTab!)
    expect(screen.getByText('Arkivet er tomt')).toBeInTheDocument()
  })

  it('marks all as read', () => {
    renderNotifications('da')
    const markAllBtn = screen.getByText('Markér alle som læst')
    fireEvent.click(markAllBtn)
    expect(screen.queryByText('Markér alle som læst')).not.toBeInTheDocument()
  })

  it('archives a notification', () => {
    const { container } = renderNotifications('da')
    const actionButtons = container.querySelectorAll('.notification-actions button')
    fireEvent.click(actionButtons[1])
    const tabs = screen.getAllByText('Arkiv')
    const archiveTab = tabs.find(t => t.closest('.notifications-tabs-container'))
    fireEvent.click(archiveTab!)
    expect(screen.getAllByText(/Modul 4: Projektrapport v1/i)[0]).toBeInTheDocument()
  })

  it('renders in English correctly', () => {
    renderNotifications('en')
    expect(screen.getAllByText(/Module 4: Project Report v1/i)[0]).toBeInTheDocument()
    expect(screen.getByText('Mark all as read')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Mark all as read'))
    expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument()
  })

  it('selects a notification and views details', () => {
    renderNotifications('da')
    const notificationItem = screen.getAllByText(/Modul 4: Projektrapport v1/i)[0].closest('.notification-item')!
    fireEvent.click(notificationItem)
    expect(screen.getByText(/Din aflevering "Modul 4: Projektrapport v1" er nu uploadet korrekt/i)).toBeInTheDocument()
  })

  it('navigates to content from notification detail', () => {
    renderNotifications('da')
    const notificationItem = screen.getAllByText(/Modul 4: Projektrapport v1/i)[0].closest('.notification-item')!
    fireEvent.click(notificationItem)
    const goBtn = screen.getByText('Gå til indhold')
    fireEvent.click(goBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/course/1')
  })

  it('marks individual notification as read', () => {
    const { container } = renderNotifications('da')
    const checkButtons = container.querySelectorAll('.notification-actions button[title="Markér som læst"]')
    if (checkButtons.length > 0) {
      fireEvent.click(checkButtons[0])
    }
    const unreadItems = container.querySelectorAll('.notification-item.is-unread')
    expect(unreadItems.length).toBeLessThan(2)
  })

  it('restores a notification from archive', () => {
    const { container } = renderNotifications('da')
    const firstItem = container.querySelectorAll('.notification-item')[0]
    const buttons = firstItem.querySelectorAll('.notification-actions button')
    fireEvent.click(buttons[buttons.length - 1])
    const tabs = screen.getAllByText('Arkiv')
    const archiveTab = tabs.find(t => t.closest('.notifications-tabs-container'))
    fireEvent.click(archiveTab!)
    expect(screen.getAllByText(/Modul 4: Projektrapport v1/i)[0]).toBeInTheDocument()
    const restoreBtns = container.querySelectorAll('.notification-actions button')
    fireEvent.click(restoreBtns[restoreBtns.length - 1])
    const activeTabs = screen.getAllByText('Aktiv')
    const activeTab = activeTabs.find(t => t.closest('.notifications-tabs-container'))
    fireEvent.click(activeTab!)
    expect(screen.getAllByText(/Modul 4: Projektrapport v1/i)[0]).toBeInTheDocument()
  })

  it('renders all notification type labels', () => {
    renderNotifications('da')
    expect(screen.getByText('SYSTEM')).toBeInTheDocument()
    expect(screen.getByText('DEADLINE')).toBeInTheDocument()
    expect(screen.getByText('FEEDBACK')).toBeInTheDocument()
  })

  it('shows empty archive state in English', () => {
    renderNotifications('en')
    fireEvent.click(screen.getByText('Archive'))
    expect(screen.getByText('Archive is empty')).toBeInTheDocument()
  })

  it('shows empty state in active view when all notifications are archived', async () => {
    const { container } = renderNotifications('da')
    for (let i = 0; i < 20; i++) {
      const btn = container.querySelector('.notification-actions button:last-child')
      if (!btn) break
      fireEvent.click(btn)
    }
    await waitFor(() => {
      expect(screen.getByText(/Ingen notifikationer fundet/i)).toBeInTheDocument()
    })
  })

  it('shows empty state in active view with English text', async () => {
    const { container } = renderNotifications('en')
    for (let i = 0; i < 20; i++) {
      const btn = container.querySelector('.notification-actions button:last-child')
      if (!btn) break
      fireEvent.click(btn)
    }
    await waitFor(() => {
      expect(screen.getByText(/No notifications found/i)).toBeInTheDocument()
    })
  })
})
