import { Heading, Text, Caption } from '@/components/ui';

describe('Typography', () => {
  it('renders heading with different levels', () => {
    const { rerender } = render(<Heading level={1}>H1</Heading>)
    expect(screen.getByText('H1').tagName).toBe('H1')

    rerender(<Heading level={2}>H2</Heading>)
    expect(screen.getByText('H2').tagName).toBe('H2')
  })

  it('renders heading with default level', () => {
    render(<Heading>Default H1</Heading>)
    expect(screen.getByText('Default H1').tagName).toBe('H1')
  })

  it('applies weight to heading', () => {
    render(<Heading level={1} weight="bold">Bold Heading</Heading>)
    const el = screen.getByText('Bold Heading')
    expect(el.style.fontWeight).toBe('700')

    render(<Heading level={2} weight={300}>Custom Weight</Heading>)
    expect(screen.getByText('Custom Weight').style.fontWeight).toBe('300')
  })

  it('renders text with size and weight', () => {
    render(<Text size="lg" weight="medium">Large Text</Text>)
    const el = screen.getByText('Large Text')
    expect(el.className).toContain('text-lg')
    expect(el.style.fontWeight).toBe('500')
  })

  it('renders bold and muted text', () => {
    render(<Text bold muted>Bold Muted</Text>)
    const el = screen.getByText('Bold Muted')
    expect(el.style.fontWeight).toBe('700')
    expect(el.className).toContain('text-muted')
  })

  it('renders text with custom tag', () => {
    render(<Text tag="span">Span Text</Text>)
    expect(screen.getByText('Span Text').tagName).toBe('SPAN')
  })

  it('renders caption', () => {
    render(<Caption>Caption Text</Caption>)
    const el = screen.getByText('Caption Text')
    expect(el.tagName).toBe('SPAN')
    expect(el.className).toContain('text-xs')
    expect(el.className).toContain('text-muted')
  })

  it('renders text with custom size not in standard tokens', () => {
    render(<Text size="20px">Custom Size</Text>)
    expect(screen.getByText('Custom Size').style.fontSize).toBe('20px')
  })

  it('renders text with custom weight not in weightMap', () => {
    render(<Text weight={100}>Light Weight</Text>)
    expect(screen.getByText('Light Weight').style.fontWeight).toBe('100')
  })
})
