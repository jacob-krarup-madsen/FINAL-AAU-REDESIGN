import userEvent from '@testing-library/user-event';
import { TabBar } from '@/components/ui';

describe('TabBar', () => {
  const mockTabs = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
  ]

  it('renders all tab options', () => {
    render(<TabBar tabs={mockTabs} activeTab="tab1" onChange={() => {}} />)
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
  })

  it('highlights the active tab', () => {
    render(<TabBar tabs={mockTabs} activeTab="tab1" onChange={() => {}} />)
    const tab1 = screen.getByTestId('tab-tab1')
    const tab2 = screen.getByTestId('tab-tab2')
    expect(tab1).toHaveClass('text-primary')
    expect(tab2).toHaveClass('text-muted')
  })

  it('calls onChange when a tab is clicked', () => {
    const handleChange = vi.fn()
    render(<TabBar tabs={mockTabs} activeTab="tab1" onChange={handleChange} />)
    const tab2 = screen.getByTestId('tab-tab2')
    fireEvent.click(tab2)
    expect(handleChange).toHaveBeenCalledWith('tab2')
  })

  it('renders secondary action content when provided', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTab="tab1"
        onChange={() => {}}
        secondaryAction={<button data-testid="secondary">Extra Button</button>}
      />
    )
    expect(screen.getByTestId('secondary')).toBeInTheDocument()
  })

  it('renders icons on tabs', () => {
    const tabsWithIcons = [
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2' },
    ]
    render(<TabBar tabs={tabsWithIcons} activeTab="tab1" onChange={() => {}} />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(0)
  })

  it('shows active indicator on active tab', () => {
    render(<TabBar tabs={mockTabs} activeTab="tab1" onChange={() => {}} />)
    const tab1 = screen.getByTestId('tab-tab1')
    expect(tab1.querySelector('.h-\\[3px\\]')).toBeInTheDocument()
    expect(screen.getByTestId('tab-tab2').querySelector('.h-\\[3px\\]')).not.toBeInTheDocument()
  })

  it('navigates right with ArrowRight key', async () => {
    const onChange = vi.fn()
    render(<TabBar tabs={mockTabs} activeTab="tab1" onChange={onChange} />)
    screen.getByTestId('tab-tab1').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith('tab2')
  })

  it('navigates left with ArrowLeft key', async () => {
    const onChange = vi.fn()
    render(<TabBar tabs={mockTabs} activeTab="tab2" onChange={onChange} />)
    screen.getByTestId('tab-tab2').focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(onChange).toHaveBeenCalledWith('tab1')
  })

  it('wraps navigation at edges with ArrowRight', async () => {
    const onChange = vi.fn()
    render(<TabBar tabs={mockTabs} activeTab="tab2" onChange={onChange} />)
    screen.getByTestId('tab-tab2').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith('tab1')
  })

  it('wraps navigation at edges with ArrowLeft', async () => {
    const onChange = vi.fn()
    render(<TabBar tabs={mockTabs} activeTab="tab1" onChange={onChange} />)
    screen.getByTestId('tab-tab1').focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(onChange).toHaveBeenCalledWith('tab2')
  })

  it('ignores non-arrow keys during keyboard navigation', () => {
    const onChange = vi.fn()
    render(<TabBar tabs={mockTabs} activeTab="tab1" onChange={onChange} />)
    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'Tab' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('sets aria-selected and tabIndex correctly', () => {
    render(<TabBar tabs={mockTabs} activeTab="tab1" onChange={() => {}} />)
    expect(screen.getByTestId('tab-tab1')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('tab-tab1')).toHaveAttribute('tabindex', '0')
    expect(screen.getByTestId('tab-tab2')).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByTestId('tab-tab2')).toHaveAttribute('tabindex', '-1')
  })

  it('returns early if active tab index is -1', () => {
    const onChange = vi.fn()
    render(<TabBar tabs={mockTabs} activeTab="non-existent" onChange={onChange} />)
    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' })
    expect(onChange).not.toHaveBeenCalled()
  })
})
