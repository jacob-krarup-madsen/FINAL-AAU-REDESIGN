import { ProgressBar } from '@/components/ui'

describe('ProgressBar', () => {
  it('renders correctly', () => {
    const { container } = render(<ProgressBar value={50} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies correct width based on value', () => {
    const { container } = render(<ProgressBar value={50} />)
    const track = container.querySelector('.rounded-pill')
    const fill = track?.querySelector('div')
    expect(fill?.style.width).toBe('50%')
  })

  it('clamps value to min 0 and max 100', () => {
    const { container, rerender } = render(<ProgressBar value={-10} />)
    const track = container.querySelector('.rounded-pill')
    const fill = track?.querySelector('div')
    expect(fill?.style.width).toBe('0%')

    rerender(<ProgressBar value={150} />)
    const track2 = container.querySelector('.rounded-pill')
    const fill2 = track2?.querySelector('div')
    expect(fill2?.style.width).toBe('100%')
  })

  it('applies custom color when provided', () => {
    const { container } = render(<ProgressBar value={50} color="red" />)
    const track = container.querySelector('.rounded-pill')
    const fill = track?.querySelector('div')
    expect(fill?.style.background).toBe('red')
  })

  it('applies custom height when provided', () => {
    const { container } = render(<ProgressBar value={50} height={12} />)
    const track = container.querySelector('.rounded-pill') as HTMLElement
    expect(track?.style.height).toBe('12px')
  })

  it('uses default height of 6 when not provided', () => {
    const { container } = render(<ProgressBar value={50} />)
    const track = container.querySelector('.rounded-pill') as HTMLElement
    expect(track?.style.height).toBe('6px')
  })

  it('shows label with percentage when showLabel is true', () => {
    render(<ProgressBar value={75} showLabel />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('shows custom label string when showLabel is a string', () => {
    render(<ProgressBar value={75} showLabel="Custom Label" />)
    expect(screen.getByText('Custom Label')).toBeInTheDocument()
  })
})
