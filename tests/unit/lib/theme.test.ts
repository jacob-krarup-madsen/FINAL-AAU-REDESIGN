import { describe, it, expect, vi } from 'vitest';
import { computeIsDarkMode, ITEM_TYPE_MAP, UI_PALETTE, env } from '@/lib/utils';

describe('theme utilities', () => {
  it('computes is dark mode correctly', () => {
    expect(computeIsDarkMode('dark')).toBe(true);
    expect(computeIsDarkMode('light')).toBe(false);
  });

  it('has ITEM_TYPE_MAP and UI_PALETTE configs', () => {
    expect(ITEM_TYPE_MAP.pdf.color).toBe('danger');
    expect(UI_PALETTE['var(--color-primary)'].bg).toBe('var(--color-event-primary-bg)');
  });

  it('computeIsDarkMode system delegates to matchMedia', () => {
    const spy = vi.spyOn(env, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList)
    expect(computeIsDarkMode('system')).toBe(true)
    expect(spy).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    spy.mockRestore()
  })

  it('has ITEM_TYPE_MAP entry for video with correct structure', () => {
    expect(ITEM_TYPE_MAP.video).toBeDefined()
    expect(ITEM_TYPE_MAP.video.icon).toBeDefined()
    expect(ITEM_TYPE_MAP.video.color).toBe('success')
    expect(ITEM_TYPE_MAP.video.bg).toBe('bg-success/10')
  })

  it('has UI_PALETTE entry for danger with bg and text strings', () => {
    expect(UI_PALETTE.danger).toBeDefined()
    expect(typeof UI_PALETTE.danger.bg).toBe('string')
    expect(typeof UI_PALETTE.danger.text).toBe('string')
  })
});
