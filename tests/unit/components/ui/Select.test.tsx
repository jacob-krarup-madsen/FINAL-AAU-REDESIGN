import { Select } from '@/components/ui';

describe('Select', () => {
  it('renders select with options', () => {
    render(
      <Select aria-label="Choose option">
        <option value="1">Option 1</option>
      </Select>
    )
    expect(screen.getByRole('combobox', { name: 'Choose option' })).toBeInTheDocument()
  })

  it('applies border-danger class when error is true', () => {
    render(
      <Select aria-label="Choose option" error>
        <option value="1">Option 1</option>
      </Select>
    )
    const select = screen.getByRole('combobox', { name: 'Choose option' })
    expect(select).toHaveClass('border-danger')
  })
})
