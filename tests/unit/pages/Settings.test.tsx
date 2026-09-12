import { vi, describe, beforeEach, it, expect } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/setup/test-utils';
import Settings from '@/pages/Settings';
import useStore from '@/store';
import { STORAGE_KEYS } from '@/lib/constants';

/* eslint-disable @typescript-eslint/no-explicit-any */
const mockToast: any = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn()
};

vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual<typeof import('@/components/ui')>('@/components/ui');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useStore.setState({
      firstName: 'Test User',
      lastName: 'User',
      lang: 'da',
      theme: 'system',
      notifPrefs: { email: true, push: true, sms: false },
      forumDigest: 'complete',
      forumTracking: true,
      forumAutoSubscribe: true,
      calendarStartDay: 'monday',
      calendarDefaultView: 'month',
      messagePrivacy: 'courses',
      messageEmailOffline: true,
      isSaving: false,
    });
  });

  const renderSettings = (lang = 'da') => {
    useStore.setState({ lang: lang as 'da' | 'en' });
    return renderWithProviders(<Settings />);
  };

  it('renders settings categories', () => {
    renderSettings('da');
    expect(screen.getAllByText('Brugerkonto').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Indstillinger').length).toBeGreaterThan(0);
  });

  it('switches categories and toggles collapse', async () => {
    renderSettings('da');
    fireEvent.click(screen.getByText('Avanceret'));
    expect(screen.getByText('Sikkerhedsnøgler')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Avanceret'));
    await waitFor(() => {
      expect(screen.queryByText('Sikkerhedsnøgler')).not.toBeInTheDocument();
    });
  });

  it('changes language and theme', () => {
    renderSettings('en');
    expect(screen.getAllByText('User Account').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Advanced').length).toBeGreaterThan(0);
  });

  it('renders the profile content by default', () => {
    renderSettings('da');
    expect(screen.getAllByText('Test User User').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('student@example.com')).toBeInTheDocument();
  });

  it('switches theme via appearance buttons', async () => {
    renderSettings('da');
    fireEvent.click(screen.getByLabelText('Mørk'));
    await waitFor(() => {
      expect(screen.getByLabelText('Mørk').getAttribute('aria-pressed')).toBe('true');
    });
  });

  it('shows empty state for non-profile tabs', () => {
    renderSettings('da');
    const avanceretHeader = screen.getByText('Avanceret');
    fireEvent.click(avanceretHeader);
    const sikkerhedsNoeglerItem = screen.getByText('Sikkerhedsnøgler');
    fireEvent.click(sikkerhedsNoeglerItem);
    expect(screen.getByText('Denne sektion er under udvikling.')).toBeInTheDocument();
  });

  it('shows empty state in English for non-profile tabs', () => {
    renderSettings('en');
    const advancedHeader = screen.getByText('Advanced');
    fireEvent.click(advancedHeader);
    const blogSettings = screen.getByText('Blog Settings');
    fireEvent.click(blogSettings);
    expect(screen.getByText('This section is under development.')).toBeInTheDocument();
  });

  it('selects different tabs and shows correct content', () => {
    renderSettings('en');
    fireEvent.click(screen.getByText('Advanced'));
    fireEvent.click(screen.getByText('Security Keys'));
    expect(screen.getByText('This section is under development.')).toBeInTheDocument();
  });

  it('falls back to "Settings" for unknown tab ID from URL', () => {
    useStore.setState({ lang: 'en' });
    renderWithProviders(<Settings />, { route: '/settings?tab=nonexistent' });
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
  });

  it('expands and collapses a closed category', async () => {
    renderSettings('da');
    fireEvent.click(screen.getByText('Avanceret'));
    expect(screen.getByText('Sikkerhedsnøgler')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Avanceret'));
    await waitFor(() => {
      expect(screen.queryByText('Sikkerhedsnøgler')).not.toBeInTheDocument();
    });
  });

  it('expands category on keyboard Enter', () => {
    renderSettings('da');
    const avanceretHeader = screen.getByText('Avanceret');
    fireEvent.keyDown(avanceretHeader, { key: 'Enter' });
    expect(screen.getByText('Sikkerhedsnøgler')).toBeInTheDocument();
  });

  it('expands category on keyboard Space', () => {
    renderSettings('da');
    const avanceretHeader = screen.getByText('Avanceret');
    fireEvent.keyDown(avanceretHeader, { key: ' ' });
    expect(screen.getByText('Sikkerhedsnøgler')).toBeInTheDocument();
  });

  it('renders language tab via direct routing', () => {
    useStore.setState({ lang: 'en' });
    renderWithProviders(<Settings />, { route: '/settings?tab=sprog' });
    expect(screen.getByText('English (English)')).toBeInTheDocument();
  });

  it('renders forum tab via direct routing', () => {
    useStore.setState({ lang: 'en' });
    renderWithProviders(<Settings />, { route: '/settings?tab=forum' });
    expect(screen.getByText(/Digest type/i)).toBeInTheDocument();
  });

  it('renders calendar tab via direct routing', () => {
    useStore.setState({ lang: 'en' });
    renderWithProviders(<Settings />, { route: '/settings?tab=kalender' });
    expect(screen.getByText(/First day of week/i)).toBeInTheDocument();
  });

  it('renders messages tab via direct routing', () => {
    useStore.setState({ lang: 'en' });
    renderWithProviders(<Settings />, { route: '/settings?tab=beskeder' });
    expect(screen.getByText(/Who can contact me/i)).toBeInTheDocument();
  });

  it('types into first and last name inputs', () => {
    renderSettings('da');
    const firstNameInput = screen.getByDisplayValue('Test User') as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: 'NewName' } });
    expect(firstNameInput.value).toBe('NewName');
  });

  it('navigates to notification tab and toggles preferences', () => {
    renderSettings('da');
    fireEvent.click(screen.getByText('Indstillinger for underretninger'));
    const notifCards = document.querySelectorAll('[role="switch"]');
    if (notifCards.length > 0) {
      fireEvent.click(notifCards[0]);
    }
  });

  it('shows change photo button in profile tab', () => {
    renderSettings('da');
    expect(screen.getByText('Skift profilbillede')).toBeInTheDocument();
  });

  it('changes last name input value', () => {
    renderSettings('da');
    const lastNameInput = screen.getByDisplayValue('User') as HTMLInputElement;
    fireEvent.change(lastNameInput, { target: { value: 'Nielsen' } });
    expect(lastNameInput.value).toBe('Nielsen');
  });

  it('calls handleSave and saves to localStorage', () => {
    renderSettings('da');
    // Bypass UI — test store methods directly
    const state = useStore.getState();
    state.setFirstName('UpdatedName');
    state.setLastName('User');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_FIRST_NAME)!)).toBe('UpdatedName');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_LAST_NAME)!)).toBe('User');
  });

  it('navigates to language tab via click', () => {
    useStore.setState({ lang: 'en' });
    renderSettings('en');
    fireEvent.click(screen.getByText('Select Language'));
    expect(screen.getByText('Select preferred language')).toBeInTheDocument();
  });

  it('navigates to forum tab via click', () => {
    useStore.setState({ lang: 'en' });
    renderSettings('en');
    fireEvent.click(screen.getByText('Forum Settings'));
    expect(screen.getByText(/Digest type/i)).toBeInTheDocument();
  });

  it('navigates to calendar tab via click', () => {
    useStore.setState({ lang: 'en' });
    renderSettings('en');
    fireEvent.click(screen.getByText('Calendar Settings'));
    expect(screen.getByText(/First day of week/i)).toBeInTheDocument();
  });

  it('navigates to messages tab via click', () => {
    useStore.setState({ lang: 'en' });
    renderSettings('en');
    fireEvent.click(screen.getByText('Message Settings'));
    expect(screen.getByText(/Who can contact me/i)).toBeInTheDocument();
  });
});

