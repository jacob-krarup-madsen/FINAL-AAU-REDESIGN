import { describe, it, expect, beforeEach } from 'vitest'
import useStore from '@/store'
import { computeIsDarkMode } from '@/lib/utils'

describe('Zustand store', () => {
  beforeEach(() => {
    // Reset state where possible, or just re-initialize if needed.
    // Zustand's persist middleware might persist values, but vitest resets the mock storage.
    useStore.setState({
      theme: 'system',
      lang: 'da',
      isCollapsed: true,
      notificationCount: 2,
      messageCount: 1,
      breadcrumbs: [],
    })
  })

  it('has default state', () => {
    const state = useStore.getState();
    expect(state.theme).toBe('system');
    expect(state.lang).toBe('da');
    expect(state.isCollapsed).toBe(true);
    expect(state.notificationCount).toBe(2);
    expect(state.messageCount).toBe(1);
    expect(state.breadcrumbs).toEqual([]);
  });

  it('setTheme updates theme and isDarkMode', () => {
    const state = useStore.getState();
    const isDark = computeIsDarkMode('light');
    state.setTheme('light');
    const updated = useStore.getState();
    expect(updated.theme).toBe('light');
    expect(updated.isDarkMode).toBe(isDark);
  });

  it('setLang updates lang', () => {
    const state = useStore.getState();
    state.setLang('en');
    const updated = useStore.getState();
    expect(updated.lang).toBe('en');
  });

  it('t returns translation for dot-notation key', () => {
    const state = useStore.getState();
    expect(state.t('common.close')).toBe('Luk');
  });

  it('t returns key when not found', () => {
    const state = useStore.getState();
    expect(state.t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('localize returns da/en value', () => {
    const state = useStore.getState();
    const obj = { title: { da: 'Dansk titel', en: 'English title' } };
    expect(state.localize(obj, 'title')).toBe('Dansk titel');
  });

  it('toggleSidebar toggles isCollapsed', () => {
    const state = useStore.getState();
    expect(state.isCollapsed).toBe(true);
    state.toggleSidebar();
    expect(useStore.getState().isCollapsed).toBe(false);
    useStore.getState().toggleSidebar();
    expect(useStore.getState().isCollapsed).toBe(true);
  });

  it('closeSidebar collapses sidebar', () => {
    const state = useStore.getState();
    useStore.setState({ isCollapsed: false });
    state.closeSidebar();
    expect(useStore.getState().isCollapsed).toBe(true);
  });

  it('decrementNotificationCount stops at 0', () => {
    const state = useStore.getState();
    expect(state.notificationCount).toBe(2);
    state.decrementNotificationCount();
    expect(useStore.getState().notificationCount).toBe(1);
    useStore.getState().decrementNotificationCount();
    expect(useStore.getState().notificationCount).toBe(0);
    useStore.getState().decrementNotificationCount();
    expect(useStore.getState().notificationCount).toBe(0);
  });

  it('decrementMessageCount stops at 0', () => {
    const state = useStore.getState();
    useStore.setState({ messageCount: 0 });
    state.decrementMessageCount();
    expect(useStore.getState().messageCount).toBe(0);
  });

  it('setBreadcrumbs handles undefined', () => {
    const state = useStore.getState();
    state.setBreadcrumbs(undefined);
    expect(useStore.getState().breadcrumbs).toEqual([]);
  });
})
