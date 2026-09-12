import { SectionHeader } from '@/components/ui'

describe('SectionHeader', () => {
  it('renders title', () => {
    render(<SectionHeader title="Section" />)
    expect(screen.getByText('Section')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<SectionHeader title="Section" description="Description text" />)
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })

  it('renders subtitle as fallback when description is not provided', () => {
    render(<SectionHeader title="Section" subtitle="Subtitle text" />)
    expect(screen.getByText('Subtitle text')).toBeInTheDocument()
  })

  it('renders actions', () => {
    render(<SectionHeader title="Section" actions={<button>Action</button>} />)
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })
})
