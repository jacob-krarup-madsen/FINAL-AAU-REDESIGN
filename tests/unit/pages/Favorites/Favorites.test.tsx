import { MemoryRouter } from 'react-router-dom';
import useStore from '@/store';
import Favorites from '@/pages/Favorites';

describe('Favorites Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useStore.setState({ lang: 'en', favorites: [] })
  })

  afterEach(() => {
    useStore.setState({ lang: 'da', favorites: [] })
  })

  it('renders course favorites', () => {
    const courseId = 1
    useStore.setState({
      lang: 'en',
      favorites: [{ id: 'fav1', type: 'course', entityId: courseId, order: 0, addedAt: Date.now() }],
    })
    render(
      <MemoryRouter>
        <Favorites />
      </MemoryRouter>
    )
    const s = useStore.getState()
    const course = s.courses.find(c => c.id === courseId)
    expect(course?.titleEn).toBe('Digital Design and Communication')
    expect(screen.getByText('Digital Design and Communication')).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`1/${s.favoritesLimit}`))).toBeInTheDocument()
  })
})