import { HighlightText } from '@/components/ui'

describe('HighlightText', () => {
  it('returns text if query is empty', () => {
    render(<HighlightText text="Hello World" query="" />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
    expect(document.querySelector('strong')).toBeNull()
  })

  it('highlights matches correctly', () => {
    render(<HighlightText text="Hello World" query="world" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
    const highlighted = document.querySelector('strong')
    expect(highlighted).toBeInTheDocument()
    expect(highlighted?.textContent).toBe('World')
  })
})
