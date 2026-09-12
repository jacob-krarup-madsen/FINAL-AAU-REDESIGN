import { ModuleHeader } from '@/components/ui'

describe('ModuleHeader', () => {
  it('renders title', () => {
    render(<ModuleHeader title="Header" />)
    expect(screen.getByText('Header')).toBeInTheDocument()
  })
})
