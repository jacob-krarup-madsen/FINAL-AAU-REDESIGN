import React, {
  type HTMLAttributes,
  forwardRef,
  type ElementType,
  Component,
  type ErrorInfo,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
  Fragment,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { useNavigate, useLocation, Link, NavLink, Outlet } from 'react-router-dom';
import {
  Clock,
  User as UserIcon,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  Globe,
  Sun,
  Moon,
  Monitor,
  Mail,
  RefreshCw,
  AlertCircle,
  X,
  GraduationCap,
  ClipboardList,
  MessageSquare,
  Calendar,
  House,
  CalendarDays,
  Library,
  Wrench,
  Star,
  CircleHelp,
  Menu,
  AlignJustify,
  Search,
} from 'lucide-react';
import {
  Text,
  Card,
  Heading,
  Button,
  Dropdown,
  MasterItem,
  EmptyState,
  SearchInput,
  PageSkeleton,
} from '@/components/ui';
import useStore, { type BreadcrumbItem } from '@/store';
import { cn, getAutomaticBreadcrumbs } from '@/lib/utils';
import { PATHS } from '@/routes';
import { notificationsData, mockDashboardDeadlines, defaultEvents, messagesData } from '@/lib/data';
import { getNotificationIcon } from '@/components/Notifications';

// 1. Layout Primitives (formerly LayoutPrimitives.tsx)
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  gap?: string;
  columns?: number;
}

interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  span?: number;
  rowSpan?: number;
  x?: number;
  y?: number;
}

export function Grid({ gap, columns = 12, children, className = '', style, ...props }: GridProps) {
  const desktopGap = gap && ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(gap)
    ? `var(--space-${gap})`
    : gap || 'var(--space-lg)';

  return (
    <div
      className={cn('grid-container', className)}
      style={{
        '--grid-gap': desktopGap,
        '--grid-cols': columns,
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}

Grid.Item = function GridItem({
  span = 12,
  rowSpan = 1,
  x,
  y,
  children,
  className = '',
  style,
  ...props
}: GridItemProps) {
  return (
    <div
      className={cn(
        'grid-item h-full flex flex-col max-w-full transition-all duration-300 ease-in-out',
        props['draggable'] && 'border-2 border-dashed border-primary/30 rounded-[var(--radius-lg)] hover:border-primary/60 hover:bg-primary/5',
        className
      )}
      style={{
        '--span': span,
        '--row-span': rowSpan,
        gridColumnStart: x !== undefined ? x + 1 : undefined,
        gridRowStart: y !== undefined ? y + 1 : undefined,
        minWidth: 0,
        overflow: 'hidden',
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
};

export interface StackProps extends HTMLAttributes<HTMLElement> {
  direction?: 'row' | 'col';
  display?: 'flex' | 'grid' | 'inline-flex';
  gap?: 'none' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  tag?: ElementType;
  fullWidth?: boolean;
  full?: boolean;
  type?: string;
}

const gapClasses: Record<string, string> = {
  none: 'gap-0',
  '2xs': 'gap-[2px]',
  xs: 'gap-[var(--space-xs)]',
  sm: 'gap-[var(--space-sm)]',
  md: 'gap-[var(--space-md)]',
  lg: 'gap-[var(--space-lg)]',
  xl: 'gap-[var(--space-xl)]',
  '2xl': 'gap-[var(--space-2xl)]',
  '3xl': 'gap-[var(--space-3xl)]',
};

const alignClasses: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyClasses: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(({
  direction = 'col',
  display = 'flex',
  gap = 'md',
  align,
  justify,
  wrap,
  children,
  className = '',
  style,
  tag: Tag = 'div' as ElementType,
  fullWidth,
  full,
  ...props
}: StackProps, ref) => {
  return (
    <Tag
      ref={ref}
      className={cn(
        display,
        direction === 'row' ? 'flex-row' : 'flex-col',
        gapClasses[gap],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        wrap && 'flex-wrap',
        fullWidth && 'w-full',
        full && 'w-full h-full',
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </Tag>
  );
});
Stack.displayName = 'Stack';

// 2. Error Boundary (formerly ErrorBoundary.tsx)
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `Uncaught error in ${this.props.name || 'Component'}:`,
      error,
      errorInfo
    );
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  private handleKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return <ErrorDisplay onReset={this.handleReset} onKeyDown={this.handleKeyDown} />;
    }

    return this.props.children;
  }
}

function ErrorDisplay({
  onReset,
  onKeyDown,
}: {
  onReset: () => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
}) {
  const t = useStore(state => state.t);

  return (
    <Card
      variant="outlined"
      className="p-lg flex flex-col items-center justify-center text-center gap-md min-h-[150px] w-full"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="text-danger" size={32} aria-hidden="true" />
      <Stack gap="2xs">
        <Text weight="bold">{t('error_title')}</Text>
        <Text size="sm" muted>
          {t('error_message')}
        </Text>
      </Stack>
      <Button
        variant="secondary"
        size="sm"
        type="button"
        icon={RefreshCw}
        onClick={onReset}
        onKeyDown={onKeyDown}
        aria-label={t('try_again')}
      >
        {t('try_again')}
      </Button>
    </Card>
  );
}

// 3. Footer (formerly Footer.tsx)
export function Footer() {
  const t = useStore(state => state.t);
  return (
    <footer data-testid="footer" className="footer-main py-md border-t border-border/40 bg-bg-body relative z-10 w-full overflow-hidden">
      <div className="w-full px-[var(--space-md)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-sm w-full">
          <nav className="flex flex-wrap gap-x-md gap-y-2xs items-center">
            <a href="https://www.its.aau.dk" target="_blank" rel="noreferrer" className="text-text-secondary hover:text-primary transition-all duration-150 focus-visible:outline-none focus-visible:shadow-focus rounded-sm px-2xs">
              <Text size="sm" weight="bold">ITS Support</Text>
            </a>
            <span className="text-border/60 text-sm hidden sm:inline">&bull;</span>
            <a href="https://www.was.digst.dk/aau-dk" target="_blank" rel="noreferrer" className="text-text-secondary hover:text-primary transition-all duration-150 focus-visible:outline-none focus-visible:shadow-focus rounded-sm px-2xs">
              <Text size="sm" weight="bold">{t('accessibility_statement')}</Text>
            </a>
            <span className="text-border/60 text-sm hidden sm:inline">&bull;</span>
            <Button
              variant="ghost"
              onClick={(e) => e.preventDefault()}
              className="text-text-secondary hover:text-primary transition-all duration-150 h-auto p-0 min-h-[36px] inline-flex items-center bg-transparent hover:bg-transparent font-bold normal-case tracking-normal text-sm focus-visible:outline-none focus-visible:shadow-focus"
            >
              {t('service_status')}
            </Button>
          </nav>
          
          <Text size="sm" className="text-text-secondary font-medium text-left md:text-right leading-none shrink-0">
            &copy; {new Date().getFullYear()} Aalborg Universitet. {t('rights_reserved')}
          </Text>
        </div>
      </div>
    </footer>
  );
}

// 4. Notifications Dropdown (formerly NotificationsDropdown.tsx)
export function NotificationsDropdown() {
  const navigate = useNavigate();
  const t = useStore((state) => state.t);
  const lang = useStore((state) => state.lang);
  const notificationCount = useStore((state) => state.notificationCount);
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;

  return (
    <Dropdown>
      <Dropdown.Trigger>
        {({ ref, onKeyDown, onClick }, { isOpen }) => (
          <Button
            ref={ref as any}
            onKeyDown={onKeyDown}
            onClick={onClick}
            variant="ghost"
            size="icon"
            className={cn(
              "relative flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-150 active:scale-[0.95] border-none focus-visible:outline-none focus-visible:shadow-focus",
              isOpen
                ? "bg-primary/10 text-primary dark:bg-white/15 dark:text-white shadow-sm"
                : "text-text-main hover:bg-bg-highlight hover:text-primary dark:hover:bg-white/10"
            )}
            aria-label={t('notifications')}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            type="button"
          >
            <Bell size={20} strokeWidth={2} />
            {notificationCount > 0 && (
              <span className="absolute right-[2px] top-[2px] z-10 flex h-4.5 w-4.5 pointer-events-none items-center justify-center rounded-full border-2 border-bg-card bg-primary text-[9px] font-black leading-none text-white shadow-sm">
                <span>{notificationCount}</span>
                <span className="sr-only"> {notificationCount === 1 ? t('new_singular') : t('new_plural')}</span>
              </span>
            )}
          </Button>
        )}
      </Dropdown.Trigger>
      <Dropdown.Menu className="w-96 max-w-[calc(100dvw-1rem)]">
        {({ close }) => (
          <>
            <div className="flex items-center justify-between border-b border-border p-md">
              <Text size="sm" weight="bold" className="text-main">
                {t('notifications')}
              </Text>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  navigate(PATHS.NOTIFICATIONS);
                  close();
                }}
                className="rounded-md text-xs font-bold text-primary hover:underline bg-transparent border-none p-0 focus-visible:outline-none focus-visible:shadow-focus px-1 h-auto normal-case tracking-normal"
                type="button"
              >
                {t('view_all')}
              </Button>
            </div>
            <ul className="max-h-96 overflow-y-auto pr-1" role="none">
              {notificationsData.map((n) => {
                const Icon = getNotificationIcon(n.type);
                return (
                  <li key={n.id} role="none">
                    <Dropdown.Item
                      onClick={() => navigate(PATHS.NOTIFICATIONS)}
                      className={cn(
                        "border-b border-border/40 px-md py-md flex items-start gap-md",
                        !n.isRead ? "bg-primary/[0.06] hover:bg-primary/[0.09]" : "hover:bg-bg-hover"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/50",
                          !n.isRead ? "bg-primary/10 text-primary" : "bg-bg-hover text-muted"
                        )}
                      >
                        <Icon size={18} strokeWidth={2} />
                      </div>
                      <div className="flex flex-1 flex-col min-w-0">
                        <div className="flex items-center justify-between gap-xs">
                          <Text
                            size="xs"
                            weight="bold"
                            className={cn("block truncate flex-1", !n.isRead ? "text-main font-black" : "text-muted")}
                          >
                            {l(n.textDa, n.textEn)}
                          </Text>
                          {!n.isRead && (
                            <span className="shrink-0 text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary scale-90 leading-none">
                              {l('Ny', 'New')}
                            </span>
                          )}
                        </div>
                        <Text size="2xs" className="mt-xs text-muted">
                          {l(n.dateDa, n.dateEn)}
                        </Text>
                      </div>
                      {!n.isRead && (
                        <div className="mt-xs h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </Dropdown.Item>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}

// 5. Profile Dropdown (formerly ProfileDropdown.tsx)
export function ProfileDropdown() {
  const navigate = useNavigate();
  const t = useStore((state) => state.t);
  const firstName = useStore((state) => state.firstName);
  const lastName = useStore((state) => state.lastName);
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
  const lang = useStore((state) => state.lang);
  const setLang = useStore((state) => state.setLang);

  return (
    <Dropdown className="ml-2">
      <Dropdown.Trigger>
        {({ ref, onKeyDown, onClick }, { isOpen }) => (
          <button
            ref={ref as any}
            onKeyDown={onKeyDown}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="group relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-150 active:scale-95 shadow-sm focus-visible:outline-none focus-visible:shadow-focus"
            aria-label={t('user_menu')}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            type="button"
          >
            <div className={cn(
              "absolute inset-0 rounded-full transition-colors duration-150",
              isOpen
                ? "bg-primary/10 border-primary dark:bg-white/15 dark:border-white"
                : "bg-bg-highlight border-border group-hover:border-primary"
            )} />
            <UserIcon
              size={22}
              strokeWidth={2.5}
              className={cn(
                "relative z-10 transition-colors duration-150",
                isOpen ? "text-primary dark:text-white" : "text-main group-hover:text-primary"
              )}
            />
          </button>
        )}
      </Dropdown.Trigger>
      <Dropdown.Menu className="min-w-[240px] max-w-[calc(100dvw-1rem)] overflow-hidden">
        <div className="p-4 bg-bg-highlight/50 border-b border-border">
          <Text size="sm" weight="bold" className="text-main leading-none">
            {`${firstName} ${lastName}`}
          </Text>
          <Text size="xs" muted className="mt-1 font-bold opacity-60 italic">
            {t('common.user_role') || 'Studerende'}
          </Text>
        </div>

        <div role="none" className="py-2">
          <Dropdown.Item onClick={() => navigate(`${PATHS.SETTINGS}?tab=profil`)}>
            <MasterItem
              leading={UserIcon}
              leadingClassName="text-primary"
              title={t('profile')}
            />
          </Dropdown.Item>
          <Dropdown.Item onClick={() => navigate(PATHS.SETTINGS)}>
            <MasterItem
              leading={Settings}
              leadingClassName="text-primary"
              title={t('settings')}
            />
          </Dropdown.Item>
          <Dropdown.Item onClick={() => navigate(PATHS.MESSAGES)}>
            <MasterItem
              leading={Mail}
              leadingClassName="text-primary"
              title={t('nav.messages')}
            />
          </Dropdown.Item>
        </div>

        <div role="none" className="py-2 border-t border-border">
          <Dropdown.Item onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}>
            <MasterItem
              leading={theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor}
              leadingClassName="text-primary"
              title={`${t('appearance')}: ${t('theme.' + theme)}`}
            />
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setLang(lang === 'da' ? 'en' : 'da')}>
            <MasterItem
              leading={Globe}
              leadingClassName="text-primary"
              title={`${t('cat_select_language')}: ${lang.toUpperCase()}`}
            />
          </Dropdown.Item>
        </div>

        <div role="none" className="border-t border-border bg-danger/[0.02] py-2">
          <Dropdown.Item onClick={() => {}}>
            <MasterItem
              leading={LogOut}
              leadingClassName="text-danger"
              title={t('logout')}
            />
          </Dropdown.Item>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}

// 6. Search Hooks & Subcomponents (formerly useRecentSearches.ts, useSearchFiltering.ts, useTopbarSearch.ts, SearchResults.tsx)
interface RecentSearch {
  id: string;
  text: string;
  link: string;
  type: 'course' | 'assignment' | 'message' | 'query' | 'calendar';
}

function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const loaded = localStorage.getItem('aau_recent_searches');
    if (loaded) {
      try {
        setRecentSearches(JSON.parse(loaded).slice(0, 5));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  const saveRecentSearches = (items: RecentSearch[]) => {
    setRecentSearches(items);
    localStorage.setItem('aau_recent_searches', JSON.stringify(items));
  };

  const addRecentSearch = (item: RecentSearch) => {
    const filtered = recentSearches.filter(x => x.link !== item.link && x.text !== item.text);
    const updated = [item, ...filtered].slice(0, 5);
    saveRecentSearches(updated);
  };

  const removeRecentSearch = (id: string) => {
    const updated = recentSearches.filter(x => x.id !== id);
    saveRecentSearches(updated);
  };

  const clearAllRecent = () => {
    saveRecentSearches([]);
    localStorage.removeItem('aau_recent_searches');
  };

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearAllRecent,
  };
}

interface GroupedResults {
  courses: any[];
  assignments: typeof mockDashboardDeadlines;
  messages: typeof messagesData;
  calendar: typeof defaultEvents[keyof typeof defaultEvents][];
}

function useSearchFiltering(debouncedQuery: string, courses: any[], lang: string) {
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;
  const groupedResults = useMemo<GroupedResults>(() => {
    const query = debouncedQuery.trim().toLowerCase();
    if (query.length < 3) {
      return { courses: [], assignments: [], messages: [], calendar: [] };
    }

    const filteredCourses = courses.filter(c =>
      c.title.toLowerCase().includes(query) ||
      (c.titleEn && c.titleEn.toLowerCase().includes(query)) ||
      (c.code && c.code.toLowerCase().includes(query))
    );

    const filteredAssignments = mockDashboardDeadlines.filter(d =>
      d.titleDa.toLowerCase().includes(query) ||
      d.titleEn.toLowerCase().includes(query)
    );

    const filteredMessages = messagesData.filter(m =>
      (m.name && m.name.toLowerCase().includes(query)) ||
      (m.nameDa && m.nameDa.toLowerCase().includes(query)) ||
      (m.nameEn && m.nameEn.toLowerCase().includes(query)) ||
      (m.msgDa && m.msgDa.toLowerCase().includes(query)) ||
      (m.msgEn && m.msgEn.toLowerCase().includes(query))
    );

    const filteredCalendar = Object.values(defaultEvents).filter(e =>
      (e.title && e.title.toLowerCase().includes(query)) ||
      (e.titleDa && e.titleDa.toLowerCase().includes(query)) ||
      (e.titleEn && e.titleEn.toLowerCase().includes(query)) ||
      (e.location && e.location.toLowerCase().includes(query))
    );

    return {
      courses: filteredCourses,
      assignments: filteredAssignments,
      messages: filteredMessages,
      calendar: filteredCalendar,
    };
  }, [courses, debouncedQuery]);

  const totalResultCount = useMemo(() => {
    return (
      groupedResults.courses.length +
      groupedResults.assignments.length +
      groupedResults.messages.length +
      groupedResults.calendar.length
    );
  }, [groupedResults]);

  const flattenedResults = useMemo(() => {
    const list: {
      type: 'course' | 'assignment' | 'message' | 'calendar';
      id: string | number;
      title: string;
      subtitle: string;
      link: string;
      raw: any;
    }[] = [];

    groupedResults.courses.forEach(c => {
      list.push({
        type: 'course',
        id: `course-${c.id}`,
        title: l(c.title, c.titleEn),
        subtitle: c.code ?? '',
        link: PATHS.COURSE(c.id),
        raw: c,
      });
    });

    groupedResults.assignments.forEach(a => {
      list.push({
        type: 'assignment',
        id: `assignment-${a.id}`,
        title: l(a.titleDa, a.titleEn),
        subtitle: l('Afleveringsopgave', 'Assignment'),
        link: PATHS.SUBMISSION(a.courseId, a.id),
        raw: a,
      });
    });

    groupedResults.messages.forEach(m => {
      list.push({
        type: 'message',
        id: `message-${m.id}`,
        title: l(m.nameDa || m.name || '', m.nameEn || m.name || ''),
        subtitle: l(m.msgDa, m.msgEn),
        link: PATHS.MESSAGES,
        raw: m,
      });
    });

    groupedResults.calendar.forEach(e => {
      list.push({
        type: 'calendar',
        id: `calendar-${e.id}`,
        title: l(e.titleDa || e.title || '', e.titleEn || e.title || ''),
        subtitle: `${e.time} · ${e.location}`,
        link: PATHS.CALENDAR,
        raw: e,
      });
    });

    return list;
  }, [groupedResults, lang]);

  return {
    groupedResults,
    totalResultCount,
    flattenedResults,
  };
}

function useTopbarSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useStore(state => state.t);
  const lang = useStore(state => state.lang);
  const courses = useStore(state => state.courses);
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const shouldShowSearchInput = !isMobile || isMobileExpanded;

  const {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearAllRecent,
  } = useRecentSearches();

  const {
    groupedResults,
    totalResultCount,
    flattenedResults,
  } = useSearchFiltering(debouncedQuery, courses, lang);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileExpanded(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsDropdownVisible(false);
        if (isMobile) {
          setIsMobileExpanded(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  useEffect(() => {
    if (!location.pathname.startsWith('/search')) {
      setSearchQuery('');
      setDebouncedQuery('');
    }
    setIsDropdownVisible(false);
    setIsMobileExpanded(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.trim().length >= 3 && searchQuery !== debouncedQuery) {
      const loadingHandler = setTimeout(() => {
        setIsLoading(true);
      }, 150);
      return () => clearTimeout(loadingHandler);
    } else {
      setIsLoading(false);
    }
  }, [searchQuery, debouncedQuery]);

  const handleItemSelect = (item: any) => {
    navigate(item.link);
    setSearchQuery('');
    setIsDropdownVisible(false);

    const recentLabel = item.type === 'message'
      ? l(`Besked fra: ${item.title}`, `Message from: ${item.title}`)
      : item.title;

    addRecentSearch({
      id: `${item.type}-${item.raw.id}`,
      text: recentLabel,
      link: item.link,
      type: item.type,
    });
  };

  const handleRecentClick = (recent: any) => {
    navigate(recent.link);
    setIsDropdownVisible(false);
  };

  const suggestedDestinations = useMemo(() => [
    { label: l('Kurser', 'Courses'), link: PATHS.COURSES, type: 'course' as const },
    { label: l('Afleveringer', 'Assignments'), link: PATHS.CALENDAR, type: 'assignment' as const },
    { label: l('Beskeder', 'Messages'), link: PATHS.MESSAGES, type: 'message' as const },
    { label: l('Kalender', 'Calendar'), link: PATHS.CALENDAR, type: 'calendar' as const },
  ], [lang]);

  const handleSuggestedClick = (dest: typeof suggestedDestinations[0]) => {
    navigate(dest.link);
    setIsDropdownVisible(false);
  };

  const handleSearchEnter = (e: ReactKeyboardEvent<HTMLInputElement> | { key: string }) => {
    if ('preventDefault' in e && e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSearchIndex(prev => (prev < flattenedResults.length - 1 ? prev + 1 : prev));
      return;
    }
    if ('preventDefault' in e && e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSearchIndex(prev => (prev > -1 ? prev - 1 : prev));
      return;
    }
    if ('preventDefault' in e && e.key === 'Escape') {
      if (isDropdownVisible) {
        setIsDropdownVisible(false);
        setActiveSearchIndex(-1);
      } else {
        setSearchQuery('');
      }
      return;
    }

    if (e.key === 'Enter') {
      if (activeSearchIndex >= 0 && activeSearchIndex < flattenedResults.length) {
        handleItemSelect(flattenedResults[activeSearchIndex]);
      } else if (searchQuery.trim()) {
        const query = searchQuery.trim();
        addRecentSearch({
          id: `query-${query}`,
          text: l(`Søgning: "${query}"`, `Search: "${query}"`),
          link: `${PATHS.SEARCH}?q=` + encodeURIComponent(query),
          type: 'query',
        });
        navigate(`${PATHS.SEARCH}?q=` + encodeURIComponent(query));
        setIsDropdownVisible(false);
      }
    }
  };

  const handleContainerBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDropdownVisible(false);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    isDropdownVisible,
    setIsDropdownVisible,
    activeSearchIndex,
    setActiveSearchIndex,
    isMobile,
    isMobileExpanded,
    setIsMobileExpanded,
    isLoading,
    searchRef,
    shouldShowSearchInput,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearAllRecent,
    suggestedDestinations,
    groupedResults,
    totalResultCount,
    flattenedResults,
    handleItemSelect,
    handleRecentClick,
    handleSuggestedClick,
    handleSearchEnter,
    handleContainerBlur,
    lang,
    t,
    navigate,
  };
}

const DEST_ICONS: Record<string, React.ComponentType<any>> = {
  course: GraduationCap,
  assignment: ClipboardList,
  message: MessageSquare,
  calendar: Calendar,
};

const TYPE_ICONS: Record<string, { icon: React.ComponentType<any>; bg: string; color: string }> = {
  course: { icon: GraduationCap, bg: 'bg-primary/10', color: 'text-primary' },
  assignment: { icon: ClipboardList, bg: 'bg-success/10', color: 'text-success' },
  message: { icon: MessageSquare, bg: 'bg-info/10', color: 'text-info' },
  calendar: { icon: Calendar, bg: 'bg-warning/10', color: 'text-warning' },
};

function SearchLoading({ lang }: { lang: string }) {
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;
  return (
    <div className="search-dropdown-loading p-md flex items-center justify-center gap-xs">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent shrink-0" />
      <Text size="xs" muted>{l('Søger...', 'Searching...')}</Text>
    </div>
  );
}

function SearchNoQuery({
  searchQuery,
  recentSearches,
  suggestedDestinations,
  onRecentClick,
  onSuggestedClick,
  onRemoveRecent,
  onClearAllRecent,
  lang,
}: {
  searchQuery: string;
  recentSearches: RecentSearch[];
  suggestedDestinations: Array<{ label: string; link: string; type: 'course' | 'assignment' | 'message' | 'calendar' }>;
  onRecentClick: (recent: RecentSearch) => void;
  onSuggestedClick: (dest: any) => void;
  onRemoveRecent: (id: string) => void;
  onClearAllRecent: () => void;
  lang: string;
}) {
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;
  return (
    <div className="flex flex-col overflow-y-auto">
      {searchQuery.trim().length > 0 && (
        <div className="p-xs px-md bg-warning/10 text-warning text-xs font-semibold">
          {l('Skriv mindst 3 tegn for en dybdegående søgning', 'Type at least 3 characters for deep search')}
        </div>
      )}

      {recentSearches.length > 0 && (
        <div className="recent-searches-section border-b border-border/40 p-sm px-md flex flex-col gap-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              {l('Seneste søgninger', 'Recent Searches')}
            </span>
            <button
              type="button"
              className="text-[10px] font-bold text-danger hover:underline border-none bg-transparent cursor-pointer"
              onClick={onClearAllRecent}
            >
              {l('Ryd alle', 'Clear all')}
            </button>
          </div>
          <div className="flex flex-col gap-2xs mt-xs">
            {recentSearches.map((recent) => (
              <div
                key={recent.id}
                className="flex items-center justify-between p-xs hover:bg-bg-hover rounded cursor-pointer group/recent"
                onClick={() => onRecentClick(recent)}
              >
                <div className="flex items-center gap-xs text-xs text-main min-w-0 flex-1">
                  <Clock size={12} className="text-muted opacity-60 shrink-0" />
                  <span className="truncate">{recent.text}</span>
                </div>
                <button
                  type="button"
                  className="text-muted hover:text-danger p-[2px] rounded hover:bg-danger/10 opacity-0 group-hover/recent:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRecent(recent.id);
                  }}
                  aria-label={l('Fjern søgning', 'Remove search')}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="suggested-destinations p-sm px-md flex flex-col gap-2xs">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
          {l('Foreslåede genveje', 'Suggested shortcuts')}
        </span>
        <div className="grid grid-cols-2 gap-xs mt-xs">
          {suggestedDestinations.map((dest) => {
            const Icon = DEST_ICONS[dest.type];
            return (
              <div
                key={dest.type}
                className="flex items-center gap-xs p-xs border border-border/40 hover:border-primary/40 rounded-[var(--radius-md)] bg-bg-highlight/10 hover:bg-bg-hover cursor-pointer transition-colors"
                onClick={() => onSuggestedClick(dest)}
              >
                {Icon && <Icon size={14} className="text-primary shrink-0" />}
                <span className="text-xs font-semibold text-main truncate">{dest.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SearchResultItem({
  type,
  id,
  index,
  activeSearchIndex,
  title,
  subtitle,
  onClick,
  onHover,
}: {
  type: string;
  id: string | number;
  index: number;
  activeSearchIndex: number;
  title: string;
  subtitle?: string;
  onClick: () => void;
  onHover: () => void;
}) {
  const config = TYPE_ICONS[type];
  const Icon = config?.icon || GraduationCap;
  const iconBg = config?.bg || 'bg-primary/10';
  const iconColor = config?.color || 'text-primary';

  return (
    <div
      id={`search-item-${id}`}
      className={cn(
        "search-dropdown-item flex items-center justify-between p-xs px-md cursor-pointer transition-colors group/row",
        index === activeSearchIndex ? "bg-bg-hover" : "hover:bg-bg-hover"
      )}
      onClick={onClick}
      onMouseEnter={onHover}
      role="option"
      aria-selected={index === activeSearchIndex}
    >
      <div className="flex items-center gap-md min-w-0 flex-1">
        <div className={`w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon size={16} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-main truncate">{title}</span>
          {subtitle && <span className="text-xs text-text-muted font-medium truncate">{subtitle}</span>}
        </div>
      </div>
      <ChevronRight size={14} className="text-muted opacity-40 group-hover/row:opacity-100 shrink-0 ml-xs" />
    </div>
  );
}

function SearchCategoryGroup({
  label,
  items,
  type,
  flattenedResults,
  activeSearchIndex,
  onItemSelect,
  onHover,
}: {
  label: string;
  items: any[];
  type: string;
  flattenedResults: any[];
  activeSearchIndex: number;
  onItemSelect: (item: any) => void;
  onHover: (index: number) => void;
}) {
  return (
    <div className="category-group border-b border-border/30 pb-2xs">
      <div className="category-header p-xs px-md bg-bg-highlight/40 text-xs font-bold text-text-muted uppercase tracking-wider">
        {label}
      </div>
      {items.map((item) => {
        const index = flattenedResults.findIndex((x: any) => x.type === type && x.raw.id === item.id);
        return (
          <SearchResultItem
            key={item.id}
            type={type}
            id={item.id}
            index={index}
            activeSearchIndex={activeSearchIndex}
            title={item.title || item.titleDa || item.titleEn || item.name}
            subtitle={item.code || item.time}
            onClick={() => onItemSelect(flattenedResults[index])}
            onHover={() => onHover(index)}
          />
        );
      })}
    </div>
  );
}

function SearchResults({
  searchQuery,
  isLoading,
  activeSearchIndex,
  recentSearches,
  suggestedDestinations,
  groupedResults,
  totalResultCount,
  flattenedResults,
  handleItemSelect,
  handleRecentClick,
  handleSuggestedClick,
  removeRecentSearch,
  clearAllRecent,
  addRecentSearch,
  setActiveSearchIndex,
  navigate,
  lang,
  t,
  setIsDropdownVisible,
}: {
  searchQuery: string;
  isLoading: boolean;
  activeSearchIndex: number;
  recentSearches: RecentSearch[];
  suggestedDestinations: Array<{ label: string; link: string; type: 'course' | 'assignment' | 'message' | 'calendar' }>;
  groupedResults: {
    courses: any[];
    assignments: any[];
    messages: any[];
    calendar: any[];
  };
  totalResultCount: number;
  flattenedResults: Array<{
    type: string;
    id: string | number;
    title: string;
    subtitle: string;
    link: string;
    raw: any;
  }>;
  handleItemSelect: (item: any) => void;
  handleRecentClick: (recent: RecentSearch) => void;
  handleSuggestedClick: (dest: any) => void;
  removeRecentSearch: (id: string) => void;
  clearAllRecent: () => void;
  addRecentSearch: (item: RecentSearch) => void;
  setActiveSearchIndex: (index: number) => void;
  navigate: (path: string) => void;
  lang: string;
  t: (key: string) => string;
  setIsDropdownVisible: (visible: boolean) => void;
}) {
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;
  const handleFooterClick = (query: string) => {
    addRecentSearch({
      id: `query-${query}`,
      text: l(`Søgning: "${query}"`, `Search: "${query}"`),
      link: `${PATHS.SEARCH}?q=` + encodeURIComponent(query),
      type: 'query',
    });
    navigate(`${PATHS.SEARCH}?q=` + encodeURIComponent(query));
    setIsDropdownVisible(false);
  };

  return (
    <div 
      id="search-results-listbox"
      role="listbox"
      aria-label={t('search_results_plural')}
      className="topbar__search-dropdown topbar-panel topbar-panel--search flex flex-col max-h-[480px] overflow-hidden"
    >
      {isLoading ? (
        <SearchLoading lang={lang} />
      ) : searchQuery.trim().length < 3 ? (
        <SearchNoQuery
          searchQuery={searchQuery}
          recentSearches={recentSearches}
          suggestedDestinations={suggestedDestinations}
          onRecentClick={handleRecentClick}
          onSuggestedClick={handleSuggestedClick}
          onRemoveRecent={removeRecentSearch}
          onClearAllRecent={clearAllRecent}
          lang={lang}
        />
      ) : (
        <>
          <div className="search-dropdown-header p-sm px-md bg-bg-hover border-b border-border/40">
            <Text size="xs" weight="bold" muted>
              {totalResultCount === 1
                ? `1 ${t('search_results_singular')}`
                : `${totalResultCount} ${t('search_results_plural')}`}
            </Text>
          </div>
          {totalResultCount > 0 ? (
            <div className="flex flex-col overflow-y-auto max-h-[360px]">
              {groupedResults.courses.length > 0 && (
                <SearchCategoryGroup
                  label={l('Kurser', 'Courses')}
                  items={groupedResults.courses}
                  type="course"
                  flattenedResults={flattenedResults}
                  activeSearchIndex={activeSearchIndex}
                  onItemSelect={handleItemSelect}
                  onHover={setActiveSearchIndex}
                />
              )}
              {groupedResults.assignments.length > 0 && (
                <SearchCategoryGroup
                  label={l('Afleveringer', 'Assignments')}
                  items={groupedResults.assignments}
                  type="assignment"
                  flattenedResults={flattenedResults}
                  activeSearchIndex={activeSearchIndex}
                  onItemSelect={handleItemSelect}
                  onHover={setActiveSearchIndex}
                />
              )}
              {groupedResults.messages.length > 0 && (
                <SearchCategoryGroup
                  label={l('Beskeder', 'Messages')}
                  items={groupedResults.messages}
                  type="message"
                  flattenedResults={flattenedResults}
                  activeSearchIndex={activeSearchIndex}
                  onItemSelect={handleItemSelect}
                  onHover={setActiveSearchIndex}
                />
              )}
              {groupedResults.calendar.length > 0 && (
                <SearchCategoryGroup
                  label={l('Kalender', 'Calendar')}
                  items={groupedResults.calendar}
                  type="calendar"
                  flattenedResults={flattenedResults}
                  activeSearchIndex={activeSearchIndex}
                  onItemSelect={handleItemSelect}
                  onHover={setActiveSearchIndex}
                />
              )}
            </div>
          ) : (
            <div className="search-dropdown-empty py-md">
              <EmptyState icon={Search} title={t('no_search_results')} />
            </div>
          )}
          {searchQuery.trim() && (
            <button
              type="button"
              className="w-full border-none cursor-pointer focus-visible:outline-none focus-visible:shadow-focus search-dropdown-footer p-sm px-md text-center border-t border-border bg-card hover:bg-bg-hover font-medium block relative"
              onClick={() => handleFooterClick(searchQuery.trim())}
            >
              <span className="text-sm font-medium topbar__all-results">{t('all_results')} &ldquo;{searchQuery}&rdquo;</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function TopbarSearch({ children }: { children: React.ReactNode }) {
  const {
    searchQuery,
    setSearchQuery,
    isDropdownVisible,
    setIsDropdownVisible,
    activeSearchIndex,
    setActiveSearchIndex,
    isMobile,
    isMobileExpanded,
    setIsMobileExpanded,
    isLoading,
    searchRef,
    shouldShowSearchInput,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearAllRecent,
    suggestedDestinations,
    groupedResults,
    totalResultCount,
    flattenedResults,
    handleItemSelect,
    handleRecentClick,
    handleSuggestedClick,
    handleSearchEnter,
    handleContainerBlur,
    lang,
    t,
    navigate,
  } = useTopbarSearch();
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;

  return (
    <>
      {shouldShowSearchInput && (
        <div 
          className={cn(
            "topbar__search-wrapper flex flex-1 justify-center px-xl z-[var(--z-topbar-search,1002)] min-w-0 transition-all duration-150",
            isMobile && "absolute left-0 right-0 top-0 bottom-0 bg-bg-topbar backdrop-blur-md px-md py-xs flex items-center justify-between z-[1003] border-b border-border"
          )}
          onBlur={handleContainerBlur}
        >
          <div className="search-container-relative relative w-full max-w-[clamp(300px,30vw,480px)]" ref={searchRef}>
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setIsDropdownVisible(true);
              }}
              onFocus={() => setIsDropdownVisible(true)}
              onKeyDown={handleSearchEnter}
              placeholder={isMobile ? l('Søg...', 'Search...') : l('Søg i fag, afleveringer og beskeder...', 'Search courses, assignments and messages...')}
              className="topbar__search-input-wrapper w-full"
              role="combobox"
              aria-expanded={isDropdownVisible}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              aria-controls="search-results-listbox"
              aria-activedescendant={activeSearchIndex >= 0 && activeSearchIndex < flattenedResults.length ? `search-item-${flattenedResults[activeSearchIndex].id}` : undefined}
            />
            {isDropdownVisible && (
              <SearchResults
                searchQuery={searchQuery}
                isLoading={isLoading}
                activeSearchIndex={activeSearchIndex}
                recentSearches={recentSearches}
                suggestedDestinations={suggestedDestinations}
                groupedResults={groupedResults}
                totalResultCount={totalResultCount}
                flattenedResults={flattenedResults}
                handleItemSelect={handleItemSelect}
                handleRecentClick={handleRecentClick}
                handleSuggestedClick={handleSuggestedClick}
                removeRecentSearch={removeRecentSearch}
                clearAllRecent={clearAllRecent}
                addRecentSearch={addRecentSearch}
                setActiveSearchIndex={setActiveSearchIndex}
                navigate={navigate}
                lang={lang}
                t={t}
                setIsDropdownVisible={setIsDropdownVisible}
              />
            )}
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileExpanded(false)}
              className="ml-xs text-text-muted hover:text-main shrink-0"
            >
              {l('Annuller', 'Cancel')}
            </Button>
          )}
        </div>
      )}

      {(!isMobile || !isMobileExpanded) && (
        <div className="topbar__right-section flex items-center justify-end gap-sm sm:gap-md shrink-0 ml-auto">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileExpanded(true)}
              aria-label={t('search')}
              className="h-11 w-11 text-text-main hover:bg-bg-highlight rounded-lg flex items-center justify-center border-none"
            >
              <Search size={20} strokeWidth={2} />
            </Button>
          )}
          {children}
        </div>
      )}
    </>
  );
}

// 7. Sidebar (formerly Sidebar.tsx)
export function Sidebar() {
  const t = useStore(state => state.t);
  const isCollapsed = useStore(state => state.isCollapsed);
  const setCollapsed = useStore(state => state.setCollapsed);
  const lang = useStore(state => state.lang);
  const l = <T,>(da: T, en: T): T => lang === 'da' ? da : en;
  const location = useLocation();

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1280 : true);
  
  const sidebarRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isDesktop && !isCollapsed) {
          setCollapsed(true);
          setTimeout(() => {
            const btn = document.querySelector('button[aria-label*="sidebar"], button[aria-label*="menu"]');
            (btn as HTMLElement)?.focus();
          }, 50);
        } else if (isDesktop && (isHovered || isFocused)) {
          setIsFocused(false);
          setIsHovered(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, isCollapsed, isHovered, isFocused, setCollapsed]);

  useEffect(() => {
    if (!isDesktop && !isCollapsed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDesktop, isCollapsed]);

  useEffect(() => {
    if (isDesktop || isCollapsed) return;

    const focusables = sidebarRef.current?.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables && focusables.length > 0) {
      (focusables[0] as HTMLElement).focus();
    }

    const handleTabTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (!sidebarRef.current) return;

      const items = sidebarRef.current.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!items || items.length === 0) return;

      const first = items[0] as HTMLElement;
      const last = items[items.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleTabTrap);
    return () => window.removeEventListener('keydown', handleTabTrap);
  }, [isDesktop, isCollapsed]);

  useEffect(() => {
    if (!isDesktop) {
      if (!isCollapsed) {
        wasOpen.current = true;
      } else if (isCollapsed && wasOpen.current) {
        wasOpen.current = false;
        setTimeout(() => {
          if (typeof document !== 'undefined') {
            const btn = document.querySelector('button[aria-label*="sidebar"], button[aria-label*="menu"]');
            (btn as HTMLElement)?.focus();
          }
        }, 50);
      }
    }
  }, [isCollapsed, isDesktop]);

  const handleNavItemClick = () => {
    if (!isDesktop) {
      setCollapsed(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsFocused(false);
    }
  };

  const isHoveredOrFocused = isHovered || isFocused;
  const isExpanded = !isCollapsed || (isDesktop && isHoveredOrFocused);

  const logoSrc = !isExpanded
    ? t('aau_logo_center_src')
    : t('aau_logo_left_src');

  const isCourseActive = location.pathname.startsWith('/courses') || location.pathname.startsWith('/course/') || location.pathname.startsWith('/submission/') || location.pathname.startsWith('/forum/');

  return (
    <>
      {!isDesktop && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
          onClick={() => setCollapsed(true)}
          data-testid="sidebar-backdrop"
        />
      )}
      <aside
        data-testid="sidebar"
        ref={sidebarRef}
        id="sidebar"
        aria-label={t('navigation_menu')}
        className={`bg-bg-sidebar h-screen flex flex-col p-0 transition-all duration-200 ease-[var(--transition-ease)] border-r border-white/10 fixed top-0 left-0 z-50 ${isDesktop ? (isExpanded ? 'w-[var(--sidebar-width)]' : 'w-[var(--sidebar-collapsed-width)]') : 'w-[var(--sidebar-width)]'}`}
        style={{
          maxWidth: '100dvw',
          transform: !isDesktop && isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
          boxShadow: isDesktop && isExpanded && isCollapsed ? 'var(--shadow-lg)' : 'none',
        }}
        data-collapsed={isCollapsed}
        onMouseEnter={() => isDesktop && setIsHovered(true)}
        onMouseLeave={() => isDesktop && setIsHovered(false)}
        onFocus={() => isDesktop && setIsFocused(true)}
        onBlur={handleBlur}
      >
        <div className={`h-[var(--topbar-height)] flex items-center p-0 shrink-0 ${!isExpanded ? 'justify-center' : 'justify-start pl-md'}`}>
          <NavLink to="/" onClick={handleNavItemClick} className={`flex items-center ${!isExpanded ? 'justify-center' : 'justify-start'} no-underline p-xs sm:p-sm rounded-md transition-colors duration-150 hover:bg-white/5`}>
            <img
              src={logoSrc}
              alt={t('aau_logo_alt')}
              className={`object-contain transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${!isExpanded ? 'h-[var(--space-3xl)] w-[var(--space-3xl)]' : 'h-[var(--space-4xl)] w-auto aspect-[4/1]'}`}
            />
          </NavLink>
        </div>

        <nav className="flex flex-col p-0 flex-1 overflow-hidden">
          <div className="flex flex-col p-sm gap-2xs overflow-hidden">
            <SidebarNavItem to="/" icon={House} label={t('dashboard')} collapsed={!isExpanded} onClick={handleNavItemClick} />
            <SidebarNavItem to="/calendar" icon={CalendarDays} label={t('calendar')} collapsed={!isExpanded} onClick={handleNavItemClick} />
            <SidebarNavItem to="/favorites" icon={Star} label={t('favorites')} collapsed={!isExpanded} onClick={handleNavItemClick} />
            <SidebarNavItem to="/courses" icon={Library} label={t('courses')} collapsed={!isExpanded} isActiveOverride={isCourseActive} onClick={handleNavItemClick} />
            <SidebarNavItem to="/resources" icon={Wrench} label={t('resources')} collapsed={!isExpanded} onClick={handleNavItemClick} />
          </div>

          <div className={`flex flex-col p-sm pt-xs gap-2xs border-t border-white/10 pb-xl ${!isExpanded ? 'items-center' : ''}`}>
            {!isExpanded ? (
              <div className="w-8 h-px bg-white/10 my-xs shrink-0" aria-hidden="true" />
            ) : (
              <div className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider px-sm mb-xs mt-2xs shrink-0 select-none">
                {l('Support & Indstillinger', 'Support & Settings')}
              </div>
            )}
            <SidebarNavItem to="/support" icon={CircleHelp} label={t('contact_its_support')} collapsed={!isExpanded} dimmed onClick={handleNavItemClick} />
            <SidebarNavItem to="/settings" icon={Settings} label={t('settings')} collapsed={!isExpanded} dimmed onClick={handleNavItemClick} />
          </div>
        </nav>
      </aside>
    </>
  );
}

interface SidebarNavItemProps {
  to: string;
  icon: typeof House;
  label: string;
  onClick?: () => void;
  collapsed?: boolean;
  isActiveOverride?: boolean;
  dimmed?: boolean;
}

function SidebarNavItem({ to, icon: Icon, label, onClick, collapsed, isActiveOverride, dimmed }: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      aria-label={label}
      className={({ isActive }) => {
        const active = isActiveOverride !== undefined ? isActiveOverride : isActive;
        const opacityClass = dimmed ? 'opacity-70' : '';
        return `nav-item group relative flex items-center gap-[6px] p-sm h-[var(--space-3xl)] min-h-[var(--space-3xl)] no-underline rounded-md cursor-pointer text-left w-full focus-visible:outline-none ${active ? 'active' : ''} ${collapsed ? 'justify-center !px-0' : ''} ${opacityClass}`;
      }}
    >
      {({ isActive }) => {
        const active = isActiveOverride !== undefined ? isActiveOverride : isActive;
        return (
          <>
            <Icon size={20} strokeWidth={2.5} className={`shrink-0 transition-transform duration-150 ease-[var(--transition-ease)] ${active ? 'scale-110 translate-x-1' : 'group-hover:scale-110'}`} />
            {!collapsed && <span className="whitespace-nowrap transition-opacity duration-150 tracking-tight text-sm">{label}</span>}
            {collapsed && (
              <span 
                className="sidebar-tooltip absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 px-xs py-3xs bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 border border-white/10"
                role="tooltip"
              >
                {label}
              </span>
            )}
          </>
        );
      }}
    </NavLink>
  );
}

// 8. Topbar (formerly Topbar.tsx)
export function Topbar() {
  const location = useLocation();
  const isCollapsed = useStore(state => state.isCollapsed);
  const toggleSidebar = useStore(state => state.toggleSidebar);
  const t = useStore(state => state.t);
  const lang = useStore(state => state.lang);
  const breadcrumbs = useStore(state => state.breadcrumbs);

  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1280 : true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeBreadcrumbs = (breadcrumbs && breadcrumbs.length > 0)
    ? breadcrumbs
    : getAutomaticBreadcrumbs(location.pathname, lang, t);

  const sidebarIcon = isCollapsed ? <Menu size={20} strokeWidth={2} /> : <AlignJustify size={20} strokeWidth={2} />;

  const left = isDesktop ? (isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)') : '0px';

  return (
    <nav
      data-testid="topbar"
      className="fixed top-0 right-0 h-[var(--topbar-height)] bg-bg-topbar backdrop-blur-[12px] saturate-[180%] flex items-center z-40 border-b border-border transition-all duration-300 ease-in-out pr-[var(--space-md)]"
      style={{
        left,
        width: 'auto',
      }}
    >
      <div className="flex items-center shrink-0 gap-sm">
        <Button
          variant="ghost"
          size="icon"
          className="w-11 h-11 text-text-main bg-transparent hover:bg-bg-highlight dark:hover:bg-white/10 active:scale-[0.95] rounded-lg border-none focus-visible:outline-none focus-visible:shadow-focus"
          onClick={toggleSidebar}
          aria-label={t('toggle_sidebar')}
          type="button"
        >
          {sidebarIcon}
        </Button>

        {activeBreadcrumbs && activeBreadcrumbs.length > 0 && (
          <nav className="flex flex-row items-center flex-wrap gap-2xs ml-sm">
            {activeBreadcrumbs.map((crumb, idx) => (
              <Fragment key={idx}>
                {idx > 0 && <ChevronRight size={14} strokeWidth={2.5} className="shrink-0 opacity-40 text-muted" />}
                {crumb.href ? (
                  <Link to={crumb.href} className="text-muted hover:text-primary transition-colors font-bold focus-visible:outline-none focus-visible:shadow-focus rounded-sm px-2xs">
                    <Text tag="span" size="sm" weight="semibold">{crumb.label}</Text>
                  </Link>
                ) : (
                  <Text tag="span" weight="black" size="md" className="text-text-main tracking-tight">{crumb.label}</Text>
                )}
              </Fragment>
            ))}
          </nav>
        )}
      </div>

      <TopbarSearch>
        <NotificationsDropdown />
        <ProfileDropdown />
      </TopbarSearch>
    </nav>
  );
}

// 9. Page Header (formerly PageHeader.tsx)
export interface PageHeaderProps {
  pageKey?: string;
  title?: string;
  subtitle?: string;
  flat?: boolean;
  actions?: ReactNode;
  actionsAlign?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
  className?: string;
  titleProps?: React.HTMLAttributes<HTMLHeadingElement> & { 'data-testid'?: string };
}

export function PageHeader({
  pageKey,
  title,
  subtitle,
  flat = false,
  actions,
  actionsAlign = 'start',
  breadcrumbs,
  children,
  className,
  titleProps,
}: PageHeaderProps) {
  const t = useStore(state => state.t);
  const setBreadcrumbs = useStore(state => state.setBreadcrumbs);

  const breadcrumbsStr = JSON.stringify(breadcrumbs);

  useEffect(() => {
    setBreadcrumbs(breadcrumbsStr ? JSON.parse(breadcrumbsStr) : undefined);
    return () => {
      setBreadcrumbs(undefined);
    };
  }, [breadcrumbsStr, setBreadcrumbs]);

  const headerLabel = title !== undefined ? title : t(pageKey || '');

  return (
    <header
      role="banner"
      aria-label={headerLabel}
      className={cn(
        `page-header on-dark relative overflow-hidden box-border w-full max-w-full min-w-0 ${
          flat ? 'page-header--flat' : 'page-header--card'
        }`,
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="page-header-content w-full px-[var(--space-md)]">
        <div className="flex flex-col gap-xs w-full">
          <div className="flex flex-row justify-between items-center gap-md w-full">
            <div className="flex-1 min-w-0">
              {children}
              <Heading
                level={1}
                {...titleProps}
                className={cn(
                  "page-header-title m-0 text-wrap break-words sm:text-balance text-2xl sm:text-3xl font-extrabold",
                  titleProps?.className
                )}
              >
                {headerLabel}
              </Heading>
            </div>
            {actions && (
              <div
                className={cn(
                  'page-header-actions flex flex-wrap gap-sm justify-end shrink-0',
                  {
                    'items-start md:items-start': actionsAlign === 'start',
                    'items-center md:items-center': actionsAlign === 'center',
                    'items-end md:items-end': actionsAlign === 'end',
                    'items-stretch md:items-stretch': actionsAlign === 'stretch',
                    'items-baseline md:items-baseline': actionsAlign === 'baseline',
                  }
                )}
              >
                {actions}
              </div>
            )}
          </div>
          {subtitle && (
            <Text size="base" muted className="page-header-subtitle m-0 w-full text-balance">
              {subtitle}
            </Text>
          )}
        </div>
      </div>
    </header>
  );
}

// 10. Page Layout (formerly PageLayout.tsx)
export interface PageLayoutProps extends Omit<StackProps, 'children'> {
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  pageKey?: string;
  actions?: ReactNode;
  headerChildren?: ReactNode;
  children?: ReactNode;
  flat?: boolean;
  headerClassName?: string;
  titleProps?: PageHeaderProps['titleProps'];
  actionsAlign?: PageHeaderProps['actionsAlign'];
}

export function PageLayout({
  title,
  subtitle,
  breadcrumbs,
  pageKey,
  actions,
  headerChildren,
  children,
  flat,
  headerClassName,
  titleProps,
  actionsAlign,
  ...stackProps
}: PageLayoutProps) {
  return (
    <Stack {...stackProps}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        pageKey={pageKey}
        actions={actions}
        flat={flat}
        className={headerClassName}
        titleProps={titleProps}
        actionsAlign={actionsAlign}
      >
        {headerChildren}
      </PageHeader>
      {children}
    </Stack>
  );
}

// 11. Split Layout (formerly SplitLayout.tsx)
interface SplitLayoutProps {
  main: ReactNode;
  sidebar: ReactNode;
  className?: string;
  mainSpan?: number;
  sidebarSpan?: number;
  listHeader?: ReactNode;
  detailHeader?: ReactNode;
  sidebarPosition?: 'left' | 'right';
  showDetailOnMobile?: boolean;
  fullHeight?: boolean;
}

export function SplitLayout({
  main,
  sidebar,
  className = '',
  mainSpan = 8,
  sidebarSpan = 4,
  listHeader,
  detailHeader,
  sidebarPosition = 'right',
  showDetailOnMobile,
  fullHeight = true,
}: SplitLayoutProps) {
  const isDetailVisible = showDetailOnMobile ?? (sidebarPosition === 'right');

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mql.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const listPanel = (
    <div className={cn("flex flex-col min-h-0", fullHeight ? "h-full overflow-hidden" : "h-auto overflow-visible")}>
      {listHeader && (
        <div className="sticky top-0 z-10 shrink-0 bg-bg-card border-b border-border">
          {listHeader}
        </div>
      )}
      <div className={cn("min-h-0", fullHeight ? "flex-1 overflow-y-auto custom-scrollbar" : "h-auto overflow-visible")}>
        {sidebar}
      </div>
    </div>
  );

  const detailPanel = (
    <div className={cn("flex flex-col min-h-0", fullHeight ? "h-full overflow-hidden" : "h-auto overflow-visible")}>
      {detailHeader && (
        <div className="sticky top-0 z-10 shrink-0 bg-bg-card border-b border-border">
          {detailHeader}
        </div>
      )}
      <div className={cn("min-h-0", fullHeight ? "flex-1 overflow-y-auto custom-scrollbar" : "h-auto overflow-visible")}>
        {main}
      </div>
    </div>
  );

  const containerClasses = cn(
    'animate-fade-in',
    fullHeight ? 'h-[calc(100vh-var(--topbar-height)-var(--space-2xl))] min-h-0 overflow-hidden' : 'h-auto overflow-visible',
    className
  );

  return (
    <div className={containerClasses}>
      {!isMobile && (
        <div className={cn("hidden md:block", fullHeight ? "h-full" : "h-auto")}>
          <Grid columns={12} gap="lg" className={fullHeight ? "h-full" : "h-auto"}>
            {sidebarPosition === 'left' ? (
              <>
                <Grid.Item span={sidebarSpan} className={cn("min-w-0", fullHeight ? "h-full" : "h-auto")}>{listPanel}</Grid.Item>
                <Grid.Item span={mainSpan} className={cn("min-w-0", fullHeight ? "h-full" : "h-auto")}>{detailPanel}</Grid.Item>
              </>
            ) : (
              <>
                <Grid.Item span={mainSpan} className={cn("min-w-0", fullHeight ? "h-full" : "h-auto")}>{detailPanel}</Grid.Item>
                <Grid.Item span={sidebarSpan} className={cn("min-w-0", fullHeight ? "h-full" : "h-auto")}>{listPanel}</Grid.Item>
              </>
            )}
          </Grid>
        </div>
      )}

      {isMobile && (
        <div className={cn("md:hidden relative", fullHeight ? "h-full overflow-hidden" : "h-auto overflow-visible")}>
          {!isDetailVisible ? (
            <div
              key="sidebar-panel"
              className={cn("w-full transition-all duration-150", fullHeight ? "absolute inset-0 h-full" : "relative h-auto")}
            >
              {listPanel}
            </div>
          ) : (
            <div
              key="main-panel"
              className={cn("w-full transition-all duration-150", fullHeight ? "absolute inset-0 h-full" : "relative h-auto")}
            >
              {detailPanel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 12. Main Layout Component (formerly Layout.tsx)
export default function Layout() {
  const t = useStore((state) => state.t);
  const isCollapsed = useStore((state) => state.isCollapsed);
  const location = useLocation();
  const isMessages = location.pathname.startsWith('/messages');

  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1280 : true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const marginLeft = isDesktop ? (isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)') : '0px';

  return (
    <div className="flex min-h-screen w-full relative">
      <a href="#main-content" className="skip-link">
        {t('skip_to_content')}
      </a>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 relative">
        <Topbar />
        <main
          id="main-content"
          className="layout-main transition-all duration-300 ease-in-out flex-1 min-w-0"
          style={{ marginLeft }}
        >
          <div data-testid="page-content" className="page-content relative z-10 w-full max-w-full min-w-0 flex-1">
            <React.Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </React.Suspense>
          </div>
        </main>
        {!isMessages && (
          <div className="transition-all duration-300 ease-in-out" style={{ marginLeft }}>
            <Footer />
          </div>
        )}
      </div>
    </div>
  );
}
