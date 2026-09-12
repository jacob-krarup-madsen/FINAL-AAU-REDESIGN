import { Card, Heading, Text, Button } from '@/components/ui'
import { Stack } from '@/components/Layout'
import { MessageSquare, User, Clock, Reply } from 'lucide-react'
import useStore from '@/store'

// ==========================================
// Types & Interfaces
// ==========================================

interface Post {
  id: number
  titleDa: string
  titleEn: string
  author: string
  timeDa: string
  timeEn: string
  replies: number
  contentDa: string
  contentEn: string
  important?: boolean
}

interface ReplyItem {
  id: number
  author: string
  roleDa: string
  roleEn: string
  timeDa: string
  timeEn: string
  contentDa: string
  contentEn: string
}

// ==========================================
// ForumOriginalPost
// ==========================================

interface ForumOriginalPostProps {
  post: Post
}

export function ForumOriginalPost({ post }: ForumOriginalPostProps) {
  const t = useStore(state => state.t)
  const localize = useStore(state => state.localize)

  return (
    <Card className="mb-xl">
      <Card.Body>
        <Text size="md" className="leading-[1.7]">
          {localize(post, 'content')}
        </Text>
      </Card.Body>
      <Card.Footer className="border-t border-border">
        <Stack direction="row" gap="lg" align="center">
          <Stack direction="row" gap="xs" align="center">
            <MessageSquare size={14} strokeWidth={2} className="text-muted" />
            <Text size="sm" muted>
              {post.replies} {t('replies')}
            </Text>
          </Stack>
          <Stack direction="row" gap="xs" align="center">
            <User size={14} strokeWidth={2} className="text-muted" />
            <Text size="sm" muted>
              {post.author}
            </Text>
          </Stack>
        </Stack>
      </Card.Footer>
    </Card>
  )
}

// ==========================================
// ForumRepliesList
// ==========================================

interface ForumRepliesListProps {
  replies: ReplyItem[]
}

export function ForumRepliesList({ replies }: ForumRepliesListProps) {
  const t = useStore(state => state.t)
  const localize = useStore(state => state.localize)

  return (
    <>
      <Heading level={3} className="mb-lg">
        {t('replies_title')}
      </Heading>

      {replies.length > 0 ? (
        <Stack gap="md">
          {replies.map((r) => (
            <Card key={r.id} variant="outlined">
              <Card.Body>
                <Stack gap="sm">
                  <Stack direction="row" align="center" gap="sm">
                    <User size={16} strokeWidth={2} className="text-primary" />
                    <Text weight="bold" size="sm">
                      {r.author}
                    </Text>
                    <Text size="xs" muted>
                      {localize(r, 'role')}
                    </Text>
                    <Clock size={14} strokeWidth={2} className="text-muted" />
                    <Text size="xs" muted>
                      {localize(r, 'time')}
                    </Text>
                  </Stack>
                  <Text size="sm" className="leading-[1.6]">
                    {localize(r, 'content')}
                  </Text>
                </Stack>
              </Card.Body>
            </Card>
          ))}
        </Stack>
      ) : (
        <Text muted>{t('no_replies_yet')}</Text>
      )}
    </>
  )
}

// ==========================================
// ForumReplyForm
// ==========================================

interface ForumReplyFormProps {
  onReplyClick?: () => void
}

export function ForumReplyForm({ onReplyClick }: ForumReplyFormProps) {
  const t = useStore(state => state.t)

  return (
    <div className="mt-xl">
      <Button variant="primary" icon={Reply} onClick={onReplyClick}>
        {t('write_reply')}
      </Button>
    </div>
  )
}
