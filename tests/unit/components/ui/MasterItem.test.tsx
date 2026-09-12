import { MasterItem } from '@/components/ui'

describe('MasterItem', () => {
  it('renders title and subtitle', () => {
    render(<MasterItem title="Test Title" subtitle="Test Subtitle" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('handles click and keyboard interaction', () => {
    const clickSpy = vi.fn()
    render(<MasterItem title="Click Me" onClick={clickSpy} />)

    const item = screen.getByText('Click Me').closest('[role="button"]')!
    expect(item).toHaveAttribute('tabIndex', '0')

    fireEvent.click(item)
    expect(clickSpy).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(item, { key: 'Enter' })
    expect(clickSpy).toHaveBeenCalledTimes(2)

    fireEvent.keyDown(item, { key: ' ' })
    expect(clickSpy).toHaveBeenCalledTimes(3)
  })

  it('applies unread and selected classes', () => {
    const { container } = render(<MasterItem title="Title" unread selected />)
    expect(container.querySelector('.is-unread')).toBeInTheDocument()
    expect(container.querySelector('.is-selected')).toBeInTheDocument()
    expect(container.querySelector('.panel-active-indicator')).toBeInTheDocument()
  })

  it('does not trigger click when non-clickable keydown or non-target keydown occurs', () => {
    const clickSpy = vi.fn()

    const { container } = render(<MasterItem title="Non Clickable" />)
    const nonClickableItem = container.firstChild as HTMLElement
    fireEvent.keyDown(nonClickableItem, { key: 'Enter' })
    expect(clickSpy).not.toHaveBeenCalled()

    const { container: container2 } = render(<MasterItem title="Clickable" onClick={clickSpy} />)
    const clickableItem = container2.firstChild as HTMLElement
    fireEvent.keyDown(clickableItem, { key: 'Escape' })
    expect(clickSpy).not.toHaveBeenCalled()
  })

  it('renders loading skeleton state', () => {
    const { container } = render(<MasterItem title="Title" loading />)
    const stack = container.firstChild as HTMLElement
    expect(stack).toHaveAttribute('role', 'status')
    expect(stack).toHaveAttribute('aria-busy', 'true')
    expect(stack.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders LucideIcon leading with standard sizing', () => {
    function TestIcon() { return null }
    const { container } = render(<MasterItem title="Title" leading={TestIcon as any} />)
    const iconContainer = container.querySelector('.shrink-0')
    expect(iconContainer).toHaveClass('w-9', 'h-9', 'sm:w-11', 'sm:h-11', 'rounded-[var(--radius-sm)]')
    expect(iconContainer).not.toHaveClass('bg-bg-highlight/50')
  })

  it('applies leadingClassName to icon container', () => {
    function TestIcon() { return null }
    const { container } = render(<MasterItem title="Title" leading={TestIcon as any} leadingClassName="text-danger bg-danger/10" />)
    const iconContainer = container.querySelector('.shrink-0')
    expect(iconContainer).toHaveClass('text-danger', 'bg-danger/10')
  })
})
