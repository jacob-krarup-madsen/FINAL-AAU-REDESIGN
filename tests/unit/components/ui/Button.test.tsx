import { Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Test</Button>)
    expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument()
  })

  it('renders with icon only', () => {
    const { container } = render(<Button icon={Plus} aria-label="Add" />)
    expect(screen.getByLabelText('Add')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders with icon and text', () => {
    render(<Button icon={Plus}>Add</Button>)
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument()
  })

  it('renders with iconRight', () => {
    render(<Button iconRight={Check}>Done</Button>)
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
  })

  it('renders in loading state', () => {
    render(<Button loading>Submit</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('applies pill and full classes', () => {
    const { rerender } = render(<Button pill>Pill</Button>)
    expect(screen.getByRole('button')).toHaveClass('rounded-[var(--radius-full)]')

    rerender(<Button full>Full</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })
})
