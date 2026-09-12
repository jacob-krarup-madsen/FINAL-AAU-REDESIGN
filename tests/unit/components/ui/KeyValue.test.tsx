import { KeyValue } from '@/components/ui'

describe('KeyValue', () => {
  it('renders label and value', () => {
    render(<KeyValue label="Key" value="Value" />)
    expect(screen.getByText('Key')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
  })

  it('renders with divider class', () => {
    const { container } = render(<KeyValue label="K" value="V" divider />)
    expect(container.firstChild).toHaveClass('border-b')
  })

  it('renders with custom className', () => {
    const { container } = render(<KeyValue label="K" value="V" className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})
