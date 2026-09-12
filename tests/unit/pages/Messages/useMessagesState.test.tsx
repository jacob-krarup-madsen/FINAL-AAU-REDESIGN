import { MemoryRouter } from 'react-router-dom'
import { useMessagesState } from '@/pages/Messages'

describe('useMessagesState', () => {
  it('returns default state', () => {
    const { result } = renderHook(() => useMessagesState(), { wrapper: MemoryRouter })
    expect(result.current.view).toBe('active')
    expect(result.current.activeContactId).toBe(1)
    expect(result.current.messageText).toBe('')
  })

  it('handleSend adds a message to the active contact', () => {
    const { result } = renderHook(() => useMessagesState(), { wrapper: MemoryRouter })

    act(() => result.current.setMessageText('Hello'))
    act(() => result.current.handleSend())

    const contact = result.current.contacts.find(c => c.id === 1)
    expect(contact?.messages.length).toBe(3)
    expect(contact?.messages[2].text).toBe('Hello')
    expect(result.current.messageText).toBe('')
  })

  it('handleSend with empty text does nothing', () => {
    const { result } = renderHook(() => useMessagesState(), { wrapper: MemoryRouter })

    act(() => result.current.handleSend())

    const contact = result.current.contacts.find(c => c.id === 1)
    expect(contact?.messages.length).toBe(2)
  })

  it('archiveContact marks contact as archived', () => {
    const { result } = renderHook(() => useMessagesState(), { wrapper: MemoryRouter })
    const mockEvent = { stopPropagation: vi.fn() }

    act(() => result.current.archiveContact(1, mockEvent as any))

    const contact = result.current.contacts.find(c => c.id === 1)
    expect(contact?.archived).toBe(true)
  })

  it('restoreContact un-archives a contact', () => {
    const { result } = renderHook(() => useMessagesState(), { wrapper: MemoryRouter })
    const mockEvent = { stopPropagation: vi.fn() }

    act(() => result.current.archiveContact(1, mockEvent as any))
    act(() => result.current.restoreContact(1, mockEvent as any))

    const contact = result.current.contacts.find(c => c.id === 1)
    expect(contact?.archived).toBe(false)
  })

  it('filteredItems with active view shows only non-archived contacts', () => {
    const { result } = renderHook(() => useMessagesState(), { wrapper: MemoryRouter })
    const mockEvent = { stopPropagation: vi.fn() }

    expect(result.current.filteredItems.length).toBe(2)

    act(() => result.current.archiveContact(1, mockEvent as any))

    expect(result.current.filteredItems.length).toBe(1)
    expect(result.current.filteredItems[0].id).toBe(2)
  })

  it('filteredItems with archive view shows only archived contacts', () => {
    const { result } = renderHook(() => useMessagesState(), { wrapper: MemoryRouter })
    const mockEvent = { stopPropagation: vi.fn() }

    act(() => result.current.archiveContact(1, mockEvent as any))
    act(() => result.current.archiveContact(2, mockEvent as any))
    act(() => result.current.setView('archive'))

    expect(result.current.filteredItems.length).toBe(2)
  })

  it('setView changes the view', () => {
    const { result } = renderHook(() => useMessagesState(), { wrapper: MemoryRouter })

    act(() => result.current.setView('archive'))

    expect(result.current.view).toBe('archive')
  })
})
