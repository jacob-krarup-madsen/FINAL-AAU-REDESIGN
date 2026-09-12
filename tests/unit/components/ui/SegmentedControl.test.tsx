import { Sun, Moon } from 'lucide-react'
import { SegmentedControl } from '@/components/ui'

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

describe('SegmentedControl', () => {
  it('renders all options', () => {
    render(<SegmentedControl options={options} value="day" onChange={vi.fn()} />)
    expect(screen.getByText('Day')).toBeInTheDocument()
    expect(screen.getByText('Week')).toBeInTheDocument()
    expect(screen.getByText('Month')).toBeInTheDocument()
  })

  it('calls onChange with the correct value when an option is clicked', () => {
    const onChange = vi.fn()
    render(<SegmentedControl options={options} value="day" onChange={onChange} />)
    fireEvent.click(screen.getByText('Week'))
    expect(onChange).toHaveBeenCalledWith('week')
  })

  it('renders with icons when provided', () => {
    const iconOptions = [
      { value: 1, icon: Sun, label: 'Sun' },
      { value: 2, icon: Moon, label: 'Moon' },
    ]
    const { container } = render(<SegmentedControl options={iconOptions} value={1} onChange={vi.fn()} />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(2)
  })

  it('renders with images when provided', () => {
    const imgOptions = [
      { value: 'a', img: '/a.png', label: 'A' },
      { value: 'b', img: '/b.png', label: 'B' },
    ]
    const { container } = render(<SegmentedControl options={imgOptions} value="a" onChange={vi.fn()} />)
    const imgs = container.querySelectorAll('img')
    expect(imgs.length).toBe(2)
    expect(imgs[0]).toHaveAttribute('src', '/a.png')
  })

  it('applies active class to the selected option', () => {
    render(<SegmentedControl options={options} value="week" onChange={vi.fn()} />)
    const activeOption = screen.getByText('Week').closest('button')
    expect(activeOption?.classList.contains('segmented-control__option--active')).toBe(true)
  })

  it('renders with custom className', () => {
    const { container } = render(
      <SegmentedControl options={options} value="day" onChange={vi.fn()} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('rotates value when containerClickRotates is true and container is clicked', () => {
    const onChange = vi.fn()
    render(<SegmentedControl options={options} value="day" onChange={onChange} containerClickRotates />)

    const container = document.querySelector('.segmented-control')!
    fireEvent.click(container)

    expect(onChange).toHaveBeenCalledWith('week')
  })

  it('does not rotate when containerClickRotates is false', () => {
    const onChange = vi.fn()
    render(<SegmentedControl options={options} value="day" onChange={onChange} />)

    const container = document.querySelector('.segmented-control')!
    fireEvent.click(container)

    expect(onChange).not.toHaveBeenCalled()
  })
})
