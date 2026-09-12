import { MemoryRouter } from 'react-router-dom'
import useStore from '@/store'
import { Footer } from '@/components/Layout'

describe('Footer Component', () => {
  beforeEach(() => {
    useStore.setState({ lang: 'da' })
  })

  const renderFooter = () => {
    return render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )
  }

  it('renders its support link in navigation', () => {
    renderFooter()
    expect(screen.getByText('ITS Support')).toBeInTheDocument()
  })

  it('renders accessibility statement link', () => {
    renderFooter()
    expect(screen.getByText('Tilgængelighedserklæring')).toBeInTheDocument()
  })

  it('renders service status button', () => {
    renderFooter()
    expect(screen.getByText('Serviceinfo')).toBeInTheDocument()
  })

  it('clicks service status button', () => {
    renderFooter()
    fireEvent.click(screen.getByText('Serviceinfo'))
  })

  it('renders copyright', () => {
    renderFooter()
    expect(screen.getByText((content) => content.includes('Aalborg Universitet. Alle rettigheder forbeholdes.'))).toBeInTheDocument()
  })

  it('renders correct translations when language is English', () => {
    useStore.setState({ lang: 'en' })
    renderFooter()
    expect(screen.getByText('Accessibility Statement')).toBeInTheDocument()
    expect(screen.getByText('Service Status')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('Aalborg Universitet. All rights reserved.'))).toBeInTheDocument()
  })
})
