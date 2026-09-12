import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SettingsData, SubmissionData } from '@/lib/types';
import { ApiClient, api, saveSettings, submitAssignment, submitSupportTicket } from '@/lib/api';

describe('ApiClient', () => {
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient()
  })

  describe('get', () => {
    it('returns mock data when useMocks is true and mockFallback is provided', async () => {
      const data = await client.get('/courses', () => [{ id: 1 }])
      expect(data).toEqual([{ id: 1 }])
    })

    it('throws when useMocks is false and fetch fails with a client error', async () => {
      client.setUseMocks(false)
      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockResolvedValue(new Response('Not Found', { status: 404, statusText: 'Not Found' }))
      await expect(client.get('/test')).rejects.toThrow('API Error: 404')
      globalThis.fetch = originalFetch
    })

    it('returns parsed JSON when fetch succeeds with JSON content-type', async () => {
      client.setUseMocks(false)
      const originalFetch = globalThis.fetch
      const data = { id: 1, name: 'Test' }
      const mockResponse = new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse)
      await expect(client.get('/test')).resolves.toEqual(data)
      globalThis.fetch = originalFetch
    })
  })

  describe('post', () => {
    it('returns mock data when useMocks is true', async () => {
      const data = await client.post('/courses', { title: 'New' }, () => ({ id: 2 }))
      expect(data).toEqual({ id: 2 })
    })

    it('performs fetch when useMocks is false', async () => {
      client.setUseMocks(false)
      const originalFetch = globalThis.fetch
      const mockResponse = new Response(JSON.stringify({ success: true }), { status: 200 })
      const fetchMock = vi.fn().mockResolvedValue(mockResponse)
      globalThis.fetch = fetchMock
      const res = await client.post('/test', { data: 1 })
      expect(res).toEqual({ success: true })
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'POST' })
      )
      globalThis.fetch = originalFetch
    })
  })

  describe('put', () => {
    it('returns mock data when useMocks is true', async () => {
      const data = await client.put('/courses/1', { title: 'Updated' }, () => ({ id: 1 }))
      expect(data).toEqual({ id: 1 })
    })

    it('performs fetch when useMocks is false', async () => {
      client.setUseMocks(false)
      const originalFetch = globalThis.fetch
      const mockResponse = new Response(JSON.stringify({ success: true }), { status: 200 })
      const fetchMock = vi.fn().mockResolvedValue(mockResponse)
      globalThis.fetch = fetchMock
      const res = await client.put('/test', { data: 1 })
      expect(res).toEqual({ success: true })
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'PUT' })
      )
      globalThis.fetch = originalFetch
    })
  })

  describe('delete', () => {
    it('returns mock data when useMocks is true', async () => {
      const data = await client.delete('/courses/1', () => ({ success: true }))
      expect(data).toEqual({ success: true })
    })

    it('performs fetch when useMocks is false', async () => {
      client.setUseMocks(false)
      const originalFetch = globalThis.fetch
      const mockResponse = new Response(JSON.stringify({ success: true }), { status: 200 })
      const fetchMock = vi.fn().mockResolvedValue(mockResponse)
      globalThis.fetch = fetchMock
      const res = await client.delete('/test')
      expect(res).toEqual({ success: true })
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'DELETE' })
      )
      globalThis.fetch = originalFetch
    })
  })

  describe('api singleton', () => {
    it('exists and is an ApiClient instance', () => {
      expect(api).toBeInstanceOf(ApiClient)
    })
  })

  describe('saveSettings', () => {
    it('calls api.put with settings data', async () => {
      const spy = vi.spyOn(ApiClient.prototype, 'put').mockResolvedValue({ success: true })
      const settings: SettingsData = { theme: 'dark', language: 'da' }
      const result = await saveSettings(settings)
      expect(spy).toHaveBeenCalledWith('/settings', settings, expect.any(Function))
      expect(result).toEqual({ success: true })
      spy.mockRestore()
    })
  })

  describe('submitAssignment', () => {
    it('calls api.post with submission data', async () => {
      const spy = vi.spyOn(ApiClient.prototype, 'post').mockResolvedValue({ success: true, submissionId: 'MOCK-001' })
      const data: SubmissionData = { courseId: '101', comment: 'My work' }
      const result = await submitAssignment(data)
      expect(spy).toHaveBeenCalledWith('/submissions', data, expect.any(Function))
      expect(result).toEqual({ success: true, submissionId: 'MOCK-001' })
      spy.mockRestore()
    })
  })

  describe('submitSupportTicket', () => {
    it('calls api.post with ticket data', async () => {
      const spy = vi.spyOn(ApiClient.prototype, 'post').mockResolvedValue({ success: true, ticketId: 'MOCK-001' })
      const data = { subject: 'Bug', description: 'Something broke' }
      const result = await submitSupportTicket(data)
      expect(spy).toHaveBeenCalledWith('/support/tickets', data, expect.any(Function))
      expect(result).toEqual({ success: true, ticketId: 'MOCK-001' })
      spy.mockRestore()
    })
  })

  describe('timeout', () => {
    it('uses configurable timeout', () => {
      const custom = new ApiClient('/api', false, 5000)
      expect((custom as any).timeoutMs).toBe(5000)
      custom.setTimeout(3000)
      expect((custom as any).timeoutMs).toBe(3000)
    })
  })
})
