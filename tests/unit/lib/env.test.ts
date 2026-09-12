import { describe, it, expect, vi } from 'vitest';
import { env } from '@/lib/utils';

describe('env', () => {
  it('open returns null when window.open is undefined', () => {
    const originalOpen = window.open
    delete (window as any).open
    expect(env.open('http://example.com')).toBeNull()
    window.open = originalOpen
  })

  it('getInnerWidth returns 0 on error', () => {
    const originalInnerWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      get: () => { throw new Error('err') }
    })
    expect(env.getInnerWidth()).toBe(0)
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true, writable: true })
  })

  it('matchMedia returns fallback on error', () => {
    const originalMatchMedia = window.matchMedia
    delete (window as any).matchMedia
    const mm = env.matchMedia('(max-width: 600px)')
    expect(mm.matches).toBe(false)
    ;(mm as any).addListener()
    ;(mm as any).removeListener()
    ;(mm as any).addEventListener()
    ;(mm as any).removeEventListener()
    expect((mm as any).dispatchEvent()).toBe(false)
    window.matchMedia = originalMatchMedia
  })

  it('isIframe returns true when window.self throws', () => {
    const originalSelf = window.self
    Object.defineProperty(window, 'self', {
      get: () => { throw new Error('err') }
    })
    expect(env.isIframe()).toBe(true)
    Object.defineProperty(window, 'self', { value: originalSelf, configurable: true, writable: true })
  })

  it('handles when window is undefined', () => {
    vi.stubGlobal('window', undefined)
    expect(env.getInnerWidth()).toBe(0)
    expect(env.isIframe()).toBe(false)
    expect(env.open('http://example.com')).toBeNull()
    expect(env.matchMedia('(max-width: 600px)').matches).toBe(false)
    vi.unstubAllGlobals()
  })

  it('open warns when window.open undefined', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const originalOpen = window.open
    delete (window as any).open
    const result = env.open('http://example.com')
    expect(result).toBeNull()
    expect(warnSpy).toHaveBeenCalled()
    window.open = originalOpen
    warnSpy.mockRestore()
  })

  it('open catches when window.open throws', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const originalOpen = window.open
    window.open = () => { throw new Error('blocked') }
    const result = env.open('http://example.com')
    expect(result).toBeNull()
    expect(errorSpy).toHaveBeenCalled()
    window.open = originalOpen
    errorSpy.mockRestore()
  })

  it('matchMedia catches when matchMedia unavailable', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const originalMatchMedia = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      get: () => { throw new Error('unavailable') },
      configurable: true,
    })
    const result = env.matchMedia('(max-width: 600px)')
    expect(result.matches).toBe(false)
    Object.defineProperty(window, 'matchMedia', { value: originalMatchMedia, configurable: true, writable: true })
    errorSpy.mockRestore()
  })

  it('open calls window.open and returns the result', () => {
    const mockReturn = { closed: false }
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(mockReturn as any)
    const result = env.open('https://example.com')
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer')
    expect(result).toBe(mockReturn)
    openSpy.mockRestore()
  })

  it('getInnerWidth returns window.innerWidth', () => {
    const original = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true, writable: true })
    expect(env.getInnerWidth()).toBe(1024)
    Object.defineProperty(window, 'innerWidth', { value: original, configurable: true, writable: true })
  })

  it('isIframe returns false when not in iframe', () => {
    expect(env.isIframe()).toBe(false)
  })
})
