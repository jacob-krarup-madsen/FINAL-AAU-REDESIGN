import { Skeleton } from '@/components/ui'

describe('Skeleton', () => {
  it('renders text variant by default', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('animate-pulse', 'rounded-[var(--radius-sm)]', 'bg-bg-highlight/60')
    expect(el.style.width).toBe('100%')
    expect(el.style.height).toBe('var(--space-md)')
  })

  it('renders circle variant', () => {
    const { container } = render(<Skeleton variant="circle" />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('rounded-[var(--radius-pill)]')
    expect(el.style.width).toBe('40px')
    expect(el.style.height).toBe('40px')
  })

  it('renders circle with custom size', () => {
    const { container } = render(<Skeleton variant="circle" size={64} />)
    const el = container.firstChild as HTMLElement
    expect(el.style.width).toBe('64px')
    expect(el.style.height).toBe('64px')
  })

  it('renders rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" className="h-40 w-full" />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('rounded-[var(--radius-md)]', 'animate-pulse', 'h-40', 'w-full')
  })

  it('renders text with custom width', () => {
    const { container } = render(<Skeleton width="75%" />)
    const el = container.firstChild as HTMLElement
    expect(el.style.width).toBe('75%')
  })

  it('sets aria-hidden', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
})
