import useStore from '@/store'
import { PageHeader } from '@/components/Layout'

describe('PageHeader', () => {
  beforeEach(() => {
    useStore.setState({
      lang: 'da',
      t: (key: string) => key,
    })
  })

  it('renders the title correctly', () => {
    render(<PageHeader title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeDefined()
  })

  it('renders the subtitle when provided', () => {
    render(<PageHeader title="Test Title" subtitle="Test Subtitle" />)
    expect(screen.getByText('Test Subtitle')).toBeDefined()
  })

  it('renders actions when provided', () => {
    render(
      <PageHeader
        title="Test Title"
        actions={<button data-testid="action-btn">Action</button>}
      />
    )
    expect(screen.getByTestId('action-btn')).toBeDefined()
  })

  it('applies the flat class when flat prop is true', () => {
    const { container } = render(<PageHeader title="Test Title" flat={true} />)
    const header = container.querySelector('header')
    expect(header?.classList.contains('page-header--flat')).toBe(true)
  })

  it('renders children before the title', () => {
    render(
      <PageHeader title="Main Title">
        <span data-testid="child-element">Child Content</span>
      </PageHeader>
    )
    expect(screen.getByTestId('child-element')).toBeDefined()
  })

  it('renders without wave background', () => {
    render(<PageHeader title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeDefined()
  })

  it('uses pageKey for translation if title is missing', () => {
    render(<PageHeader pageKey="dashboard_title" />)
    expect(screen.getByText('dashboard_title')).toBeDefined()
  })

  it('renders with empty title/pageKey', () => {
    render(<PageHeader />)
    expect(document.querySelector('.page-header-title')).toBeInTheDocument()
  })

  it('applies different actionsAlign classes', () => {
    const { rerender } = render(<PageHeader title="T" actions={<div>A</div>} actionsAlign="center" />)
    expect(document.querySelector('.page-header-actions')).toHaveClass('md:items-center')

    rerender(<PageHeader title="T" actions={<div>A</div>} actionsAlign="end" />)
    expect(document.querySelector('.page-header-actions')).toHaveClass('md:items-end')

    rerender(<PageHeader title="T" actions={<div>A</div>} actionsAlign="stretch" />)
    expect(document.querySelector('.page-header-actions')).toHaveClass('md:items-stretch')

    rerender(<PageHeader title="T" actions={<div>A</div>} actionsAlign="baseline" />)
    expect(document.querySelector('.page-header-actions')).toHaveClass('md:items-baseline')
  })
})
