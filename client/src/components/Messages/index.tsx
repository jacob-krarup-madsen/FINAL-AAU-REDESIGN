import { type MouseEvent } from 'react'
import { MessageSquare, Archive, Undo2, Send, MessageCircle } from 'lucide-react'
import {
  Card,
  Heading,
  Text,
  MasterItem,
  SearchInput,
  EmptyState,
  Avatar,
  Button,
  Textarea,
} from '@/components/ui'
import { Stack } from '@/components/Layout'
import { cn } from '@/lib/utils'
import type { Contact, ChatWindowProps } from '@/lib/types'

// ==========================================
// ChatSidebar
// ==========================================

interface ChatSidebarProps {
  view: 'active' | 'archive'
  filteredContacts: Contact[]
  activeContactId: number
  setActiveContactId: (id: number) => void
  archiveContact: (id: number, e: MouseEvent) => void
  restoreContact: (id: number, e: MouseEvent) => void
  t: (key: string) => string
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function ChatSidebar({
  view,
  filteredContacts,
  activeContactId,
  setActiveContactId,
  archiveContact,
  restoreContact,
  t,
  searchQuery,
  setSearchQuery,
}: ChatSidebarProps) {
  return (
    <Card className="h-full w-full border-none shadow-none rounded-none bg-transparent flex flex-col">
      <div className="p-sm pb-xs border-b border-border/40 bg-bg-card shrink-0">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder={t('search_placeholder') || 'Søg...'}
        />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
      {filteredContacts.length > 0 ? (
        filteredContacts.map((contact) => (
          <MasterItem
            key={contact.id}
            selected={activeContactId === contact.id}
            unread={contact.unread}
            onClick={() => {
              setActiveContactId(contact.id)
            }}
            className="contact-item"
            leading={<Avatar name={contact.name} size="sm" />}
            title={
              <Heading level={4} className="truncate">
                {contact.name}
              </Heading>
            }
            subtitle={
              <Text
                size="xs"
                weight={contact.unread ? 'bold' : 'normal'}
                className={`truncate ${
                  contact.unread ? 'text-main' : 'text-text-muted'
                }`}
              >
                {contact.msg}
              </Text>
            }
            meta={
              <Text
                size="2xs"
                className="mt-[var(--space-2xs)] text-text-muted font-medium"
              >
                {contact.time}
              </Text>
            }
            trailing={
              <Stack direction="row" gap="sm" align="center" className="shrink-0 ml-sm">
                {contact.unread && !contact.archived && (
                  <div className="w-2.5 h-2.5 rounded-[var(--radius-pill)] bg-primary shadow-[0_0_6px_rgba(var(--color-primary-rgb),0.4)]" />
                )}
                <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={view === 'active' ? Archive : Undo2}
                    aria-label={view === 'active' ? 'Archive contact' : 'Restore contact'}
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation()
                      if (view === 'active') archiveContact(contact.id, e)
                      else restoreContact(contact.id, e)
                    }}
                    pill
                    className="bg-bg-card border border-border/50 hover:border-primary shadow-[var(--shadow-sm)]"
                  />
                </div>
              </Stack>
            }
          />
        ))
      ) : (
        <EmptyState icon={MessageSquare} title={t('no_messages_found')} />
      )}
      </div>
    </Card>
  )
}

// ==========================================
// ChatWindow
// ==========================================

export function ChatWindow({
  activeContact,
  chatBodyRef,
  messageText,
  setMessageText,
  handleSend,
  t,
}: ChatWindowProps) {
  return (
    <Card className="h-full flex flex-col p-[var(--space-0)] border-none shadow-none rounded-none bg-transparent">
      {activeContact ? (
        <>
          <div className="messages-chat-header p-md border-b border-border bg-bg-card">
            <Stack direction="row" gap="md" align="center">
              <Avatar name={activeContact.name} size="md" />
              <Stack gap="none">
                <Heading level={4}>{activeContact.name}</Heading>
                <Text size="xs" muted weight="medium">
                  {activeContact.role}
                </Text>
              </Stack>
            </Stack>
          </div>
          <div
            ref={chatBodyRef}
            className="messages-chat-body flex-1 p-lg bg-bg-highlight dark:bg-bg-body overflow-y-auto"
          >
            <div className="flex flex-col justify-end min-h-full gap-md">
              {activeContact.messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  <div className={`chat-bubble chat-bubble--${msg.type} animate-fade-in`}>
                    <Text size="sm" className="leading-relaxed">
                      {msg.text}
                    </Text>
                  </div>
                  {msg.timestamp && (
                    <Text
                      size="2xs"
                      className={cn(
                        "text-text-secondary mt-[var(--space-3xs)] px-xs font-semibold opacity-90",
                        msg.type === 'out' ? 'self-end text-right mr-sm' : 'self-start text-left ml-sm'
                      )}
                    >
                      {msg.timestamp}
                    </Text>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="messages-input-area p-md bg-bg-card border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <Stack
              direction="row"
              align="end"
              gap="sm"
              className="p-xs border border-border rounded-[var(--radius-xl)] bg-bg-input focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)] transition-all"
            >
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                className="flex-1 border-none focus-visible:ring-0 bg-transparent min-h-[44px] py-2.5 px-xs text-sm"
                placeholder={t('write_message_placeholder')}
                rows={1}
                resize="none"
              />
              <Button
                variant="primary"
                icon={Send}
                onClick={handleSend}
                disabled={!messageText.trim()}
                size="icon"
                aria-label={t('send_message')}
                className="mb-[3px] mr-[3px] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] hover:scale-105 active:scale-95 transition-all"
              />
            </Stack>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-xl">
          <EmptyState
            icon={MessageCircle}
            title={t('select_conversation')}
            message={t('select_conversation_desc')}
          />
        </div>
      )}
    </Card>
  )
}
