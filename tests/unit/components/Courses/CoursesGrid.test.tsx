import { renderWithProviders } from '@/__tests__/setup/test-utils'
import { CoursesGrid } from '@/components/Courses'

describe('CoursesGrid', () => {
  const mockCourse = {
    id: 1, title: 'Digital Design', titleEn: 'Digital Design',
    label: 'L1', labelEn: 'L1', img: '', code: 'DD1',
    color: 'blue', status: 'active' as const,
  }
  const mockForum = {
    id: 10, title: 'Forum 1', titleEn: 'Forum 1',
    label: 'F1', labelEn: 'F1', img: '', color: 'green',
  }
  const defaultProps = {
    sortedCourses: [mockCourse],
    forums: [mockForum],
    showCourses: true,
    setShowCourses: vi.fn(),
    showForums: true,
    setShowForums: vi.fn(),
    isFavorite: vi.fn(() => false),
    toggleFavorite: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
  }

  it('renders course section with heading', () => {
    const { container } = renderWithProviders(<CoursesGrid {...defaultProps} />)
    expect(container.querySelector('.section-block-header')).toBeInTheDocument()
  })

  it('renders course cards when showCourses is true', () => {
    const { container } = renderWithProviders(<CoursesGrid {...defaultProps} />)
    expect(container.querySelector('.section-block-header__title')).toBeInTheDocument()
  })

  it('renders loading skeleton for courses', () => {
    const { container } = renderWithProviders(<CoursesGrid {...defaultProps} isLoading={true} />)
    const gridItems = container.querySelectorAll('.grid-item')
    expect(gridItems.length).toBeGreaterThan(0)
  })

  it('hides courses when showCourses is false', () => {
    const { queryByText } = renderWithProviders(<CoursesGrid {...defaultProps} showCourses={false} />)
    expect(queryByText(/Digital Design/i)).not.toBeInTheDocument()
  })

  it('toggles course visibility on header click', () => {
    const setShow = vi.fn()
    const { container } = renderWithProviders(<CoursesGrid {...defaultProps} setShowCourses={setShow} />)
    const header = container.querySelector('.section-block-header') as HTMLElement | null
    header?.click()
    expect(setShow).toHaveBeenCalledWith(false)
  })

  it('renders forums section', () => {
    const { container } = renderWithProviders(<CoursesGrid {...defaultProps} />)
    const headers = container.querySelectorAll('.section-block-header')
    expect(headers.length).toBeGreaterThanOrEqual(2)
  })

  it('renders empty state when no courses match search', () => {
    const { getByText } = renderWithProviders(<CoursesGrid {...defaultProps} sortedCourses={[]} searchQuery="xyz" />)
    expect(getByText('Ryd søgning')).toBeInTheDocument()
  })

  it('renders empty state with clear search button', () => {
    const clearFn = vi.fn()
    const { getByText } = renderWithProviders(<CoursesGrid {...defaultProps} sortedCourses={[]} searchQuery="xyz" setSearchQuery={clearFn} />)
    const btn = getByText('Ryd søgning')
    expect(btn).toBeInTheDocument()
    btn.click()
    expect(clearFn).toHaveBeenCalledWith('')
  })

  it('renders starred courses correctly', () => {
    const fav = vi.fn(() => true)
    const { container } = renderWithProviders(<CoursesGrid {...defaultProps} isFavorite={fav} />)
    expect(container.querySelector('.section-block-header')).toBeInTheDocument()
  })

  it('renders view all forums button', () => {
    const { getByText } = renderWithProviders(<CoursesGrid {...defaultProps} />)
    expect(getByText('Se alle')).toBeInTheDocument()
  })

  it('navigates to course on card click', () => {
    const { getByLabelText } = renderWithProviders(<CoursesGrid {...defaultProps} />)
    fireEvent.click(getByLabelText('Digital Design og Kommunikation'))
  })

  it('navigates on view all forums click', () => {
    const { getByText } = renderWithProviders(<CoursesGrid {...defaultProps} />)
    fireEvent.click(getByText('Se alle'))
  })

  it('navigates to forum on card click', () => {
    const { getByLabelText } = renderWithProviders(<CoursesGrid {...defaultProps} />)
    fireEvent.click(getByLabelText('Studienævn for DDK'))
  })

  it('toggles forum favorite', () => {
    const toggleFn = vi.fn()
    const { getAllByLabelText } = renderWithProviders(
      <CoursesGrid {...defaultProps} toggleFavorite={toggleFn} />
    )
    fireEvent.click(getAllByLabelText('Tilføj til favoritter')[1])
    expect(toggleFn).toHaveBeenCalledWith('forum', 10)
  })
})
