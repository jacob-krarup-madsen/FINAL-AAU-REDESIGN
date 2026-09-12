import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Topbar } from '@/components/Layout';
import useStore from '@/store';

const mockNavigate = vi.fn();
if (typeof globalThis !== 'undefined') {
  (globalThis as any).mockNavigate = mockNavigate;
} else if (typeof global !== 'undefined') {
  (global as any).mockNavigate = mockNavigate;
} else if (typeof window !== 'undefined') {
  (window as any).mockNavigate = mockNavigate;
}

describe('Topbar', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.clearAllMocks()
    mockNavigate.mockReset()
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).mockNavigate = mockNavigate
    } else if (typeof global !== 'undefined') {
      (global as any).mockNavigate = mockNavigate
    }
    useStore.setState({
      theme: 'system',
      isDarkMode: false,
      lang: 'da',
      t: (key: string) => key,
      isCollapsed: false,
      courses: [
        { id: 1, title: 'Digital Design og Kommunikation', code: 'DDK1' },
      ] as any,
      notificationCount: 2,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).mockNavigate = undefined
    } else if (typeof global !== 'undefined') {
      (global as any).mockNavigate = undefined
    }
  })

  it('renders search input and trigger buttons', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText('Søg i fag, afleveringer og beskeder...')).toBeInTheDocument()
    expect(screen.getAllByRole('navigation').length).toBeGreaterThan(0)
  })

  it('updates search query and shows dropdown', async () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    const input = document.querySelector('.topbar__search-wrapper input')
    fireEvent.change(input!, { target: { value: 'Digital' } })
    act(() => {
      vi.runAllTimers()
    })
    
    expect(screen.getByText('Digital Design og Kommunikation')).toBeInTheDocument()
    expect(screen.getByText(/1 search_results_singular/i)).toBeInTheDocument()
  })

  it('navigates when a search result is clicked', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    const input = document.querySelector('.topbar__search-wrapper input')
    fireEvent.change(input!, { target: { value: 'Digital' } })
    act(() => {
      vi.runAllTimers()
    })
    
    const result = screen.getByText('Digital Design og Kommunikation')
    fireEvent.click(result)
    
    expect(mockNavigate).toHaveBeenCalledWith('/course/1')
  })

  it('navigates when Enter is pressed in search input', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    const input = document.querySelector('.topbar__search-wrapper input')
    fireEvent.change(input!, { target: { value: 'Test' } })
    fireEvent.keyDown(input!, { key: 'Enter' })
    
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=Test')
  })

  it('opens notifications dropdown when bell is clicked', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    
    const bellBtn = screen.getByLabelText('notifications')
    fireEvent.click(bellBtn)
    
    expect(screen.getByText(/view_all/i)).toBeInTheDocument()
    expect(screen.getByText(/Modul 4: Projektrapport/i)).toBeInTheDocument()
  })

  it('navigates to notifications when a notification is clicked', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    
    const bellBtn = screen.getByLabelText('notifications')
    fireEvent.click(bellBtn)
    
    const notifItem = screen.getByText(/Modul 4: Projektrapport/i)
    fireEvent.click(notifItem)
    
    expect(mockNavigate).toHaveBeenCalledWith('/notifications')
  })

  it('navigates to profile when profile link is clicked', async () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    
    const profile = screen.getByLabelText('user_menu')
    fireEvent.click(profile)
    
    const profileItem = screen.getByText('profile')
    fireEvent.click(profileItem)
    expect(mockNavigate).toHaveBeenCalledWith('/settings?tab=profil')
    await waitFor(() => expect(screen.queryByText('logout')).not.toBeInTheDocument())
  })

  it('closes profile menu when logout is clicked', async () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    
    const profile = screen.getByLabelText('user_menu')
    fireEvent.click(profile)
    
    const logoutItem = screen.getByText('logout')
    fireEvent.click(logoutItem)
    await waitFor(() => expect(screen.queryByText('logout')).not.toBeInTheDocument())
  })

  it('renders default icon for unknown notification type', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    
    const bellBtn = screen.getByLabelText('notifications')
    fireEvent.click(bellBtn)
    
    expect(screen.getByText(/Moodle vedligeholdelse/i)).toBeInTheDocument()
  })

  it('navigates via search dropdown footer', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    const input = document.querySelector('.topbar__search-wrapper input')
    fireEvent.change(input!, { target: { value: 'Digital' } })
    
    const footer = document.querySelector('.search-dropdown-footer')
    fireEvent.click(footer!)
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=Digital')
  })

  it('shows no results message', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    const input = document.querySelector('.topbar__search-wrapper input')
    fireEvent.change(input!, { target: { value: 'NonExistent' } })
    act(() => {
      vi.runAllTimers()
    })
    expect(screen.getByText('no_search_results')).toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', async () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    const input = document.querySelector('.topbar__search-wrapper input')
    fireEvent.change(input!, { target: { value: 'Digital' } })
    act(() => {
      vi.runAllTimers()
    })
    expect(screen.getByText(/1 search_results_singular/i)).toBeInTheDocument()
    
    fireEvent.mouseDown(document.body)
    act(() => {
      vi.runAllTimers()
    })
    await waitFor(() => {
      expect(screen.queryByText(/1 search_results_singular/i)).not.toBeInTheDocument()
    })
  })

  it('renders with collapsed sidebar padding', () => {
    const originalWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1280 })
    useStore.setState({ isCollapsed: true })
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    const nav = screen.getAllByRole('navigation')[0] as HTMLElement
    expect(nav.style.left).toBe('var(--sidebar-collapsed-width)')
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalWidth })
  })

  it('does not close dropdown when clicking inside search', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    const input = document.querySelector('.topbar__search-wrapper input')
    fireEvent.change(input!, { target: { value: 'Digital' } })
    act(() => {
      vi.runAllTimers()
    })
    expect(screen.getByText(/1 search_results_singular/i)).toBeInTheDocument()

    fireEvent.mouseDown(input!)
    expect(screen.getByText(/1 search_results_singular/i)).toBeInTheDocument()
  })

  describe('Automatic Breadcrumbs Fallback', () => {
    it('renders dashboard crumb when pathname is / or /dashboard', () => {
      useStore.setState({ breadcrumbs: [] })
      render(
        <MemoryRouter initialEntries={['/']}>
          <Topbar />
        </MemoryRouter>
      )
      expect(screen.getByText('dashboard')).toBeInTheDocument()
    })

    it('renders dashboard > calendar when pathname is /calendar', () => {
      useStore.setState({ breadcrumbs: [] })
      render(
        <MemoryRouter initialEntries={['/calendar']}>
          <Topbar />
        </MemoryRouter>
      )
      expect(screen.getByText('dashboard')).toBeInTheDocument()
      expect(screen.getByText('calendar')).toBeInTheDocument()
    })

    it('renders dashboard > courses > course title when pathname is /course/1', () => {
      useStore.setState({ breadcrumbs: [] })
      render(
        <MemoryRouter initialEntries={['/course/1']}>
          <Topbar />
        </MemoryRouter>
      )
      expect(screen.getByText('dashboard')).toBeInTheDocument()
      expect(screen.getByText('courses')).toBeInTheDocument()
      expect(screen.getByText('Digital Design og Kommunikation')).toBeInTheDocument()
    })

    it('renders dashboard > courses > course title > submission when pathname is /submission/1/10', () => {
      useStore.setState({ breadcrumbs: [] })
      render(
        <MemoryRouter initialEntries={['/submission/1/10']}>
          <Topbar />
        </MemoryRouter>
      )
      expect(screen.getByText('dashboard')).toBeInTheDocument()
      expect(screen.getByText('courses')).toBeInTheDocument()
      expect(screen.getByText('Digital Design og Kommunikation')).toBeInTheDocument()
      expect(screen.getByText('submission')).toBeInTheDocument()
    })

    it('renders forum thread breadcrumbs', () => {
      useStore.setState({ breadcrumbs: [], lang: 'en' })
      render(
        <MemoryRouter initialEntries={['/forum/1']}>
          <Topbar />
        </MemoryRouter>
      )
      expect(screen.getByText('courses')).toBeInTheDocument()
      expect(screen.getByText('forum_thread')).toBeInTheDocument()
    })

    it('renders Danish forum thread breadcrumbs', () => {
      useStore.setState({ breadcrumbs: [], lang: 'da' })
      render(
        <MemoryRouter initialEntries={['/forum/1']}>
          <Topbar />
        </MemoryRouter>
      )
      expect(screen.getByText('forum_thread')).toBeInTheDocument()
    })

    it('renders breadcrumbs for /courses', () => {
      useStore.setState({ breadcrumbs: [] })
      render(
        <MemoryRouter initialEntries={['/courses']}>
          <Topbar />
        </MemoryRouter>
      )
      expect(screen.getByText('dashboard')).toBeInTheDocument()
      expect(screen.getByText('courses')).toBeInTheDocument()
    })

    const routes = [
      { path: '/settings', label: 'settings' },
      { path: '/messages', label: 'messages' },
      { path: '/support', label: 'support' },
      { path: '/notifications', label: 'notifications' },
      { path: '/resources', label: 'resources' },
      { path: '/search', label: 'search_results' },
    ]

    routes.forEach(({ path, label }) => {
      it(`renders breadcrumbs for ${path}`, () => {
        useStore.setState({ breadcrumbs: [] })
        render(
          <MemoryRouter initialEntries={[path]}>
            <Topbar />
          </MemoryRouter>
        )
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })

    it('renders dynamic fallback for unknown paths', () => {
      useStore.setState({ breadcrumbs: [] })
      render(
        <MemoryRouter initialEntries={['/unknown/path']}>
          <Topbar />
        </MemoryRouter>
      )
      expect(screen.getByText('unknown')).toBeInTheDocument()
      expect(screen.getByText('path')).toBeInTheDocument()
    })

    it('prefers explicit store breadcrumbs over automatic fallback', () => {
      useStore.setState({
        breadcrumbs: [
          { label: 'Explicit Custom Crumb', href: '/custom' },
        ]
      })
      render(
        <MemoryRouter initialEntries={['/calendar']}>
          <Topbar />
        </MemoryRouter>
      )
      expect(screen.getByText('Explicit Custom Crumb')).toBeInTheDocument()
      expect(screen.queryByText('calendar')).not.toBeInTheDocument()
    })

    it('renders breadcrumbs when the pathname is exactly /courses', () => {
      useStore.setState({ breadcrumbs: [] })
      render(
        <MemoryRouter initialEntries={['/courses']}>
          <Topbar />
        </MemoryRouter>
      )
      expect(screen.getByText('dashboard')).toBeInTheDocument()
      expect(screen.getByText('courses')).toBeInTheDocument()
    })
  })

  it('navigates to settings when settings item is clicked in user menu', async () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    
    const profile = screen.getByLabelText('user_menu')
    fireEvent.click(profile)
    
    const settingsItem = screen.getByText('settings')
    fireEvent.click(settingsItem)
    expect(mockNavigate).toHaveBeenCalledWith('/settings')
    await waitFor(() => expect(screen.queryByText('logout')).not.toBeInTheDocument())
  })

  it('navigates to notifications when view_all is clicked in notifications dropdown', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    )
    
    const bellBtn = screen.getByLabelText('notifications')
    fireEvent.click(bellBtn)
    
    const viewAllBtn = screen.getByText('view_all')
    fireEvent.click(viewAllBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/notifications')
  })
})