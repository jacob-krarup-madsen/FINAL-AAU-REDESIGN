import { Grid, Stack } from '@/components/Layout'

describe('Grid', () => {
  it('renders children', () => {
    const { container } = render(<Grid><div>Test</div></Grid>)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders Grid.Item with default span', () => {
    const { getByText } = render(<Grid><Grid.Item>Default</Grid.Item></Grid>)
    const item = getByText('Default')
    expect(item).toBeInTheDocument()
    expect(item.className).toContain('grid-item')
  })

  it('applies custom columns and spans', () => {
    const { container } = render(
      <Grid columns={6}>
        <Grid.Item span={3}>Item</Grid.Item>
      </Grid>
    )
    const grid = container.querySelector('.grid-container') as HTMLElement
    const item = container.querySelector('.grid-item') as HTMLElement

    expect(grid.style.getPropertyValue('--grid-cols')).toBe('6')
    expect(item.style.getPropertyValue('--span')).toBe('3')
  })

  it('computes responsive gap CSS variables correctly', () => {
    const gaps = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const
    gaps.forEach(gap => {
      const { container } = render(<Grid gap={gap} />)
      const grid = container.querySelector('.grid-container') as HTMLElement
      expect(grid.style.getPropertyValue('--grid-gap')).toBe(`var(--space-${gap})`)
    })
  })

  it('handles custom gap values', () => {
    const { container } = render(<Grid gap="15px" />)
    const grid = container.querySelector('.grid-container') as HTMLElement
    expect(grid.style.getPropertyValue('--grid-gap')).toBe('15px')
  })

  it('handles undefined gap', () => {
    const { container } = render(<Grid />)
    const grid = container.querySelector('.grid-container') as HTMLElement
    expect(grid.style.getPropertyValue('--grid-gap')).toBe('var(--space-lg)')
  })
})

describe('Stack DOM Props', () => {
  it('should not pass fullWidth to the DOM element', () => {
    render(<Stack fullWidth data-testid="stack">Test</Stack>)
    const element = screen.getByTestId('stack')
    expect(element.getAttribute('fullWidth')).toBeNull()
  })

  it('applies flex-wrap class when wrap is true', () => {
    render(<Stack wrap data-testid="stack-wrap">Content</Stack>)
    const el = screen.getByTestId('stack-wrap')
    expect(el.classList.contains('flex-wrap')).toBe(true)
  })

  it('applies flex-row class when direction is row', () => {
    render(<Stack direction="row" data-testid="stack-row">Content</Stack>)
    const el = screen.getByTestId('stack-row')
    expect(el.classList.contains('flex-row')).toBe(true)
  })

  it('applies w-full h-full when full is true', () => {
    render(<Stack full data-testid="stack-full">Content</Stack>)
    const el = screen.getByTestId('stack-full')
    expect(el.classList.contains('w-full')).toBe(true)
    expect(el.classList.contains('h-full')).toBe(true)
  })
})
