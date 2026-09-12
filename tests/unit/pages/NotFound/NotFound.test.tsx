import { MemoryRouter } from 'react-router-dom';
import NotFound from '@/pages/NotFound';
import useStore from '@/store';

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderNotFound = (lang: 'da' | 'en' = 'da') => {
  useStore.setState({ lang, t: (key: string) => key })
  return render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>
  )
}

describe('NotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders 404 message', () => {
    renderNotFound('da')
    expect(screen.getByText('page_not_found')).toBeInTheDocument()
    expect(screen.getByText('page_not_found_desc')).toBeInTheDocument()
  })

  it('go to dashboard button navigates to /', () => {
    renderNotFound('da')
    fireEvent.click(screen.getByText('go_to_dashboard'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders FileQuestion icon', () => {
    const { container } = renderNotFound('da')
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('performs search and navigates to search page', () => {
    renderNotFound('da')
    const input = screen.getByPlaceholderText('search_placeholder')
    fireEvent.change(input, { target: { value: 'moodle test' } })
    fireEvent.submit(input.closest('form')!)
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=moodle%20test')
  })

  it('does not navigate on empty search', () => {
    renderNotFound('da')
    const input = screen.getByPlaceholderText('search_placeholder')
    fireEvent.submit(input.closest('form')!)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('navigates to courses when find_modules is clicked', () => {
    renderNotFound('da')
    fireEvent.click(screen.getByText('find_modules'))
    expect(mockNavigate).toHaveBeenCalledWith('/courses')
  })

  it('navigates to support when contact_support is clicked', () => {
    renderNotFound('da')
    fireEvent.click(screen.getByText('contact_support'))
    expect(mockNavigate).toHaveBeenCalledWith('/support')
  })

  it('renders English shortcuts text', () => {
    renderNotFound('en')
    expect(screen.getByText('or_try_shortcuts')).toBeInTheDocument()
  })
})
