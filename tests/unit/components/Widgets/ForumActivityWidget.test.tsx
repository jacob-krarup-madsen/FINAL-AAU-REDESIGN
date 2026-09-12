import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/setup/test-utils'
import { ForumActivityWidget } from '@/components/Widgets'

const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('ForumActivityWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    renderWithProviders(<ForumActivityWidget size="large" />)
    expect(screen.getByText('Forum aktivitet')).toBeInTheDocument()
    expect(screen.getByText('Spørgsmål til teksten')).toBeInTheDocument()
    expect(screen.getByText('Gruppesøgning')).toBeInTheDocument()
    expect(screen.getByText('Pensumliste')).toBeInTheDocument()
  })

  it('renders snippets for all items', () => {
    renderWithProviders(<ForumActivityWidget size="large" />)
    expect(screen.getByText(/Jeg har lagt de nye slides op nu/)).toBeInTheDocument()
  })

  it('navigates to courses when view all is clicked', () => {
    renderWithProviders(<ForumActivityWidget />)
    const btn = screen.getAllByText(/Se alle forumindlæg/i)[0]
    fireEvent.click(btn)
    expect(mockNavigate).toHaveBeenCalledWith('/courses')
  })

  it('navigates to forum post when activity item is clicked', () => {
    renderWithProviders(<ForumActivityWidget />)
    const item = screen.getByText('Spørgsmål til teksten')
    fireEvent.click(item)
    expect(mockNavigate).toHaveBeenCalledWith('/forum/1')
  })
})
