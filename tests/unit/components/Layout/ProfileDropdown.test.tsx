import { waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/setup/test-utils'
import useStore from '@/store'
import { ProfileDropdown } from '@/components/Layout'

describe('ProfileDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useStore.setState({
      firstName: 'Test User',
      lastName: 'Madsen',
      t: (key: string) => {
        if (key === 'common.user_name') return 'Test User Madsen';
        if (key === 'common.user_role') return 'Studerende';
        return key;
      },
    })
  })

  it('renders the profile trigger button', () => {
    renderWithProviders(<ProfileDropdown />)
    expect(screen.getByLabelText('user_menu')).toBeInTheDocument()
  })

  it('opens dropdown when trigger is clicked', () => {
    renderWithProviders(<ProfileDropdown />)
    const trigger = screen.getByLabelText('user_menu')
    fireEvent.click(trigger)
    expect(screen.getByText('Test User Madsen')).toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', async () => {
    renderWithProviders(
      <div>
        <div data-testid="outside">Outside</div>
        <ProfileDropdown />
      </div>
    )
    const trigger = screen.getByLabelText('user_menu')
    fireEvent.click(trigger)
    expect(screen.getByText('Test User Madsen')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByTestId('outside'))
    await waitFor(() => expect(screen.queryByText('Test User Madsen')).not.toBeInTheDocument())
  })

  it('navigates to settings when settings is clicked', async () => {
    renderWithProviders(<ProfileDropdown />)
    const trigger = screen.getByLabelText('user_menu')
    fireEvent.click(trigger)

    const settingsItem = screen.getByText('settings')
    fireEvent.click(settingsItem)
    await waitFor(() => expect(screen.queryByText('Test User Madsen')).not.toBeInTheDocument())
  })

  it('navigates to profile when profile tab is clicked', async () => {
    renderWithProviders(<ProfileDropdown />)
    const trigger = screen.getByLabelText('user_menu')
    fireEvent.click(trigger)

    const profileItem = screen.getByText('profile')
    fireEvent.click(profileItem)
    await waitFor(() => expect(screen.queryByText('Test User Madsen')).not.toBeInTheDocument())
  })

  it('closes when logout is clicked', async () => {
    renderWithProviders(<ProfileDropdown />)
    const trigger = screen.getByLabelText('user_menu')
    fireEvent.click(trigger)

    const logoutItem = screen.getByText('logout')
    fireEvent.click(logoutItem)
    await waitFor(() => expect(screen.queryByText('Test User Madsen')).not.toBeInTheDocument())
  })

  it('closes on Escape key press', async () => {
    renderWithProviders(<ProfileDropdown />)
    const trigger = screen.getByLabelText('user_menu')
    fireEvent.click(trigger)
    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByText('Test User Madsen')).not.toBeInTheDocument())
  })

  it('calls handleMenuKeyDown on non-Escape key', () => {
    renderWithProviders(<ProfileDropdown />)
    const trigger = screen.getByLabelText('user_menu')
    fireEvent.click(trigger)
    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(screen.getByText('Test User Madsen')).toBeInTheDocument()
  })

  it('falls back to Studerende when user_role is empty', () => {
    useStore.setState({
      firstName: 'Test',
      lastName: 'User',
      t: (key: string) => key === 'common.user_role' ? '' : key,
    })
    renderWithProviders(<ProfileDropdown />)
    const trigger = screen.getByLabelText('user_menu')
    fireEvent.click(trigger)
    expect(screen.getByText('Studerende')).toBeInTheDocument()
  })

  it('toggles language when language option is clicked', () => {
    useStore.setState({ lang: 'da' });
    renderWithProviders(<ProfileDropdown />)
    const trigger = screen.getByLabelText('user_menu')
    fireEvent.click(trigger)

    const langItem = screen.getByText(/cat_select_language/i)
    fireEvent.click(langItem)
    expect(useStore.getState().lang).toBe('en')
  })

  it('toggles theme when theme option is clicked', () => {
    useStore.setState({ theme: 'light' })
    renderWithProviders(<ProfileDropdown />)
    const trigger = screen.getByLabelText('user_menu')
    fireEvent.click(trigger)

    const themeItem = screen.getByText(/appearance/i)
    fireEvent.click(themeItem)
    expect(useStore.getState().theme).toBe('system')
  })

  it('navigates to messages when messages link is clicked', async () => {
    renderWithProviders(<ProfileDropdown />)
    const trigger = screen.getByLabelText('user_menu')
    fireEvent.click(trigger)

    const messagesItem = screen.getByText('nav.messages')
    fireEvent.click(messagesItem)
    await waitFor(() => expect(screen.queryByText('Test User Madsen')).not.toBeInTheDocument())
  })
})

