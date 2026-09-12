import { Input } from '@/components/ui'

describe('Input', () => {
  it('renders input', () => {
    render(<Input placeholder="Test Input" />)
    expect(screen.getByPlaceholderText('Test Input')).toBeInTheDocument()
  })

  it('applies border-danger class when error is true', () => {
    render(<Input error />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-danger')
  })

  it('does not apply border-danger class when error is false', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).not.toHaveClass('border-danger')
  })

  it('applies full class when full is true', () => {
    render(<Input full />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('w-full')
  })
})
