import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isRetryableError, getCsrfToken, buildHeaders, withTimeout, withRetry, handleResponse, resetCsrfCache } from '@/lib/api';

describe('isRetryableError', () => {
  it('returns true for TypeError (network errors)', () => {
    expect(isRetryableError(new TypeError('Failed to fetch'))).toBe(true)
  })

  it('returns true for DOMException', () => {
    expect(isRetryableError(new DOMException('Abort'))).toBe(true)
  })

  it('returns true for 5xx API errors', () => {
    expect(isRetryableError(new Error('API Error: 502 Bad Gateway'))).toBe(true)
  })

  it('returns false for 4xx API errors', () => {
    expect(isRetryableError(new Error('API Error: 404 Not Found'))).toBe(false)
    expect(isRetryableError(new Error('API Error: 401 Unauthorized'))).toBe(false)
  })

  it('returns true for timeout error', () => {
    expect(isRetryableError(new Error('Request timeout'))).toBe(true)
  })

  it('returns false for generic errors', () => {
    expect(isRetryableError(new Error('Something else'))).toBe(false)
  })
})

describe('getCsrfToken', () => {
  beforeEach(() => {
    resetCsrfCache()
    document.querySelector('meta[name="csrf-token"]')?.remove()
  })

  it('returns the csrf token value from meta tag', () => {
    const meta = document.createElement('meta')
    meta.name = 'csrf-token'
    meta.content = 'test-csrf-token-123'
    document.head.appendChild(meta)
    expect(getCsrfToken()).toBe('test-csrf-token-123')
    meta.remove()
  })

  it('returns null when no csrf meta tag exists', () => {
    expect(getCsrfToken()).toBeNull()
  })
})

describe('buildHeaders', () => {
  beforeEach(() => {
    resetCsrfCache()
    document.querySelector('meta[name="csrf-token"]')?.remove()
  })

  it('includes Content-Type when hasBody is true', () => {
    const headers = buildHeaders(true) as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('omits Content-Type when hasBody is false', () => {
    const headers = buildHeaders(false) as Record<string, string>
    expect(headers['Content-Type']).toBeUndefined()
  })

  it('includes X-CSRF-Token when csrf meta tag exists', () => {
    const meta = document.createElement('meta')
    meta.name = 'csrf-token'
    meta.content = 'my-token'
    document.head.appendChild(meta)
    const headers = buildHeaders(true) as Record<string, string>
    expect(headers['X-CSRF-Token']).toBe('my-token')
    meta.remove()
  })

  it('omits X-CSRF-Token when no csrf meta tag', () => {
    const headers = buildHeaders(true) as Record<string, string>
    expect(headers['X-CSRF-Token']).toBeUndefined()
  })
})

describe('withTimeout', () => {
  it('resolves with the promise value when it completes in time', async () => {
    const result = await withTimeout(Promise.resolve('ok'), 1000)
    expect(result).toBe('ok')
  })

  it('rejects with timeout error when promise takes too long', async () => {
    const slow = new Promise((r) => setTimeout(r, 500))
    await expect(withTimeout(slow, 50)).rejects.toThrow('Request timeout')
  })
})

describe('handleResponse', () => {
  it('parses JSON response when content-type is application/json', async () => {
    const res = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await handleResponse<{ data: string }>(res)
    expect(result).toEqual({ data: 'test' })
  })

  it('returns undefined for empty non-JSON responses', async () => {
    const res = new Response('', { status: 200 })
    const result = await handleResponse(res)
    expect(result).toBeUndefined()
  })

  it('throws on non-ok responses with status code', async () => {
    const res = new Response('Not Found', { status: 404, statusText: 'Not Found' })
    await expect(handleResponse(res)).rejects.toThrow('API Error: 404')
  })

  it('throws on non-ok response with body in error message', async () => {
    const res = new Response('Validation failed', { status: 422, statusText: 'Unprocessable' })
    await expect(handleResponse(res)).rejects.toThrow('API Error: 422 Unprocessable — Validation failed')
  })

  it('throws when non-JSON response cannot be parsed as JSON', async () => {
    const res = new Response('plain text', { status: 200 })
    await expect(handleResponse(res)).rejects.toThrow('Expected JSON but got: plain text')
  })
})

describe('withRetry', () => {
  it('resolves on first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    await expect(withRetry(fn)).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on retryable errors', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new TypeError('Network error'))
      .mockResolvedValueOnce('ok')
    await expect(withRetry(fn)).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('does not retry on non-retryable errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('API Error: 404 Not Found'))
    await expect(withRetry(fn)).rejects.toThrow('API Error: 404 Not Found')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throws when all retries are exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new TypeError('Network error'))
    await expect(withRetry(fn, 1)).rejects.toThrow('Network error')
    expect(fn).toHaveBeenCalledTimes(2)
  }, 10000)
})
