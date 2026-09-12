import { SearchInput, FormField } from '@/components/ui/FormControls'

describe('SearchInput', () => {
  it('renders search input with default placeholder', () => {
    render(<SearchInput />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('renders search input with custom placeholder', () => {
    render(<SearchInput placeholder="Custom placeholder" />)
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
  })

  it('calls onChange when text is entered', () => {
    const handleChange = vi.fn()
    render(<SearchInput value="" onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test query' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('shows clear button when value is present and onClear is provided', () => {
    const handleClear = vi.fn()
    render(<SearchInput value="test" onChange={() => {}} onClear={handleClear} />)
    const clearButton = screen.getByLabelText('Clear search')
    expect(clearButton).toBeInTheDocument()
    fireEvent.click(clearButton)
    expect(handleClear).toHaveBeenCalledTimes(1)
  })

  it('does not show clear button when value is empty', () => {
    render(<SearchInput value="" onChange={() => {}} onClear={() => {}} />)
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
  })

  it('shows submit button when onSubmit is provided and value is not clearable', () => {
    const handleSubmit = vi.fn()
    render(<SearchInput value="test" onChange={() => {}} onSubmit={handleSubmit} />)
    const submitBtn = screen.getByRole('button')
    expect(submitBtn).toBeInTheDocument()
    expect(submitBtn.getAttribute('type')).toBe('submit')
  })

  it('calls onSubmit on form submit', () => {
    const handleSubmit = vi.fn()
    render(<SearchInput value="test" onChange={() => {}} onSubmit={handleSubmit} />)
    const input = screen.getByRole('textbox')
    fireEvent.submit(input)
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})

describe('FormField', () => {
  it('renders without crashing', () => {
    const { container } = render(<FormField label="Test" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders required asterisk', () => {
    render(<FormField label="Name" required />)
    const asterisk = screen.getByText('*')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk).toHaveClass('text-danger')
  })

  it('does not render asterisk when not required', () => {
    render(<FormField label="Name" />)
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('renders helpText', () => {
    render(<FormField label="Name" helpText="This is helpful" />)
    expect(screen.getByText('This is helpful')).toBeInTheDocument()
  })

  it('renders error text', () => {
    render(<FormField label="Name" error="Something went wrong" />)
    const errorEl = screen.getByText('Something went wrong')
    expect(errorEl).toBeInTheDocument()
    expect(errorEl).toHaveClass('text-danger')
  })

  it('renders without label', () => {
    render(<FormField><span data-testid="child">Content</span></FormField>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders non-element children like strings directly', () => {
    render(<FormField label="Text">Simple Text Child</FormField>)
    expect(screen.getByText('Simple Text Child')).toBeInTheDocument()
  })
})
