import { Radio } from '@/components/ui'

describe('Radio', () => {
  it('renders radio and label', () => {
    render(<Radio label="Option A" />)
    expect(screen.getByLabelText('Option A')).toBeInTheDocument()
  })

  it('renders with error and disabled classes', () => {
    const { rerender } = render(<Radio label="Option A" error />)
    const wrapper = document.querySelector('.border-danger')
    expect(wrapper).toBeInTheDocument()

    rerender(<Radio label="Option A" disabled />)
    const disabledWrapper = document.querySelector('.opacity-60')
    expect(disabledWrapper).toBeInTheDocument()
  })
})
