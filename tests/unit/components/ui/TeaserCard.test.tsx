import { TeaserCard } from '@/components/ui/Card';

describe('TeaserCard', () => {
  it('renders correctly with title and description', () => {
    renderWithProviders(<TeaserCard title="Card Title" description="Card Description" />)
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
  })

  it('applies horizontal variant classes', () => {
    const { container } = renderWithProviders(<TeaserCard variant="horizontal" title="Test" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('flex-row')
  })

  it('renders badge correctly', () => {
    renderWithProviders(<TeaserCard badge="New" badgeColor="success" title="Test" />)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('renders progress bar when progress is provided', () => {
    renderWithProviders(<TeaserCard progress={75} title="Test" />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
  })

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn()
    renderWithProviders(<TeaserCard onClick={handleClick} title="Click Me" />)

    const card = screen.getAllByRole('button', { name: /click me/i })[0]
    fireEvent.click(card)

    expect(handleClick).toHaveBeenCalled()
  })

  it('calls onStarToggle and prevents propagation when star is clicked', () => {
    const handleStarToggle = vi.fn()
    const handleCardClick = vi.fn()
    renderWithProviders(
      <TeaserCard
        title="Test"
        onClick={handleCardClick}
        onStarToggle={handleStarToggle}
        isStarred={false}
      />
    )

    const starBtn = screen.getByRole('button', { name: /(add_favorite|Tilføj til favoritter)/i })
    fireEvent.click(starBtn)

    expect(handleStarToggle).toHaveBeenCalledWith(true)
    expect(handleCardClick).not.toHaveBeenCalled()
  })

  it('renders action button correctly', () => {
    renderWithProviders(
      <TeaserCard
        title="Test"
        action={<button data-testid="custom-action">View</button>}
      />
    )
    expect(screen.getByTestId('custom-action')).toBeInTheDocument()
  })

  it('renders image when provided', () => {
    const { container } = renderWithProviders(<TeaserCard title="Test" image="/test.jpg" />)
    const img = container.querySelector('img')
    expect(img?.getAttribute('src')).toBe('/test.jpg')
  })

  it('renders image with aria-hidden when title is provided', () => {
    const { container } = renderWithProviders(<TeaserCard title="Test Title" image="/test.jpg" />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders skeleton state when isLoading is true', () => {
    const { container } = renderWithProviders(<TeaserCard isLoading={true} />)
    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('renders badge without image', () => {
    renderWithProviders(<TeaserCard badge="Sale" badgeColor="warning" title="Test" />)
    expect(screen.getByText('Sale')).toBeInTheDocument()
  })

  it('handles progress of 0% correctly', () => {
    renderWithProviders(<TeaserCard title="Test Zero" progress={0} />)
    expect(screen.getByText('Test Zero')).toBeInTheDocument()
    expect(screen.queryByText(/completed/i)).toBeNull()
  })

  it('renders horizontal skeleton with action and progress', () => {
    const { container } = renderWithProviders(
      <TeaserCard isLoading={true} variant="horizontal" progress={50} action={<button>Action</button>} />
    )
    expect(container.querySelector('.flex-row')).toBeInTheDocument()
  })
})
