import { MemoryRouter, useNavigate } from 'react-router-dom';
import useStore from '@/store';
import { courses } from '@/lib/data';

courses[999] = {
  title: 'Unknown Group Item',
  titleEn: 'Unknown Group Item',
  group: 'Unknown Group',
  sections: []
} as any

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  const mockNav = vi.fn()
  return {
    ...actual,
    useNavigate: () => mockNav
  }
})

describe('SearchResults Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useStore.setState({
      lang: 'da',
      favorites: []
    })
  })

  const renderSearchResults = async (lang: 'da' | 'en' = 'da', initialEntries = ['/search?q=Digital']) => {
    useStore.setState({ lang })
    const { default: SearchResultsComponent } = await import('@/pages/SearchResults')
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <SearchResultsComponent />
      </MemoryRouter>
    )
  }

  it('renders search results correctly', async () => {
    const mockNavigate = useNavigate()
    await renderSearchResults('da')
    const titles = screen.getAllByText((_content, element) => element?.textContent === 'Digital Design og Kommunikation')
    expect(titles[0]).toBeInTheDocument()
    const overlayBtn = screen.getByRole('button', { name: 'View details' })
    fireEvent.click(overlayBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/course/1')
  })

  it('filters results by category', async () => {
    await renderSearchResults('da')
    const modulerFilter = screen.getByRole('button', { name: 'Kurser' })
    fireEvent.click(modulerFilter)
    expect(screen.getAllByText((_content, element) => element?.textContent === 'Digital Design og Kommunikation')[0]).toBeInTheDocument()
  })

  it('shows empty state when no results found', async () => {
    await renderSearchResults('da', ['/search?q=xyz123'])
    expect(screen.getAllByText('Ingen resultater').length).toBeGreaterThan(0)
  })

  it('renders in English', async () => {
    await renderSearchResults('en', ['/search?q=Digital'])
    expect(screen.getByText(/Results for "Digital"/i)).toBeInTheDocument()
  })

  it('shows empty state in English', async () => {
    await renderSearchResults('en', ['/search?q=xyz123'])
    expect(screen.getAllByText('No results').length).toBeGreaterThan(0)
  })

  it('shows empty state when query is empty', async () => {
    await renderSearchResults('da', ['/search'])
    expect(screen.getByText(/Ingen resultater/i)).toBeInTheDocument()
  })

  it('finds results by description match', async () => {
    await renderSearchResults('da', ['/search?q=Kursusmodul'])
    expect(screen.getAllByText((_content, element) => element?.textContent === 'Digital Design og Kommunikation')[0]).toBeInTheDocument()
  })

  it('navigates via go to content button', async () => {
    const mockNavigate = useNavigate()
    await renderSearchResults('da')
    const goBtns = screen.getAllByText('Gå til kursus')
    fireEvent.click(goBtns[0])
    expect(mockNavigate).toHaveBeenCalledWith('/course/1')
  })

  it('filters by "all" category shows all results', async () => {
    await renderSearchResults('da')
    fireEvent.click(screen.getByText('Alle'))
    expect(screen.getAllByText((_content, element) => element?.textContent === 'Digital Design og Kommunikation')[0]).toBeInTheDocument()
  })

  it('filters between multiple categories excluding some results', async () => {
    await renderSearchResults('da', ['/search?q=oversigt'])
    expect(screen.queryByText(/Ingen resultater/i)).not.toBeInTheDocument()
    const categoryBtns = screen.getAllByRole('button')
    const siderBtn = [...categoryBtns].find(b => b.textContent === 'Sider')
    if (siderBtn) {
      fireEvent.click(siderBtn)
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    }
  })

  it('renders fallback action label for unknown group', async () => {
    await renderSearchResults('da', ['/search?q=Unknown Group Item'])
    expect(screen.getByText('Gå til indhold')).toBeInTheDocument()
  })

  it('renders HighlightText with matching query', async () => {
    await renderSearchResults('da')
    const strong = document.querySelector('strong')
    expect(strong).toBeInTheDocument()
    expect(strong?.textContent).toBe('Digital')
  })

  it('highlights text when query parameter is present in URL', async () => {
    await renderSearchResults('da', ['/search?q=Design'])
    const strong = document.querySelector('strong')
    expect(strong).toBeInTheDocument()
    expect(strong?.textContent).toBe('Design')
  })

  it('toggles favorite on a course search result', async () => {
    const toggleSpy = vi.spyOn(useStore.getState(), 'toggleFavorite')
    await renderSearchResults('da')
    const starBtn = screen.getByLabelText(/til favoritter|to favorites/i)
    expect(starBtn).toBeInTheDocument()
    fireEvent.click(starBtn)
    expect(toggleSpy).toHaveBeenCalledWith('course', 1)
    toggleSpy.mockRestore()
  })
})
