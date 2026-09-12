import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export const PATHS = {
  DASHBOARD: '/',
  COURSES: '/courses',
  CALENDAR: '/calendar',
  SUPPORT: '/support',
  SETTINGS: '/settings',
  MESSAGES: '/messages',
  RESOURCES: '/resources',
  NOTIFICATIONS: '/notifications',
  FAVORITES: '/favorites',
  SEARCH: '/search',
  FORUM_NEW: '/forum/new',
  FORUM_LIST: '/forum',
  COURSE: (id: string | number) => `/course/${id}`,
  SUBMISSION: (courseId: string | number, id: string | number) => `/submission/${courseId}/${id}`,
  FORUM: (id: string | number) => `/forum/${id}`,
} as const;


const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Calendar = lazy(() => import('@/pages/Calendar'));
const Courses = lazy(() => import('@/pages/Courses'));
const Course = lazy(() => import('@/pages/Course'));
const Support = lazy(() => import('@/pages/Support'));
const Settings = lazy(() => import('@/pages/Settings'));
const Messages = lazy(() => import('@/pages/Messages'));
const Resources = lazy(() => import('@/pages/Resources'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const Submission = lazy(() => import('@/pages/Submission'));
const SearchResults = lazy(() => import('@/pages/SearchResults'));
const ForumPost = lazy(() => import('@/pages/ForumPost'));
const Favorites = lazy(() => import('@/pages/Favorites'));

interface RouteConfig {
  path: string;
  component: LazyExoticComponent<ComponentType<unknown>>;
  label: string;
  breadcrumbKey?: string;
}

const routes: RouteConfig[] = [
  { path: '/', component: Dashboard, label: 'dashboard' },
  { path: '/calendar', component: Calendar, label: 'calendar' },
  { path: '/courses', component: Courses, label: 'courses' },
  { path: '/course/:id', component: Course, label: 'course' },
  { path: '/support', component: Support, label: 'support' },
  { path: '/settings', component: Settings, label: 'settings' },
  { path: '/messages', component: Messages, label: 'messages' },
  { path: '/resources', component: Resources, label: 'resources' },
  { path: '/notifications', component: Notifications, label: 'notifications' },
  { path: '/submission/:courseId/:assignmentId', component: Submission, label: 'submission' },
  { path: '/search', component: SearchResults, label: 'search', breadcrumbKey: 'search_results' },
  { path: '/favorites', component: Favorites, label: 'favorites' },
  { path: '/forum/:id', component: ForumPost, label: 'forum' },
];

export default routes;
