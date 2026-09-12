import { describe, it, expect, vi } from 'vitest';
import { storage } from '@/lib/utils';

describe('storage', () => {
  it('handles all resilience scenarios', () => {
    localStorage.setItem('test_json_err', 'invalid-json')
    expect(storage.get('test_json_err', { a: 1 })).toEqual({ a: 1 })
    expect(storage.get('test_json_err', 'fallback-string')).toBe('invalid-json')

    const originalGetItem = localStorage.getItem
    localStorage.getItem = () => { throw new Error('getItem error') }
    expect(storage.get('test_key', 'fallback')).toBe('fallback')
    localStorage.getItem = originalGetItem

    const originalSetItem = localStorage.setItem
    localStorage.setItem = () => { throw new Error('setItem error') }
    storage.set('test_key', 'val')
    localStorage.setItem = originalSetItem

    const originalRemoveItem = localStorage.removeItem
    localStorage.removeItem = () => { throw new Error('removeItem error') }
    storage.remove('test_key')
    localStorage.removeItem = originalRemoveItem

    const originalWindow = globalThis.window
    delete (globalThis as any).window
    try {
      expect(storage.get('test_key', 'fallback')).toBe('fallback')
      storage.set('test_key', 'val')
      storage.remove('test_key')
    } finally {
      (globalThis as any).window = originalWindow
    }
  })

  it('get returns parsed JSON when key exists', () => {
    localStorage.setItem('happyKey', JSON.stringify({ foo: 'bar' }))
    expect(storage.get('happyKey', {})).toEqual({ foo: 'bar' })
  })

  it('set stores JSON string via localStorage.setItem', () => {
    const setSpy = vi.spyOn(window.localStorage, 'setItem')
    storage.set('happyKey', { foo: 'bar' })
    expect(setSpy).toHaveBeenCalledWith('happyKey', JSON.stringify({ foo: 'bar' }))
    setSpy.mockRestore()
  })

  it('remove calls localStorage.removeItem', () => {
    const removeSpy = vi.spyOn(window.localStorage, 'removeItem')
    storage.remove('removeKey')
    expect(removeSpy).toHaveBeenCalledWith('removeKey')
    removeSpy.mockRestore()
  })

  it('get returns plain string when value is not valid JSON', () => {
    localStorage.setItem('plainKey', 'plain-string')
    expect(storage.get('plainKey', 'default')).toBe('plain-string')
  })

  it('get returns default when key does not exist', () => {
    expect(storage.get('noSuchKey', null)).toBeNull()
  })
})
