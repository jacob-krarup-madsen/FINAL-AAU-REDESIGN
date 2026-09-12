import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/setup/test-utils'
import useStore from '@/store'
import { ForumWidget } from '@/components/Widgets'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('ForumWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useStore.setState({ lang: 'da' })
  })

  it('renders correctly', () => {
    renderWithProviders(<ForumWidget professor="Prof. Hansen" />)
    expect(screen.getByText('Kursusforum')).toBeInTheDocument()
    expect(screen.getByText('Spørgsmål til litteraturen i uge 2')).toBeInTheDocument()
    expect(screen.getByText('Prof. Hansen')).toBeInTheDocument()
  })

  it('renders correctly in English', () => {
    useStore.setState({ lang: 'en' })
    renderWithProviders(<ForumWidget professor="Prof. Hansen" />)
    expect(screen.getByText('Questions regarding literature week 2')).toBeInTheDocument()
    expect(screen.getByText('Prof. Hansen')).toBeInTheDocument()
  })

  it('renders 3 forum posts', () => {
    renderWithProviders(<ForumWidget professor="Prof. Hansen" />)
    const replyCounts = document.querySelectorAll('.forum-list-item__reply-count')
    expect(replyCounts.length).toBe(3)
  })

  it('shows important badge for important posts', () => {
    renderWithProviders(<ForumWidget professor="Prof. Hansen" />)
    expect(screen.getByText('Vigtigt')).toBeInTheDocument()
  })

  it('navigates to forum post when post is clicked', () => {
    renderWithProviders(<ForumWidget professor="Prof. Hansen" />)
    const item = screen.getByText('Spørgsmål til litteraturen i uge 2')
    fireEvent.click(item)
    expect(mockNavigate).toHaveBeenCalledWith('/forum/501')
  })

  it('navigates to new post when button is clicked', () => {
    renderWithProviders(<ForumWidget professor="Prof. Hansen" />)
    const btn = screen.getByRole('button', { name: /nyt indlæg/i })
    fireEvent.click(btn)
    expect(mockNavigate).toHaveBeenCalledWith('/forum/new')
  })

  it('navigates to forum page when "se_all" is clicked', () => {
    renderWithProviders(<ForumWidget professor="Prof. Hansen" />)
    const btn = screen.getByRole('button', { name: /se alle/i })
    fireEvent.click(btn)
    expect(mockNavigate).toHaveBeenCalledWith('/forum')
  })
})
