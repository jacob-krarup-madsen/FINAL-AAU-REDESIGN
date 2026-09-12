import { Textarea } from '@/components/ui';

describe('Textarea', () => {
  it('renders textarea element', () => {
    const { container } = render(<Textarea />)
    expect(container.querySelector('textarea')).toBeInTheDocument()
  })

  it('applies border-danger when error is true', () => {
    const { container } = render(<Textarea error />)
    expect(container.querySelector('textarea')).toHaveClass('border-danger')
  })

  it.each([
    ['none', 'resize-none'],
    ['vertical', 'resize-y'],
    ['horizontal', 'resize-x'],
    ['both', 'resize'],
  ] as const)('applies resize class "%s"', (resize, expectedClass) => {
    const { container } = render(<Textarea resize={resize} />)
    expect(container.querySelector('textarea')).toHaveClass(expectedClass)
  })

  it('does not apply resize class when resize is not set', () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea')
    expect(textarea).not.toHaveClass('resize-none', 'resize-y', 'resize-x', 'resize')
  })

  it('applies full class when full is true', () => {
    const { container } = render(<Textarea full />)
    expect(container.querySelector('textarea')).toHaveClass('w-full')
  })
})
