import { describe, it, expect } from 'vitest';
import { getAutomaticBreadcrumbs } from '@/lib/utils';

const mockT = (key: string) => key;

describe('getAutomaticBreadcrumbs', () => {
  it('returns dashboard for root', () => {
    const result = getAutomaticBreadcrumbs('/', 'da', mockT);
    expect(result).toEqual([{ label: 'dashboard' }]);
  });

  it('returns course details crumbs', () => {
    const result = getAutomaticBreadcrumbs('/course/1', 'da', mockT);
    expect(result).toEqual([
      { label: 'dashboard', href: '/' },
      { label: 'courses', href: '/courses' },
      { label: 'Digital Design og Kommunikation' }
    ]);
  });

  it('returns course details crumbs in English', () => {
    const result = getAutomaticBreadcrumbs('/course/1', 'en', mockT);
    expect(result).toEqual([
      { label: 'dashboard', href: '/' },
      { label: 'courses', href: '/courses' },
      { label: 'Digital Design and Communication' }
    ]);
  });

  it('returns submission crumbs', () => {
    const result = getAutomaticBreadcrumbs('/submission/1/2', 'da', mockT);
    expect(result).toEqual([
      { label: 'dashboard', href: '/' },
      { label: 'courses', href: '/courses' },
      { label: 'Digital Design og Kommunikation', href: '/course/1' },
      { label: 'submission' }
    ]);
  });

  it('returns forum crumbs', () => {
    const result = getAutomaticBreadcrumbs('/forum/1', 'da', mockT);
    expect(result).toEqual([
      { label: 'dashboard', href: '/' },
      { label: 'courses', href: '/courses' },
      { label: 'forum_thread' }
    ]);
  });

  it('returns exact match for settings', () => {
    const result = getAutomaticBreadcrumbs('/settings', 'da', mockT);
    expect(result).toEqual([
      { label: 'dashboard', href: '/' },
      { label: 'settings' }
    ]);
  });

  it('handles general segments fallback', () => {
    const result = getAutomaticBreadcrumbs('/some/other/path', 'da', mockT);
    expect(result).toEqual([
      { label: 'dashboard', href: '/' },
      { label: 'some', href: '/some' },
      { label: 'other', href: '/some/other' },
      { label: 'path' }
    ]);
  });

  it('generates breadcrumbs for /calendar', () => {
    const result = getAutomaticBreadcrumbs('/calendar', 'da', mockT);
    expect(result).toHaveLength(2);
    expect(result[1].label).toBe('calendar');
  });

  it('generates breadcrumbs for /courses', () => {
    const result = getAutomaticBreadcrumbs('/courses', 'da', mockT);
    expect(result).toHaveLength(2);
    expect(result[1].label).toBe('courses');
  });

  it('generates breadcrumbs for /messages', () => {
    const result = getAutomaticBreadcrumbs('/messages', 'da', mockT);
    expect(result).toHaveLength(2);
    expect(result[1].label).toBe('messages');
  });

  it('generates breadcrumbs for /support', () => {
    const result = getAutomaticBreadcrumbs('/support', 'da', mockT);
    expect(result).toHaveLength(2);
    expect(result[1].label).toBe('support');
  });

  it('generates breadcrumbs for /notifications', () => {
    const result = getAutomaticBreadcrumbs('/notifications', 'da', mockT);
    expect(result).toHaveLength(2);
    expect(result[1].label).toBe('notifications');
  });

  it('generates breadcrumbs for /resources', () => {
    const result = getAutomaticBreadcrumbs('/resources', 'da', mockT);
    expect(result).toHaveLength(2);
    expect(result[1].label).toBe('resources');
  });

  it('generates breadcrumbs for /search', () => {
    const result = getAutomaticBreadcrumbs('/search', 'da', mockT);
    expect(result).toHaveLength(2);
    expect(result[1].label).toBe('search_results');
  });
});
