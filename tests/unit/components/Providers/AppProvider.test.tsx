import useStore from '@/store'
import { env } from '@/lib/utils'
import { AppProvider } from '@/components/Providers/AppProvider'

describe('AppProvider', () => {
  beforeEach(() => {
    useStore.setState({
      theme: 'system',
      isDarkMode: false,
      isCollapsed: false,
    });
    if (typeof document !== 'undefined') {
      document.documentElement.className = '';
    }
  });

  it('renders children and provides ToastProvider context', () => {
    render(
      <AppProvider>
        <div data-testid="child">Child Content</div>
      </AppProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('syncs dark mode class when theme changes', () => {
    const { setTheme } = useStore.getState()
    render(
      <AppProvider>
        <div>Content</div>
      </AppProvider>
    );

    act(() => {
      setTheme('dark')
    });
    expect(useStore.getState().isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      setTheme('light')
    });
    expect(useStore.getState().isDarkMode).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('handles prefers-color-scheme change', () => {
    let changeCallback: any;
    const mediaQueryMock = {
      matches: true,
      addEventListener: vi.fn((event, cb) => {
        if (event === 'change') changeCallback = cb;
      }),
      removeEventListener: vi.fn(),
    } as any;
    const matchMediaSpy = vi.spyOn(env, 'matchMedia').mockReturnValue(mediaQueryMock);

    render(
      <AppProvider>
        <div>Content</div>
      </AppProvider>
    );

    act(() => {
      useStore.setState({ theme: 'system' });
    });

    act(() => {
      changeCallback();
    });

    expect(useStore.getState().theme).toBe('system');

    act(() => {
      useStore.setState({ theme: 'dark' });
    });
    act(() => {
      changeCallback();
    });
    expect(useStore.getState().theme).toBe('dark');

    matchMediaSpy.mockRestore();
  });
})
