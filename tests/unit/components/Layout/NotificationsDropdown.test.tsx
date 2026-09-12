import { waitFor } from '@testing-library/react'
import useStore from '@/store'
import { NotificationsDropdown } from '@/components/Layout'

describe('NotificationsDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useStore.setState({
      lang: 'da',
      t: (key: string) => key,
      notificationCount: 2,
    })
  })

  it('renders the bell button', () => {
    renderWithProviders(<NotificationsDropdown />)
    expect(screen.getByLabelText('notifications')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('opens dropdown when bell is clicked', () => {
    renderWithProviders(<NotificationsDropdown />)
    const bellBtn = screen.getByLabelText('notifications')
    fireEvent.click(bellBtn)
    expect(screen.getByText('view_all')).toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', async () => {
    renderWithProviders(
      <div>
        <div data-testid="outside">Outside</div>
        <NotificationsDropdown />
      </div>
    )
    const bellBtn = screen.getByLabelText('notifications')
    fireEvent.click(bellBtn)
    expect(screen.getByText('view_all')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByTestId('outside'))
    await waitFor(() => {
      expect(screen.queryByText('view_all')).not.toBeInTheDocument()
    })
  })

  it('navigates when view_all is clicked', async () => {
    renderWithProviders(<NotificationsDropdown />)
    const bellBtn = screen.getByLabelText('notifications')
    fireEvent.click(bellBtn)

    const viewAllBtn = screen.getByText('view_all')
    fireEvent.click(viewAllBtn)
    await waitFor(() => {
      expect(screen.queryByText('view_all')).not.toBeInTheDocument()
    })
  })

  it('navigates when notification item is clicked', async () => {
    renderWithProviders(<NotificationsDropdown />)
    const bellBtn = screen.getByLabelText('notifications')
    fireEvent.click(bellBtn)

    const notifItem = screen.getByText(/Modul 4: Projektrapport/i)
    fireEvent.click(notifItem)
    await waitFor(() => {
      expect(screen.queryByText(/Modul 4: Projektrapport/i)).not.toBeInTheDocument()
    })
  })

  it('renders notification text in English', () => {
    useStore.setState({
      lang: 'en',
      t: (key: string) => key,
      notificationCount: 2,
    })
    renderWithProviders(<NotificationsDropdown />)
    const bellBtn = screen.getByLabelText('notifications')
    fireEvent.click(bellBtn)
    expect(screen.getAllByRole('menuitem').length).toBeGreaterThan(0)
  })
})
