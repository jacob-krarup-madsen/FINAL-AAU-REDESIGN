import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import useStore from '@/store'

vi.mock('@/components/Layout', async () => {
  const actual = await vi.importActual('@/components/Layout')
  return {
    ...actual,
    Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
    Topbar: () => <div data-testid="topbar">Topbar</div>,
    Footer: () => <div data-testid="footer">Footer</div>,
  }
})

const renderLayout = (path = '/') => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Page content</div>} />
          <Route path="/messages" element={<div>Messages page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('Layout', () => {
  beforeEach(() => {
    useStore.setState({
      isCollapsed: false,
      lang: 'da',
    })
  })

  afterEach(() => {
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
  })

  it('renders correctly', () => {
    renderLayout('/')
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('topbar')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('hides footer on messages page', () => {
    renderLayout('/messages')
    expect(screen.getByText('Messages page')).toBeInTheDocument()
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument()
  })
})
