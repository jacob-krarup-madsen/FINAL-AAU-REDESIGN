import { useState, useRef } from 'react';
import { ArrowLeft, Trash2, Book, Check } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Text, Heading, IconCircle, MasterItem, Icon, Button, Textarea, useToast } from '@/components/ui';
import { Stack, PageLayout, SplitLayout } from '@/components/Layout';
import { PATHS } from '@/routes';
import { submitAssignment } from '@/lib/api';
import { storage, getFileTypeConfig, processFileMetadata } from '@/lib/utils';
import { STORAGE_KEYS } from '@/lib/constants';
import useStore from '@/store';
import type { StagedFile } from '@/lib/types';

function Submission() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>()
  const navigate = useNavigate()
  const t = useStore(state => state.t)
  const toast = useToast()
  const [files, setFiles] = useState<StagedFile[]>([])
  const [status, setStatus] = useState<string>('draft')
  const [comment, setComment] = useState<string>('')
  const handleFilesAdded = (fileList: FileList) => {
    setFiles((prev) => [...prev, ...processFileMetadata(fileList)])
  }

  const assignmentInfo = {
    title: assignmentId === '105' ? 'Designskitse' : 'Projekt: Byg en To-Do App',
    course: courseId === '1' ? 'Digital Design og Kommunikation' : 'Webudvikling og CMS',
    deadline: assignmentId === '105'
      ? t('deadline_friday')
      : t('deadline_monday'),
    description: t('event_detail_desc'),
  }

  const removeFile = (id: string): void => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSubmit = async () => {
    if (files.length === 0) return
    setStatus('uploading')
    try {
      await submitAssignment({
        courseId,
        assignmentId,
        files: files.map(f => f.name),
        comment,
      })
      setStatus('submitted')
      if (courseId && assignmentId) {
        const completed = storage.get<number[]>(`${STORAGE_KEYS.COURSE_PROGRESS_PREFIX}${courseId}`, [])
        const parsedId = parseInt(assignmentId, 10)
        if (!isNaN(parsedId) && !completed.includes(parsedId)) {
          storage.set(`${STORAGE_KEYS.COURSE_PROGRESS_PREFIX}${courseId}`, [...completed, parsedId])
        }
      }
    } catch {
      setStatus('draft')
      toast.error(t('common.error_message') || 'Something went wrong')
    }
  }

  if (status === 'submitted') {
    return (
      <SubmissionSuccess
        onBackToCourse={() => navigate(PATHS.COURSE(courseId || ''))}
        t={t}
      />
    )
  }

  return (
    <PageLayout
      className="container"
      title={assignmentInfo.title}
      subtitle={assignmentInfo.course}
      headerChildren={
        <Stack gap="sm">
          <Link to={`/course/${courseId}`}>
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              {t('back_to_course')}
            </Button>
          </Link>
          <Stack direction="row" gap="lg">
            <Stack direction="row" gap="xs">
              <Text size="sm" muted>{t('deadline')}:</Text>
              <Text size="sm" weight="bold" className="submission__deadline text-[var(--aau-light-orange)]">{assignmentInfo.deadline}</Text>
            </Stack>
            <Stack direction="row" gap="xs">
              <Text size="sm" muted>{t('status_label')}</Text>
              <Text size="sm" weight="bold">{t('not_submitted')}</Text>
            </Stack>
          </Stack>
        </Stack>
      }
    >
      <SplitLayout
        main={
          <Stack gap="lg">
            <Card className="submission__card">
              <Card.Header>
                  <Text weight="bold" size="lg" className="card__title">{t('instructions')}</Text>
              </Card.Header>
              <Card.Body>
                <Text size="sm" muted className="submission__description leading-[1.6]">{assignmentInfo.description}</Text>
              </Card.Body>
            </Card>

            <Stack gap="md" className="submission-zone">
              <SubmissionDropzone onFilesAdded={handleFilesAdded} t={t} />
              <SubmissionFileList files={files} onRemoveFile={removeFile} t={t} />
            </Stack>

            <Stack gap="md" className="submission__comment-section">
              <Heading level={4}>{t('comment_to_instructor')}</Heading>
              <Textarea
                placeholder={t('write_comment')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                variant="outlined"
                className="submission__comment-input min-h-[120px]"
              />
            </Stack>

            <Stack direction="row" gap="lg" align="center" className="submission__actions">
              <Button
                variant={files.length > 0 ? 'primary' : 'secondary'}
                onClick={handleSubmit}
                disabled={files.length === 0 || status === 'uploading'}
                className="submission__submit-btn min-w-[var(--space-3xl)] w-full justify-center"
                loading={status === 'uploading'}
                aria-label={t('submit_assignment')}
              >
                {status === 'uploading' ? '' : t('submit_assignment')}
              </Button>
              <Text size="xs" muted className="submission__disclaimer max-w-[300px]">
                {t('submission_disclaimer')}
              </Text>
            </Stack>
          </Stack>
        }
        sidebar={<SubmissionDetails t={t} />}
        mainSpan={8}
        sidebarSpan={4}
      />
    </PageLayout>
  )
}

interface SubmissionDropzoneProps {
  onFilesAdded: (files: FileList) => void;
  t: (key: string) => string;
}

export function SubmissionDropzone({ onFilesAdded, t }: SubmissionDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fileInputRef.current?.click()
    }
  }

  return (
    <Stack
      align="center"
      justify="center"
      className={`dropzone flex flex-col items-center justify-center border-2 border-dashed transition-all rounded-[var(--radius-xl)] p-xl cursor-pointer ${isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-bg-card/50'} focus-visible:outline-none focus-visible:shadow-focus`}
      gap="sm"
      tabIndex={0}
      role="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragOver(false)
        if (e.dataTransfer.files) {
          onFilesAdded(e.dataTransfer.files)
        }
      }}
    >
      <Icon name="cloud-arrow-up" className="submission__dropzone-icon text-[48px] text-[var(--color-primary)]" />
      <Heading level={3}>{t('click_or_drag')}</Heading>
      <Text size="sm" muted>PDF, JPG, PNG{t('submission_or_zip')} (Max 50MB)</Text>
      <input
        ref={fileInputRef}
        id="fileInput"
        type="file"
        multiple
        className="submission__hidden-input hidden"
        onChange={(e) => {
          if (e.target.files) {
            onFilesAdded(e.target.files)
          }
        }}
      />
    </Stack>
  )
}

interface SubmissionFileListProps {
  files: StagedFile[];
  onRemoveFile: (id: string) => void;
  t: (key: string) => string;
}

export function SubmissionFileList({ files, onRemoveFile, t }: SubmissionFileListProps) {
  if (files.length === 0) return null

  return (
    <Stack gap="md" className="submission__files mt-[var(--space-xl)]">
      <Heading level={4}>{t('selected_files')}</Heading>
      <Stack gap="sm">
        {files.map((file) => {
          const fileConfig = getFileTypeConfig(file.name)
          const FileIcon = fileConfig.icon
          return (
            <MasterItem
              key={file.id}
              className="border border-border/40 rounded-[var(--radius-md)]"
              leading={FileIcon}
              leadingClassName={fileConfig.colorClass}
              title={
                <Text weight="semibold" className="text-sm">{file.name}</Text>
              }
              subtitle={file.size}
              trailing={
                <Button
                  variant="ghost"
                  size="xs"
                  icon={Trash2}
                  onClick={() => onRemoveFile(file.id)}
                  aria-label={t('submission_remove_file')}
                  className="submission__remove-btn text-[var(--color-danger)]"
                />
              }
            />
          )
        })}
      </Stack>
    </Stack>
  )
}

interface SubmissionSuccessProps {
  onBackToCourse: () => void;
  t: (key: string) => string;
}

export function SubmissionSuccess({ onBackToCourse, t }: SubmissionSuccessProps) {
  return (
    <Stack align="center" justify="center" className="container submission__success-wrapper min-h-[60vh]">
      <Card className="submission__success-card max-w-xl w-full text-center">
        <Card.Body className="submission__success-body p-[var(--space-3xl)_var(--space-xl)]">
          <Stack align="center" gap="xl">
            <IconCircle icon={Check} size={64} bg="var(--color-success)" color="white" />
            <Stack gap="xs">
              <Heading level={1}>{t('submission_success')}</Heading>
              <Text muted>
                {t('submission_received')}
              </Text>
            </Stack>
            <Stack direction="row" gap="md" align="center" fullWidth>
              <Button variant="primary" full onClick={onBackToCourse}>
                {t('back_to_course')}
              </Button>
              <Button variant="secondary" full>{t('view_receipt')}</Button>
            </Stack>
          </Stack>
        </Card.Body>
      </Card>
    </Stack>
  )
}

interface SubmissionDetailsProps {
  t: (key: string) => string;
}

export function SubmissionDetails({ t }: SubmissionDetailsProps) {
  return (
    <Stack gap="lg">
      <Card>
        <Card.Header>
          <Text weight="bold" size="lg" className="card__title">{t('pre_submission_checklist')}</Text>
        </Card.Header>
        <Card.Body>
          <Stack gap="xs" className="submission__checklist list-none p-[var(--space-0)]">
            <li className="flex items-center gap-[var(--space-xs)]">
              <Text size="sm">
                <Icon name="square-check" variant="success" size="sm" /> {t('submission_checklist_id')}
              </Text>
            </li>
            <li className="flex items-center gap-[var(--space-xs)]">
              <Text size="sm">
                <Icon name="square-check" variant="success" size="sm" /> {t('submission_checklist_pdf')}
              </Text>
            </li>
            <li className="flex items-center gap-[var(--space-xs)]">
              <Text size="sm">
                <Icon name="square-check" variant="success" size="sm" /> {t('submission_checklist_sources')}
              </Text>
            </li>
          </Stack>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Text weight="bold" size="lg" className="card__title">{t('submission_help')}</Text>
        </Card.Header>
        <Card.Body>
          <Text size="xs" muted className="submission__help-text mb-[var(--space-md)] block">
            {t('submission_help_desc')}
          </Text>
        </Card.Body>
        <Card.Footer>
          <Button variant="ghost" size="sm" icon={Book} full>
            {t('view_submission_guide')}
          </Button>
        </Card.Footer>
      </Card>
    </Stack>
  )
}

export default Submission
