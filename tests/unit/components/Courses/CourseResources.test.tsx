import useStore from '@/store'
import { CourseResources } from '@/components/Courses'

describe('CourseResources', () => {
  beforeEach(() => {
    useStore.setState({ lang: 'da' })
  })

  it('renders heading with translated title', () => {
    render(<CourseResources />)
    expect(screen.getByText('Ressourcer')).toBeInTheDocument()
  })

  it('renders three list items with translated labels', () => {
    render(<CourseResources />)
    expect(screen.getByText('Pensumliste')).toBeInTheDocument()
    expect(screen.getByText('Litteraturliste')).toBeInTheDocument()
    expect(screen.getByText('Eksamensplan')).toBeInTheDocument()
  })

  it('handles click on all MasterItems', () => {
    render(<CourseResources />)
    const items = [screen.getByText('Pensumliste'), screen.getByText('Litteraturliste'), screen.getByText('Eksamensplan')]
    items.forEach(item => {
      fireEvent.click(item)
    })
    expect(screen.getByText('Pensumliste')).toBeInTheDocument()
    expect(screen.getByText('Litteraturliste')).toBeInTheDocument()
    expect(screen.getByText('Eksamensplan')).toBeInTheDocument()
  })
})
