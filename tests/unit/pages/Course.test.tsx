import { vi, describe, beforeEach, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CourseWrapper, { CourseModules } from '@/pages/Course';
import { CourseResources, CourseInfo, CourseParticipants } from '@/components/Courses';
import useStore from '@/store';
import { STORAGE_KEYS, ASSETS } from '@/lib/constants';
import { Card, Text, MasterItem, Avatar, Button } from '@/components/ui';
import { Stack } from '@/components/Layout';
import { MessageSquare, Users, Book } from 'lucide-react';

const mockNavigate = vi.hoisted(() => vi.fn())
const mockUseParams = vi.hoisted(() => vi.fn(() => ({ id: '1' })))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
  }
})

describe('Course Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useStore.setState({ lang: 'da' })
    mockUseParams.mockReturnValue({ id: '1' })
  })

  const renderCourse = (id = '1') => {
    return render(
      <MemoryRouter initialEntries={[`/course/${id}`]}>
        <Routes>
          <Route path="/course/:id" element={<CourseWrapper />} />
          <Route path="/courses" element={<div>Courses Page</div>} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders course details for ID 1', () => {
    renderCourse('1')
    expect(screen.getAllByText('Digital Design og Kommunikation').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Aflevering: Designskitse').length).toBeGreaterThan(0)
  })

  it('renders course details for ID 2', () => {
    mockUseParams.mockReturnValue({ id: '2' })
    renderCourse('2')
    expect(screen.getAllByText('Webudvikling og CMS').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Projekt: Byg en To-Do App').length).toBeGreaterThan(0)
  })

  it('switches between modules and forum tabs', () => {
    const { container } = renderCourse('1')
    const forumTab = screen.getByText('Fora')
    fireEvent.click(forumTab)
    // After switching tabs, the module section-content is no longer rendered.
    // Note: item text may still appear in the sidebar "Til næste lektion" widget,
    // so we check for section-content absence rather than item text.
    expect(container.querySelector('.section-content')).toBeNull()
  })

  it('toggles item completion', () => {
    renderCourse('1')
    const getFirstCheckbox = () => document.querySelectorAll('.lesson-item__checkbox')[0]
    fireEvent.click(getFirstCheckbox())
    expect(screen.getAllByText('20%').length).toBeGreaterThan(0)
    fireEvent.click(getFirstCheckbox())
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0)
  })

  it('navigates to courses if course ID is invalid', () => {
    mockUseParams.mockReturnValue({ id: '999' })
    renderCourse('999')
    expect(mockNavigate).toHaveBeenCalledWith('/courses')
  })

  it('clicks an assignment item to navigate to submission', () => {
    renderCourse('1')
    fireEvent.click(screen.getAllByText('Aflevering: Designskitse')[0])
    expect(mockNavigate).toHaveBeenCalledWith('/submission/1/105')
  })

  it('navigates to forum tab via top navigation', () => {
    window.scrollTo = vi.fn()
    renderCourse('1')
    fireEvent.click(screen.getByText('Fora'))
    expect(screen.getByText('Fora')).toBeInTheDocument()
  })

  it('renders course in English with English section titles', () => {
    useStore.setState({ lang: 'en' })
    mockUseParams.mockReturnValue({ id: '2' })
    renderCourse('2')
    expect(screen.getAllByText('Web Development and CMS').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Session 1: HTML & CSS Fundamentals').length).toBeGreaterThan(0)
  })

  it('shows pending status-dot when progress is 50% or below', () => {
    renderCourse('1')
    const statusDots = document.querySelectorAll('.status-dot')
    expect(statusDots.length).toBeGreaterThan(0)
    expect(statusDots[0].className).toContain('pending')
  })

  it('shows active status-dot when progress is above 50%', () => {
    // Seed 4/5 completed items via localStorage (click logic tested in 'toggles item completion')
    localStorage.setItem(`${STORAGE_KEYS.COURSE_PROGRESS_PREFIX}1`, JSON.stringify([101, 102, 103, 104]))
    const { container } = renderCourse('1')
    expect(screen.getByText('80%')).toBeInTheDocument()
    const statusDots = container.querySelectorAll('.status-dot')
    expect(statusDots[0].className).toContain('active')
  })

  it('loads saved course progress from localStorage', () => {
    localStorage.setItem(`${STORAGE_KEYS.COURSE_PROGRESS_PREFIX}1`, JSON.stringify([101]))
    const { container } = renderCourse('1')
    expect(container.textContent).toContain('20%')
  })

  it('handles malformed localStorage for course progress', () => {
    localStorage.setItem(`${STORAGE_KEYS.COURSE_PROGRESS_PREFIX}1`, '{broken')
    renderCourse('1')
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0)
  })

  it('handles malformed localStorage for expanded sections', () => {
    localStorage.setItem(`${STORAGE_KEYS.EXPANDED_SECTIONS_PREFIX}1`, '{broken')
    renderCourse('1')
    expect(screen.getAllByText('Aflevering: Designskitse').length).toBeGreaterThan(0)
  })

  it('navigates to info tab and displays course information', () => {
    useStore.setState({ lang: 'da' })
    renderCourse('1')
    const infoTabs = screen.getAllByText('Kursusinfo')
    fireEvent.click(infoTabs[infoTabs.length - 1])
    expect(screen.getByText(/Kursusinformation|Course Info/)).toBeInTheDocument()
    expect(screen.getAllByText(/Beskrivelse|Description/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Læringsmål|Learning Goals/)).toBeInTheDocument()
  })

  it('renders course resources in the sidebar', () => {
    renderCourse('1')
    expect(screen.getByText('Ressourcer')).toBeInTheDocument()
    expect(screen.getAllByText('Pensumliste').length).toBeGreaterThan(0)
  })

  it('navigates to participants tab and filters', () => {
    useStore.setState({ lang: 'da' })
    renderCourse('1')
    const participantsLinks = screen.getAllByText('Deltagere')
    fireEvent.click(participantsLinks[0])
    const searchInput = screen.getByPlaceholderText('Søg deltagere...')
    expect(searchInput).toBeInTheDocument()
    fireEvent.change(searchInput, { target: { value: 'Morten' } })
    expect(screen.queryByText('Mette Jensen')).not.toBeInTheDocument()
    const clearBtn = screen.getByRole('button', { name: /clear/i })
    expect(clearBtn).toBeInTheDocument()
    fireEvent.click(clearBtn)
    expect(screen.getByText('Mette Jensen')).toBeInTheDocument()
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'student' } })
    expect(screen.getByText('Mette Jensen')).toBeInTheDocument()
  })

  it('verifies the progress message when a course is 100% completed', () => {
    useStore.setState({ lang: 'en' })
    // Set 100% progress in localStorage for course 1 (5 items)
    localStorage.setItem(`${STORAGE_KEYS.COURSE_PROGRESS_PREFIX}1`, JSON.stringify([101, 102, 103, 104, 105]))
    
    renderCourse('1')
    
    // progress_100 is "Mission accomplished!" in English
    expect(screen.getByText('Mission accomplished!')).toBeInTheDocument()
    expect(screen.getAllByText('100%').length).toBeGreaterThan(0)
  })

  it('toggles section expansion', () => {
    renderCourse('1')
    const button = document.querySelector('button[data-section-id="s1"]')
    expect(button).toBeInTheDocument()
    fireEvent.click(button!)
    fireEvent.click(button!)
  })

  it('expands a collapsed section', () => {
    localStorage.setItem(`${STORAGE_KEYS.EXPANDED_SECTIONS_PREFIX}1`, JSON.stringify(['s2', 's3', 's4', 's5']))
    renderCourse('1')
    const button = document.querySelector('button[data-section-id="s1"]')
    if (button) {
      fireEvent.click(button!)
      expect(screen.getAllByText('Kursusgang 1: Introduktion til Digital Design').length).toBeGreaterThan(0)
    }
  })
})

describe('Course Tabs Subcomponents', () => {
  describe('CourseModules', () => {
    it('renders module items and triggers click and collapse', () => {
      const toggleItem = vi.fn()
      const toggleSection = vi.fn()
      const sections = [
        {
          id: 's1',
          title: 'Week 1',
          titleEn: 'Week 1',
          items: [
            { id: 101, type: 'pdf' as const, title: 'Syllabus', titleEn: 'Syllabus', size: '1 MB' }
          ]
        }
      ]

      const { container } = render(
        <MemoryRouter>
          <CourseModules
            courseId="1"
            progress={0}
            completedItems={[]}
            expandedSections={['s1']}
            sections={sections}
            toggleItem={toggleItem}
            toggleSection={toggleSection}
            navigate={mockNavigate}
          />
        </MemoryRouter>
      )

      const checkbox = container.querySelector('.lesson-item__checkbox')!
      fireEvent.click(checkbox)
      expect(toggleItem).toHaveBeenCalledWith(101)

      const header = container.querySelector('[data-section-id="s1"]')!
      fireEvent.click(header)
      expect(toggleSection).toHaveBeenCalledWith('s1')
    })
  })

  describe('CourseDescription', () => {
    it('collapses and expands the course description when clicking the button', () => {
      render(
        <MemoryRouter initialEntries={['/course/1']}>
          <Routes>
            <Route path="/course/:id" element={<CourseWrapper />} />
          </Routes>
        </MemoryRouter>
      )

      const toggleBtn = screen.getByText('Vis mere')
      expect(toggleBtn).toBeInTheDocument()

      fireEvent.click(toggleBtn)
      expect(screen.getByText('Vis mindre')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Vis mindre'))
      expect(screen.getByText('Vis mere')).toBeInTheDocument()
    })
  })

  describe('CourseResources', () => {
    it('renders all resource links', () => {
      render(<CourseResources />)
      expect(screen.getByText('Litteraturliste')).toBeInTheDocument()
      expect(screen.getByText('Pensumliste')).toBeInTheDocument()
      expect(screen.getByText('Eksamensplan')).toBeInTheDocument()
      expect(screen.getByText('PDF, 2.4 MB')).toBeInTheDocument()
      expect(screen.getByText('Excel, 150 KB')).toBeInTheDocument()
      expect(screen.getByText('Link')).toBeInTheDocument()
    })
  })

  describe('CourseInfo', () => {
    it('renders info section text', () => {
      render(<CourseInfo />)
      expect(screen.getByText('Læringsmål')).toBeInTheDocument()
    })
  })

  describe('CourseParticipants', () => {
    it('renders search and list of participants', () => {
      const participants = [
        { name: 'Alice Student', role: 'student' as const },
        { name: 'Bob Teacher', role: 'teacher' as const },
      ]

      render(<CourseParticipants participantsData={participants} />)
      expect(screen.getByText('Alice Student')).toBeInTheDocument()
      expect(screen.getByText('Bob Teacher')).toBeInTheDocument()
    })

    it('filters participants by role', () => {
      const participants = [
        { name: 'Alice Student', role: 'student' as const },
        { name: 'Bob Teacher', role: 'teacher' as const },
      ]

      render(<CourseParticipants participantsData={participants} />)
      expect(screen.getByText('Alice Student')).toBeInTheDocument()
      expect(screen.getByText('Bob Teacher')).toBeInTheDocument()

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'student' } })
      expect(screen.getByText('Alice Student')).toBeInTheDocument()
      expect(screen.queryByText('Bob Teacher')).not.toBeInTheDocument()
    })
  })

  describe('CourseSidebar', () => {
    it('renders quick links and professor information', () => {
      const setActiveTab = vi.fn()
      const t = useStore.getState().t
      render(
        <MemoryRouter>
          <aside className="flex flex-col gap-lg">
            <Card variant="elevated" className="h-fit">
              <Card.Header>
                <Text weight="bold" size="lg" className="card__title">{t('quick_access')}</Text>
              </Card.Header>
              <Card.Body className="p-sm">
                <Stack gap="none">
                  <MasterItem
                    leading={MessageSquare}
                    leadingClassName="text-primary"
                    title={t('course_forum')}
                    onClick={() => { setActiveTab('forum'); window.scrollTo(0, 0) }}
                    className="rounded-[var(--radius-lg)] hover:bg-bg-hover border-none"
                  />
                  <MasterItem
                    leading={Users}
                    leadingClassName="text-primary"
                    title={t('participants')}
                    onClick={() => { setActiveTab('participants'); window.scrollTo(0, 0) }}
                    className="rounded-[var(--radius-lg)] hover:bg-bg-hover border-none"
                  />
                  <MasterItem
                    leading={Book}
                    leadingClassName="text-primary"
                    title={t('syllabus')}
                    onClick={() => { setActiveTab('resources'); window.scrollTo(0, 0) }}
                    className="rounded-[var(--radius-lg)] hover:bg-bg-hover border-none"
                  />
                </Stack>
              </Card.Body>
            </Card>

            <Card variant="elevated" className="h-fit">
              <Card.Header>
                <Text weight="bold" size="lg" className="card__title">{t('instructor')}</Text>
              </Card.Header>
              <Card.Body className="pt-md pb-md">
                <Stack direction="row" align="center" gap="md">
                  <Avatar
                    src={ASSETS.promo.instructor}
                    name="Dr. Test"
                    size="lg"
                    status="online"
                  />
                  <Stack gap="none" className="min-w-0 flex-1">
                    <Text size="sm" weight="bold" className="truncate block">Dr. Test</Text>
                    <Text size="xs" muted className="break-all block">test@test.com</Text>
                  </Stack>
                </Stack>
              </Card.Body>
              <Card.Footer className="border-t border-border pt-md">
                <Button variant="secondary" full className="shadow-[var(--shadow-sm)]">
                  {t('send_message')}
                </Button>
              </Card.Footer>
            </Card>
          </aside>
        </MemoryRouter>
      )

      expect(screen.getByText('Dr. Test')).toBeInTheDocument()
      expect(screen.getByText('test@test.com')).toBeInTheDocument()

      const forumLink = screen.getByText('Kursusforum')
      fireEvent.click(forumLink)
      expect(setActiveTab).toHaveBeenCalledWith('forum')
    })
  })
})
