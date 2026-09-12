import { Checkbox } from '@/components/ui'

describe('Checkbox', () => {
  it('renders checkbox and label', () => {
    render(<Checkbox label="Accept terms" />)
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument()
  })

  it('renders with error and disabled classes', () => {
    const { rerender } = render(<Checkbox label="Accept terms" error />)
    const wrapper = document.querySelector('.border-danger')
    expect(wrapper).toBeInTheDocument()

    rerender(<Checkbox label="Accept terms" disabled />)
    const disabledWrapper = document.querySelector('.opacity-60')
    expect(disabledWrapper).toBeInTheDocument()
  })
})
