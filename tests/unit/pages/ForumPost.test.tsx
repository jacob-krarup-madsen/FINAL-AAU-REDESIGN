import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom'
import ForumPost from '@/pages/ForumPost'
import useStore from '@/store'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: vi.fn(),
  }
})

const renderForumPost = (id = '1') => {
  vi.mocked(useParams).mockReturnValue({ id })
  return render(
    <MemoryRouter initialEntries={[`/forum/${id}`]}>
      <Routes>
        <Route path="/forum/:id" element={<ForumPost />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ForumPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useStore.setState({ lang: 'da', t: (key: string) => key })
  })

  it('renders post content for a valid ID', () => {
    renderForumPost('1')
    expect(screen.getAllByText(/Spørgsmål til litteraturen i uge 2/i).length).toBeGreaterThan(0)
  })

  it('renders not found for invalid ID', () => {
    renderForumPost('999')
    expect(screen.getByText('forum_post_not_found')).toBeInTheDocument()
  })

  it('renders author and timestamp', () => {
    renderForumPost('1')
    expect(screen.getAllByText(/Mads Mikkelsen/i).length).toBeGreaterThan(0)
  })

  it('renders replies for a post with replies', () => {
    renderForumPost('1')
    expect(screen.getByText(/Anders Nielsen/i)).toBeInTheDocument()
  })

  it('renders in English', () => {
    useStore.setState({ lang: 'en' })
    renderForumPost('1')
    expect(screen.getAllByText(/Questions regarding literature week 2/i).length).toBeGreaterThan(0)
  })

  it('renders back link', () => {
    renderForumPost('1')
    expect(screen.getByText('back_to_forum')).toBeInTheDocument()
  })
})
