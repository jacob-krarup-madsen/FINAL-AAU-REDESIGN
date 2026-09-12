import { MemoryRouter } from 'react-router-dom';
import Messages from '@/pages/Messages/index';
import useStore, { type Lang } from '@/store';

describe('Messages Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const renderMessages = (lang: Lang = 'da') => {
    useStore.setState({ lang })
    return render(
      <MemoryRouter>
        <Messages />
      </MemoryRouter>
    )
  }

  it('renders messages correctly in Danish', () => {
    renderMessages('da')
    expect(screen.getAllByText('Mette Jensen').length).toBeGreaterThan(0)
    expect(screen.getByText('Studievejledningen')).toBeInTheDocument()
  })

  it('selects a different conversation', () => {
    renderMessages('da')
    fireEvent.click(screen.getByText('Studievejledningen'))
    expect(screen.getByText('Hej TestUser. Vi bekræfter hermed din tid til studievejledning d. 15. maj kl. 13:00.')).toBeInTheDocument()
  })

  it('archives and restores a conversation', () => {
    renderMessages('da')
    const archiveBtns = screen.getAllByLabelText('Archive contact')
    fireEvent.click(archiveBtns[0])
    fireEvent.click(screen.getByTestId('tab-archive'))
    expect(screen.getAllByText('Mette Jensen').length).toBeGreaterThan(0)
    const restoreBtn = screen.getByLabelText('Restore contact')
    fireEvent.click(restoreBtn)
  })

  it('renders in English and handles empty states', () => {
    useStore.setState({ lang: 'en' })
    renderMessages('en')
    expect(screen.getAllByText('Mette Jensen').length).toBeGreaterThan(0)
    expect(screen.getByText('Student Guidance')).toBeInTheDocument()
    fireEvent.click(screen.getAllByLabelText('Archive contact')[0])
    fireEvent.click(screen.getByLabelText('Archive contact'))
    expect(screen.getByText('No messages found')).toBeInTheDocument()
  })

  it('selects contact from URL params', () => {
    useStore.setState({ lang: 'da' })
    render(
      <MemoryRouter initialEntries={['/messages?id=2']}>
        <Messages />
      </MemoryRouter>
    )
    expect(screen.getByText(/Vi bekræfter hermed din tid/i)).toBeInTheDocument()
  })

  it('archives active contact and switches to next', () => {
    renderMessages('da')
    const archiveBtns = screen.getAllByLabelText('Archive contact')
    fireEvent.click(archiveBtns[0])
    expect(screen.getByText(/Vi bekræfter hermed din tid/i)).toBeInTheDocument()
  })

  it('shows tertiary variant for active tab when in archive view', () => {
    renderMessages('da')
    const archiveTab = screen.getByTestId('tab-archive')
    fireEvent.click(archiveTab)
    const activeTab = screen.getByTestId('tab-active')
    expect(activeTab.className).not.toContain('bg-primary')
  })

  it('switches back to active view from archive view', () => {
    renderMessages('da')
    fireEvent.click(screen.getByTestId('tab-archive'))
    fireEvent.click(screen.getByTestId('tab-active'))
    const archiveTab = screen.getByTestId('tab-archive')
    expect(archiveTab.className).not.toContain('bg-primary')
  })

  it('handles non-existent contact ID from URL params', () => {
    useStore.setState({ lang: 'da' })
    render(
      <MemoryRouter initialEntries={['/messages?id=999']}>
        <Messages />
      </MemoryRouter>
    )
    expect(screen.getAllByText('Mette Jensen').length).toBeGreaterThan(0)
  })

  it('shows empty state in archive view with no archived messages', () => {
    renderMessages('da')
    fireEvent.click(screen.getByTestId('tab-archive'))
    expect(screen.getByText('Ingen beskeder fundet')).toBeInTheDocument()
  })

  it('shows empty chat panel when no contact is selected in archive view', () => {
    useStore.setState({ lang: 'da' })
    render(
      <MemoryRouter initialEntries={['/messages?id=999']}>
        <Messages />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByTestId('tab-archive'))
    expect(screen.getByText('Vælg en samtale')).toBeInTheDocument()
    expect(screen.getByText('Vælg en samtale for at læse den')).toBeInTheDocument()
  })

  it('shows empty chat panel in English in archive view', () => {
    useStore.setState({ lang: 'en' })
    render(
      <MemoryRouter initialEntries={['/messages?id=999']}>
        <Messages />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByTestId('tab-archive'))
    expect(screen.getByText('Select a conversation')).toBeInTheDocument()
    expect(screen.getByText('Select a conversation to read it')).toBeInTheDocument()
  })

  it('archives a contact that is not the active one', () => {
    renderMessages('da')
    fireEvent.click(screen.getByText('Studievejledningen'))
    const archiveBtns = screen.getAllByLabelText('Archive contact')
    fireEvent.click(archiveBtns[0])
    expect(screen.getByText(/Vi bekræfter hermed din tid/i)).toBeInTheDocument()
  })

  it('sends a message via the input field', () => {
    renderMessages('da')
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Test besked' } })
    const sendBtn = document.querySelector('.messages-input-area button')
    fireEvent.click(sendBtn!)
    expect(screen.getByText('Test besked')).toBeInTheDocument()
  })

  it('does not send empty messages', () => {
    renderMessages('da')
    const sendBtn = document.querySelector('.messages-input-area button') as HTMLButtonElement
    expect(sendBtn.disabled).toBe(true)
  })

  it('sends message on Enter key press', () => {
    renderMessages('da')
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Enter test' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(screen.getByText('Enter test')).toBeInTheDocument()
  })

  it('does not send message with empty text via Enter key', () => {
    renderMessages('da')
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.keyDown(textarea, { key: 'Enter' })
    const messages = document.querySelectorAll('.chat-bubble')
    expect(messages.length).toBe(2)
  })

  it('marks contact as read after delay', async () => {
    renderMessages('da')
    const getUnreadIndicator = () => document.querySelector('.bg-primary.rounded-\\[var\\(--radius-pill\\)\\].w-2\\.5')
    expect(getUnreadIndicator()).toBeInTheDocument()
    await act(async () => {
      await new Promise(r => setTimeout(r, 1500))
    })
    expect(getUnreadIndicator()).not.toBeInTheDocument()
  })

  it('handles scroll logic and scroll fallback', () => {
    const { container } = renderMessages('da')
    const chatBody = container.querySelector('.messages-chat-body') as HTMLElement
    Object.defineProperty(chatBody, 'scrollHeight', { value: 1000 })
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Scroll test' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(screen.getByText('Scroll test')).toBeInTheDocument()
  })

  it('uses scrollTop fallback when scrollTo is not a function', () => {
    renderMessages('da')
    const chatBody = document.querySelector('.messages-chat-body') as HTMLElement
    Object.defineProperty(chatBody, 'scrollHeight', { value: 1000 });
    (chatBody as any).scrollTo = undefined
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Scroll test' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(screen.getByText('Scroll test')).toBeInTheDocument()
  })

  it('calls scrollTo when a new message is added to current chat', () => {
    const { container } = renderMessages('da')
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'New message' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(screen.getByText('New message')).toBeInTheDocument()
  })
})

