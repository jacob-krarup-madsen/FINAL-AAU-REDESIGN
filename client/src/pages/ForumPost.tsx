import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ForumOriginalPost, ForumRepliesList, ForumReplyForm } from '@/components/Forum';
import { ForumAboutWidget } from '@/components/Widgets';
import Button from '@/components/ui/Button';
import { Grid, PageHeader, Stack } from '@/components/Layout';
import { Heading } from '@/components/ui';
import { mockForumPosts, mockForumReplies } from '@/lib/data';
import useStore from '@/store';

function ForumPost() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const t = useStore(state => state.t)
  const localize = useStore(state => state.localize)
  const post = useMemo(() => mockForumPosts.find((p) => p.id === Number(id)), [id])

  if (!post) {
    return (
      <Stack align="center" justify="center" className="container min-h-[60vh]">
        <Stack align="center" gap="md">
          <Heading level={1}>{t('forum_post_not_found')}</Heading>
          <Link to="/">
            <Button variant="primary">{t('dashboard')}</Button>
          </Link>
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack className="container animate-fade-in">
      <PageHeader
        title={localize(post, 'title')}
        subtitle={`${t('by')} ${post.author} — ${localize(post, 'time')}`}
        breadcrumbs={[{ label: t('dashboard'), href: '/' }, { label: t('course_forum') }, { label: localize(post, 'title') }]}
      >
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}>
          {t('back_to_forum')}
        </Button>
      </PageHeader>

      <Grid>
        <Grid.Item span={8}>
          <ForumOriginalPost post={post} />

          <ForumRepliesList replies={mockForumReplies} />

          <ForumReplyForm />
        </Grid.Item>

        <Grid.Item span={4}>
          <ForumAboutWidget post={post} />
        </Grid.Item>
      </Grid>
    </Stack>
  )
}

export default ForumPost
