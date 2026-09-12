import { ForumRepliesList } from '@/components/Forum'

describe('ForumRepliesList', () => {
  const mockReply = { id: 1, author: 'Test User', roleDa: 'Studerende', roleEn: 'Student', timeDa: 'For 1 time siden', timeEn: '1 hour ago', contentDa: 'Indhold', contentEn: 'Content' }

  it('renders empty state when no replies', () => {
    render(<ForumRepliesList replies={[]} />)
    expect(screen.getByText('Ingen svar endnu.')).toBeInTheDocument()
  })

  it('renders replies when present', () => {
    render(<ForumRepliesList replies={[mockReply]} />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Indhold')).toBeInTheDocument()
  })
})
