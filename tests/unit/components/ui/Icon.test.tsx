import { User, Plus } from 'lucide-react'
import { Icon, IconCircle } from '@/components/ui'

describe('Icon', () => {
  it('renders default icon', () => {
    const { container } = render(<Icon />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders specific icon component', () => {
    const { container } = render(<Icon icon={User} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    const { container } = render(<Icon variant="primary" />)
    expect(container.firstChild).toHaveClass('text-primary')
  })

  it('renders with label setting aria-label and role="img"', () => {
    const { container } = render(<Icon icon={User} label="User icon" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-label', 'User icon')
    expect(svg).toHaveAttribute('role', 'img')
    expect(svg).not.toHaveAttribute('aria-hidden')
  })

  it('renders without label setting aria-hidden="true"', () => {
    const { container } = render(<Icon icon={User} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('aria-label')
    expect(svg).not.toHaveAttribute('role')
  })
})

describe('IconCircle', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<IconCircle icon={Plus} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('handles numeric size', () => {
    const { container } = render(<IconCircle icon={Plus} size={50} />)
    const icon = container.querySelector('svg')
    expect(icon).toHaveAttribute('width', '25')
  })

  it('handles custom background and color', () => {
    const { container } = render(<IconCircle icon={Plus} bg="rgb(255, 0, 0)" color="rgb(255, 255, 255)" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.backgroundColor).toBe('rgb(255, 0, 0)')
    expect(wrapper.style.color).toBe('rgb(255, 255, 255)')
  })

  it('renders with default size 48', () => {
    const { container } = render(<IconCircle icon={Plus} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.width).toBe('48px')
  })
})
