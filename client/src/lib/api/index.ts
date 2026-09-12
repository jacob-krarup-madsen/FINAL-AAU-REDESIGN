import type { SettingsData, SubmissionData, SupportFormData } from '@/lib/types'
import { API_RETRY_BACKOFF } from '../constants'

// ── API Utils ───────────────────────────────────────────────────────────────

let cachedCsrfToken: string | null | undefined = undefined

function resetCsrfCache(): void {
  cachedCsrfToken = undefined
}

function getCsrfToken(selector = 'meta[name="csrf-token"]'): string | null {
  if (cachedCsrfToken !== undefined) return cachedCsrfToken
  if (typeof document === 'undefined') return null
  const meta = document.querySelector<HTMLMetaElement>(selector)
  cachedCsrfToken = meta?.content || null
  return cachedCsrfToken
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof TypeError) return true
  if (error instanceof DOMException) return true
  if (error instanceof Error) {
    const msg = error.message
    if (msg.startsWith('API Error: 5')) return true
    if (msg === 'Request timeout') return true
  }
  return false
}

function buildHeaders(hasBody: boolean): HeadersInit {
  const headers: Record<string, string> = {}
  if (hasBody) headers['Content-Type'] = 'application/json'
  const token = getCsrfToken()
  if (token) headers['X-CSRF-Token'] = token
  return headers
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timeout')), ms)
    promise.then(
      (v) => { clearTimeout(timer); resolve(v) },
      (e) => { clearTimeout(timer); reject(e) },
    )
  })
}

function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  const backoff = (attempt: number) => API_RETRY_BACKOFF[attempt] || 5000

  const attempt = (n: number): Promise<T> =>
    fn().catch((error) => {
      if (n >= maxRetries || !isRetryableError(error)) throw error
      return new Promise<T>((r) => setTimeout(r, backoff(n)))
        .then(() => attempt(n + 1))
    })

  return attempt(0)
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch { /* ignore */ }
    throw new Error(`API Error: ${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ''}`)
  }
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return res.json()
  }
  const text = await res.text()
  if (!text) return undefined as T
  try { return JSON.parse(text) as T } catch {
    throw new Error(`Expected JSON but got: ${text.slice(0, 100)}`)
  }
}

// ── ApiClient ────────────────────────────────────────────────────────────────

class ApiClient {
  private baseUrl: string
  private useMocks: boolean
  private timeoutMs: number

  constructor(baseUrl = '/api', useMocks = true, timeoutMs = 10000) {
    this.baseUrl = baseUrl
    this.useMocks = useMocks
    this.timeoutMs = timeoutMs
  }

  setUseMocks(value: boolean) {
    this.useMocks = value
  }

  setTimeout(ms: number) {
    this.timeoutMs = ms
  }

  async get<T>(endpoint: string, mockFallback?: () => T): Promise<T> {
    if (this.useMocks && mockFallback) return mockFallback()
    return withRetry(() =>
      withTimeout(
        fetch(`${this.baseUrl}${endpoint}`, {
          credentials: 'same-origin',
          headers: buildHeaders(false),
        }).then(res => handleResponse<T>(res)),
        this.timeoutMs,
      ),
    )
  }

  async post<T>(endpoint: string, body: unknown, mockFallback?: () => T): Promise<T> {
    if (this.useMocks && mockFallback) return mockFallback()
    return withRetry(() =>
      withTimeout(
        fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: buildHeaders(true),
          body: JSON.stringify(body),
        }).then(res => handleResponse<T>(res)),
        this.timeoutMs,
      ),
    )
  }

  async put<T>(endpoint: string, body: unknown, mockFallback?: () => T): Promise<T> {
    if (this.useMocks && mockFallback) return mockFallback()
    return withRetry(() =>
      withTimeout(
        fetch(`${this.baseUrl}${endpoint}`, {
          method: 'PUT',
          credentials: 'same-origin',
          headers: buildHeaders(true),
          body: JSON.stringify(body),
        }).then(res => handleResponse<T>(res)),
        this.timeoutMs,
      ),
    )
  }

  async delete<T>(endpoint: string, mockFallback?: () => T): Promise<T> {
    if (this.useMocks && mockFallback) return mockFallback()
    return withRetry(() =>
      withTimeout(
        fetch(`${this.baseUrl}${endpoint}`, {
          method: 'DELETE',
          credentials: 'same-origin',
          headers: buildHeaders(false),
        }).then(res => handleResponse<T>(res)),
        this.timeoutMs,
      ),
    )
  }
}

export {
  ApiClient,
  resetCsrfCache,
  getCsrfToken,
  isRetryableError,
  buildHeaders,
  withTimeout,
  withRetry,
  handleResponse,
}

export const api = new ApiClient()

export const saveSettings = (data: SettingsData) =>
  api.put('/settings', data, () => ({ success: true }))

export const submitAssignment = (data: SubmissionData) =>
  api.post('/submissions', data, () => ({ success: true, submissionId: 'MOCK-001' }))

export const submitSupportTicket = (data: SupportFormData) =>
  api.post('/support/tickets', data, () => ({ success: true, ticketId: 'MOCK-001' }))
