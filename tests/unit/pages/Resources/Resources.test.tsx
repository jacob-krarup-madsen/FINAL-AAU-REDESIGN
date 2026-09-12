import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Resources from '@/pages/Resources';
import useStore from '@/store';

const mockOpen = vi.fn()

const renderWithLang = (lang: 'da' | 'en') => {
  useStore.setState({ lang, favorites: [] })
  return render(
    <MemoryRouter>
      <Resources />
    </MemoryRouter>
  )
}

describe('Resources', () => {
  beforeEach(() => {
    mockOpen.mockClear()
    vi.spyOn(window, 'open').mockImplementation(mockOpen)
  })

  it('renders correctly in Danish', () => {
    renderWithLang('da')
    expect(screen.getAllByText(/Systemer/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Digital Eksamen').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Outlook Mail').length).toBeGreaterThan(0)
    expect(screen.getByText('Kan du ikke finde systemet?')).toBeInTheDocument()
  })

  it('renders correctly in English', () => {
    renderWithLang('en')
    expect(screen.getAllByText(/Systems/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Digital Exam').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Outlook Mail').length).toBeGreaterThan(0)
    expect(screen.getByText("Can't find the system?")).toBeInTheDocument()
  })

  it('tool button opens URL on click', () => {
    renderWithLang('da')
    const ctaBtn = screen.getByRole('button', { name: /åbn digital eksamen/i })
    fireEvent.click(ctaBtn)
    expect(mockOpen).toHaveBeenCalledWith('https://digitalservices.aau.dk/dse/exam', '_blank', 'noopener,noreferrer')
  })

  it('digital essentials button opens URL on click', () => {
    renderWithLang('da')
    const ctaBtn = screen.getByRole('button', { name: /åbn outlook/i })
    fireEvent.click(ctaBtn)
    expect(mockOpen).toHaveBeenCalledWith(expect.any(String), '_blank', 'noopener,noreferrer')
  })

  it('footer help portal button opens URL', () => {
    renderWithLang('da')
    const btn = screen.getByText('Besøg help-portalen')
    fireEvent.click(btn)
    expect(mockOpen).toHaveBeenCalledWith('https://support.its.aau.dk/', '_blank', 'noopener,noreferrer')
  })

  it('renders quick access section when tools are favorited', () => {
    useStore.setState({
      lang: 'en',
      favorites: [{ id: 'fav1', type: 'tool', entityId: 1, order: 0, addedAt: Date.now() }]
    })
    render(
      <MemoryRouter>
        <Resources />
      </MemoryRouter>
    )

    expect(screen.getByText('Your pinned tools')).toBeInTheDocument()
    expect(screen.getAllByText('Digital Exam').length).toBe(3)
  })

  it('toggles favorite status when star is clicked', () => {
    renderWithLang('en')
    const starButton = screen.getAllByLabelText(/Add .+ to favorites/i)[0]
    fireEvent.click(starButton)

    const favorites = useStore.getState().favorites
    expect(favorites.some(f => f.entityId === 1 && f.type === 'tool')).toBe(true)

    fireEvent.click(screen.getAllByLabelText(/Remove .+ from favorites/i)[0])
    expect(useStore.getState().favorites.length).toBe(0)
  })

  it('shows help text when help icon is clicked', () => {
    renderWithLang('en')
    const helpButton = screen.getAllByLabelText('Help')[0]
    fireEvent.click(helpButton)

    expect(screen.getByText(/Digital Exam is AAU's platform/i)).toBeInTheDocument()
  })

  it('contact support button is present', () => {
    renderWithLang('da')
    const btn = screen.getByRole('button', { name: 'Kontakt IT-support' })
    expect(btn).toBeInTheDocument()
  })

  it('opens tool url in new window when clicked', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    renderWithLang('da')
    const ctaBtn = screen.getByRole('button', { name: /åbn digital eksamen/i })
    fireEvent.click(ctaBtn)
    expect(windowOpenSpy).toHaveBeenCalled()
    windowOpenSpy.mockRestore()
  })

  it('toggles tool favorite star', () => {
    renderWithLang('da')
    const star = screen.getAllByLabelText(/favorit|favorite|stjerne/i)[0]
    fireEvent.click(star)
  })

  it('opens support link when contact support is clicked', () => {
    renderWithLang('da')
    const btn = screen.getByRole('button', { name: 'Kontakt IT-support' })
    fireEvent.click(btn)
    expect(mockOpen).toHaveBeenCalledWith('https://support.its.aau.dk/', '_blank', 'noopener,noreferrer')
  })

  it('renders essential tool in quick access when favorited', () => {
    useStore.setState({
      lang: 'en',
      favorites: [{ id: 'fav1', type: 'tool', entityId: 5, order: 0, addedAt: Date.now() }]
    })
    render(
      <MemoryRouter>
        <Resources />
      </MemoryRouter>
    )
    expect(screen.getByText('Your pinned tools')).toBeInTheDocument()
    const outlookShort = screen.getAllByText('Outlook')
    expect(outlookShort.length).toBe(2)
    expect(screen.getAllByText('Outlook Mail').length).toBe(1)
  })

  it('filters tools by search query input', () => {
    renderWithLang('da')
    const searchInput = screen.getByPlaceholderText(/Søg efter/i)
    fireEvent.change(searchInput, { target: { value: 'outlook' } })

    expect(screen.getByText('Outlook Mail')).toBeInTheDocument()
    expect(screen.queryByText('Digital Eksamen')).not.toBeInTheDocument()
  })

  it('searches by keyword "mail" to find Outlook', () => {
    renderWithLang('da')
    const searchInput = screen.getByPlaceholderText(/Søg efter/i)
    fireEvent.change(searchInput, { target: { value: 'mail' } })

    expect(screen.getByText('Outlook Mail')).toBeInTheDocument()
    expect(screen.queryByText('Digital Eksamen')).not.toBeInTheDocument()
  })

  it('searches partial "eks" to find Digital Eksamen', () => {
    renderWithLang('da')
    const searchInput = screen.getByPlaceholderText(/Søg efter/i)
    fireEvent.change(searchInput, { target: { value: 'eks' } })

    expect(screen.getByText('Digital Eksamen')).toBeInTheDocument()
  })

  it('handles case-insensitive search', () => {
    renderWithLang('da')
    const searchInput = screen.getByPlaceholderText(/Søg efter/i)
    fireEvent.change(searchInput, { target: { value: 'STADS' } })

    expect(screen.getByText('STADS')).toBeInTheDocument()
  })

  it('shows helpful empty state when no results match', () => {
    renderWithLang('da')
    const searchInput = screen.getByPlaceholderText(/Søg efter/i)
    fireEvent.change(searchInput, { target: { value: 'zzzzz' } })

    expect(screen.getByText(/Ingen systemer fundet/i)).toBeInTheDocument()
    expect(screen.getByText(/zzzzz/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ryd søgning' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Kontakt IT-support' }).length).toBeGreaterThan(0)
  })

  it('clearing search restores all tools', () => {
    renderWithLang('da')
    const searchInput = screen.getByPlaceholderText(/Søg efter/i)
    fireEvent.change(searchInput, { target: { value: 'mail' } })
    expect(screen.queryAllByText('Digital Eksamen').length).toBe(0)

    fireEvent.change(searchInput, { target: { value: '' } })
    expect(screen.getAllByText('Digital Eksamen').length).toBeGreaterThan(0)
  })

  it('filters tools by category chips click', () => {
    renderWithLang('da')
    const commChip = screen.getByRole('tab', { name: 'Kommunikation' })
    fireEvent.click(commChip)

    expect(screen.getByText('Outlook Mail')).toBeInTheDocument()
    expect(screen.queryByText('Digital Eksamen')).not.toBeInTheDocument()
  })

  it('popular chip shows only popular tools', () => {
    renderWithLang('da')
    const popularChip = screen.getByRole('tab', { name: 'Populære' })
    fireEvent.click(popularChip)

    expect(screen.getByText('Digital Eksamen')).toBeInTheDocument()
    expect(screen.getByText('STADS')).toBeInTheDocument()
    expect(screen.getByText('Outlook Mail')).toBeInTheDocument()
    expect(screen.queryByText('AAU Projektbibliotek')).not.toBeInTheDocument()
  })

  it('popular filter removes popular shortcut strip', () => {
    renderWithLang('da')
    expect(screen.getAllByText('Digital Eksamen').length).toBe(2)

    const popularChip = screen.getByRole('tab', { name: 'Populære' })
    fireEvent.click(popularChip)

    const digitalExamEls = screen.getAllByText('Digital Eksamen')
    expect(digitalExamEls.length).toBe(1)
  })

  it('popular filter shows tools across categories', () => {
    renderWithLang('da')
    const popularChip = screen.getByRole('tab', { name: 'Populære' })
    fireEvent.click(popularChip)

    expect(screen.getByText('Digital Eksamen')).toBeInTheDocument()
    expect(screen.getByText('Outlook Mail')).toBeInTheDocument()
  })

  it('popular filter shows empty state for no match', () => {
    renderWithLang('da')
    const searchInput = screen.getByPlaceholderText(/Søg efter/i)
    fireEvent.change(searchInput, { target: { value: 'zzzzz' } })

    const popularChip = screen.getByRole('tab', { name: 'Populære' })
    fireEvent.click(popularChip)

    expect(screen.getByText(/Ingen systemer fundet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ryd søgning' })).toBeInTheDocument()
  })

  it('clear search button restores tools', () => {
    renderWithLang('da')
    const searchInput = screen.getByPlaceholderText(/Søg efter/i)
    fireEvent.change(searchInput, { target: { value: 'zzzzz' } })
    expect(screen.getByText(/Ingen systemer fundet/i)).toBeInTheDocument()

    const clearBtn = screen.getByRole('button', { name: 'Ryd søgning' })
    fireEvent.click(clearBtn)
    expect(screen.queryByText(/Ingen systemer fundet/i)).not.toBeInTheDocument()
    expect(screen.getAllByText('Digital Eksamen').length).toBeGreaterThan(0)
  })

  it('renders contextual support card title', () => {
    renderWithLang('da')
    expect(screen.getByText('Kan du ikke finde systemet?')).toBeInTheDocument()
  })

  it('renders search guidance text', () => {
    renderWithLang('da')
    expect(screen.getByText(/Søg efter system, opgave eller nøgleord/i)).toBeInTheDocument()
  })

  it('renders example search terms', () => {
    renderWithLang('da')
    const card = screen.getByText(/Søg efter system, opgave eller nøgleord/i)
    expect(card.textContent).toContain('eksamen')
    expect(card.textContent).toContain('mail')
    expect(card.textContent).toContain('software')
  })

  it('renders Kontakt IT-support CTA', () => {
    renderWithLang('da')
    expect(screen.getByRole('button', { name: 'Kontakt IT-support' })).toBeInTheDocument()
  })

  it('renders Besøg help-portalen link', () => {
    renderWithLang('da')
    expect(screen.getByText('Besøg help-portalen')).toBeInTheDocument()
  })

  it('does not render old generic Brug for hjælp? copy', () => {
    renderWithLang('da')
    expect(screen.queryByText('Brug for hjælp?')).not.toBeInTheDocument()
    expect(screen.queryByText(/AAU IT Services står klar/i)).not.toBeInTheDocument()
  })

  it('cancel button is hidden when search is empty', () => {
    renderWithLang('da')
    expect(screen.queryByLabelText('Annuller søgning')).not.toBeInTheDocument()
  })

  it('cancel button appears when search has input', () => {
    renderWithLang('da')
    const searchInput = screen.getByPlaceholderText(/Søg efter/i)
    fireEvent.change(searchInput, { target: { value: 'outlook' } })
    expect(screen.getByLabelText('Annuller søgning')).toBeInTheDocument()
  })

  it('cancel button clears search and restores tools', () => {
    renderWithLang('da')
    const searchInput = screen.getByPlaceholderText(/Søg efter/i)
    fireEvent.change(searchInput, { target: { value: 'zzzzz' } })
    expect(screen.getByText(/Ingen systemer fundet/i)).toBeInTheDocument()

    const cancelBtn = screen.getByLabelText('Annuller søgning')
    fireEvent.click(cancelBtn)
    expect(screen.queryByText(/Ingen systemer fundet/i)).not.toBeInTheDocument()
    expect(screen.getAllByText('Digital Eksamen').length).toBeGreaterThan(0)
  })
})
