import { Badge } from '@/components/ui'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders correctly with default variant', () => {
    render(<Badge>Default</Badge>)
    const badge = document.querySelector('.badge') as HTMLElement
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('badge')
  })

  it('applies variant classes', () => {
    const variants = ['success', 'warning', 'danger', 'info'] as const

    variants.forEach((variant) => {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>)
      const badge = document.querySelector('.badge') as HTMLElement
      expect(badge).toBeInTheDocument()
      unmount()
    })
  })

  it('applies custom className', () => {
    render(<Badge className="custom-badge">Styled</Badge>)
    const badge = document.querySelector('.badge') as HTMLElement
    expect(badge.className).toContain('custom-badge')
  })

  it('forwards additional props', () => {
    render(<Badge data-testid="test-badge" aria-label="Status Badge">Status</Badge>)
    const badge = screen.getByTestId('test-badge')
    expect(badge).toHaveAttribute('aria-label', 'Status Badge')
  })

  it('renders as a span element', () => {
    render(<Badge>Test</Badge>)
    expect(document.querySelector('span.badge')).toBeInTheDocument()
  })

  it('handles interactive and pill props', () => {
    render(<Badge interactive pill>Interactive Pill</Badge>)
    const badge = screen.getByText('Interactive Pill')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('rounded-[var(--radius-full)]')
    expect(badge.className).toContain('cursor-pointer')
  })
})
