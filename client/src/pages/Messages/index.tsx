
import { useState, useEffect, useRef, useCallback, useMemo, type MouseEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { Archive, ArrowLeft } from 'lucide-react';
import { ChatSidebar, ChatWindow } from '@/components/Messages';
import { Badge, TabBar, Button } from '@/components/ui';
import { SplitLayout, PageLayout } from '@/components/Layout';
import useStore from '@/store';
import type { Contact } from '@/lib/types'
import { useManagedCollection } from '@/hooks'
interface UseMessagesStateReturn {
  view: 'active' | 'archive'
  setView: (v: 'active' | 'archive') => void
  activeContactId: number
  setActiveContactId: (id: number) => void
  contacts: Contact[]
  messageText: string
  setMessageText: (t: string) => void
  chatBodyRef: React.RefObject<HTMLDivElement>
  filteredItems: Contact[]
  activeContact: Contact | undefined
  handleSend: () => void
  archiveContact: (id: number, e: MouseEvent) => void
  restoreContact: (id: number, e: MouseEvent) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function useMessagesState(): UseMessagesStateReturn {
  const t = useStore(state => state.t)
  const decrementMessageCount = useStore(state => state.decrementMessageCount)
  const location = useLocation()

  const [activeContactId, setActiveContactId] = useState<number>(1)
  const { items: contacts, setItems: setContacts, view, setView, filteredItems, archiveItem, restoreItem, searchQuery, setSearchQuery } = useManagedCollection<Contact>([
    {
      id: 1,
      name: 'Mette Jensen',
      role: t('role_student'),
      msg: t('msg_mette_1'),
      time: t('msg_mette_time'),
      unread: true,
      archived: false,
      messages: [
        { id: 1, type: 'in', text: t('msg_mette_chat_1'), timestamp: t('msg_mette_chat_1_time') },
        { id: 2, type: 'out', text: t('msg_mette_chat_2'), timestamp: t('msg_mette_chat_2_time') },
      ],
    },
    {
      id: 2,
      name: t('msg_guidance_name'),
      role: t('role_administrative'),
      msg: t('msg_guidance_1'),
      time: t('yesterday'),
      unread: false,
      archived: false,
      messages: [
        { id: 1, type: 'in', text: t('msg_guidance_chat_1'), timestamp: '13:00' },
        { id: 2, type: 'in', text: t('msg_guidance_chat_2'), timestamp: '13:01' },
      ],
    },
  ], {
    searchKeys: (c: Contact) => [c.name, c.role, c.msg],
  })

  const [messageText, setMessageText] = useState('')
  const chatBodyRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)
  const lastActiveContactId = useRef<number | null>(null)
  const lastMessagesLength = useRef<number>(0)

  const handleSend = useCallback(() => {
    if (!messageText.trim()) return
    setContacts(prev => prev.map(c =>
      c.id === activeContactId
        ? { ...c, messages: [...c.messages, { id: Date.now(), type: 'out' as const, text: messageText.trim() }] }
        : c
    ))
    setMessageText('')
  }, [messageText, activeContactId, setContacts])

  // Scroll to bottom on contact/message change
  useEffect(() => {
    /* istanbul ignore next */
    if (chatBodyRef.current) {
      const activeContact = contacts.find(c => c.id === activeContactId)
      const activeMessagesLength = activeContact?.messages.length || 0

      const idChanged = lastActiveContactId.current !== activeContactId
      const messagesCountChanged = lastMessagesLength.current !== activeMessagesLength

      if (isInitialMount.current || idChanged) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
        isInitialMount.current = false
      } else if (messagesCountChanged && activeMessagesLength > lastMessagesLength.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
      }

      lastActiveContactId.current = activeContactId
      lastMessagesLength.current = activeMessagesLength
    }
  }, [activeContactId, contacts])

  // Auto mark-as-read after 1s
  useEffect(() => {
    const contact = contacts.find(c => c.id === activeContactId)
    if (contact?.unread) {
      const timer = setTimeout(() => {
        decrementMessageCount()
        setContacts(prev => prev.map(c => {
          if (c.id === activeContactId && c.unread) {
            return { ...c, unread: false }
          }
          return c
        }))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [activeContactId, contacts, decrementMessageCount, setContacts])

  // Sync URL param → activeContactId
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const id = params.get('id')
    if (id) setActiveContactId(parseInt(id))
  }, [location])

  const archiveContact = useCallback((id: number, e: MouseEvent): void => {
    archiveItem(id, e)
    if (activeContactId === id) {
      const next = contacts.find(c => c.id !== id && !c.archived)
      if (next) setActiveContactId(next.id)
    }
  }, [archiveItem, activeContactId, contacts])

  const restoreContact = restoreItem

  const activeContact = useMemo(
    () => contacts.find(c => c.id === activeContactId) ?? filteredItems[0],
    [contacts, activeContactId, filteredItems]
  )

  return {
    view,
    setView,
    activeContactId,
    setActiveContactId,
    contacts,
    messageText,
    setMessageText,
    chatBodyRef,
    filteredItems,
    activeContact,
    handleSend,
    archiveContact,
    restoreContact,
    searchQuery,
    setSearchQuery,
  }
}


function Messages() {
  const t = useStore(state => state.t)
  const {
    view,
    setView,
    activeContactId,
    setActiveContactId,
    messageText,
    setMessageText,
    chatBodyRef,
    filteredItems,
    activeContact,
    handleSend,
    archiveContact,
    restoreContact,
    searchQuery,
    setSearchQuery,
  } = useMessagesState()

  return (
    <PageLayout
      className="container messages-page flex flex-col pb-[var(--space-2xl)]"
      pageKey="messages"
      title={t('messages')}
      subtitle={t('messages_page_subtitle')}
      breadcrumbs={[{ label: t('dashboard'), href: '/' }, { label: t('messages') }]}
      headerChildren={
        <Badge variant="default" className="bg-bg-placeholder text-text-muted">{t('communication')}</Badge>
      }
    >

      <SplitLayout
        sidebarPosition="left"
        showDetailOnMobile={!!activeContactId}
        listHeader={
          <div className="px-md pt-md border-b border-border bg-bg-card">
            <TabBar
              tabs={[
                { id: 'active', label: t('active_tab') },
                { id: 'archive', label: t('archive_tab'), icon: Archive },
              ]}
              activeTab={view}
              onChange={(id) => setView(id as typeof view)}
            />
          </div>
        }
        sidebar={
          <ChatSidebar
            view={view}
            filteredContacts={filteredItems}
            activeContactId={activeContactId}
            setActiveContactId={setActiveContactId}
            archiveContact={archiveContact}
            restoreContact={restoreContact}
            t={t}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        }
        detailHeader={
          <div className="md:hidden flex items-center h-14 px-md border-b border-border bg-bg-card">
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setActiveContactId(0)}
              className="font-bold"
            >
              {t('common.back')}
            </Button>
          </div>
        }
        main={
          <ChatWindow
            activeContact={activeContact}
            chatBodyRef={chatBodyRef}
            messageText={messageText}
            setMessageText={setMessageText}
            handleSend={handleSend}
            t={t}
          />
        }
      />
    </PageLayout>
  )
}

export default Messages
