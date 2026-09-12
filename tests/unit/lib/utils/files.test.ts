import { describe, it, expect } from 'vitest';
import { processFileMetadata, getFileTypeConfig } from '@/lib/utils';

function createMockFile(name: string, size = 1024): File {
  return { name, size, type: '', lastModified: Date.now(), slice: () => new Blob() } as File
}

describe('processFileMetadata', () => {
  it('transforms a FileList into StagedFile array', () => {
    const file = createMockFile('document.pdf', 5 * 1024 * 1024)
    const fileList = { 0: file, length: 1 } as unknown as FileList
    const result = processFileMetadata(fileList)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('document.pdf')
    expect(result[0].size).toBe((5).toFixed(2) + ' MB')
    expect(result[0].id).toBeDefined()
  })

  it('handles filenames without extension', () => {
    const file = createMockFile('README')
    const fileList = { 0: file, length: 1 } as unknown as FileList
    const result = processFileMetadata(fileList)
    expect(result[0].name).toBe('README')
  })

  it('handles multiple files', () => {
    const f1 = createMockFile('a.txt')
    const f2 = createMockFile('b.txt')
    const fileList = { 0: f1, 1: f2, length: 2 } as unknown as FileList
    const result = processFileMetadata(fileList)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('a.txt')
    expect(result[1].name).toBe('b.txt')
  })
})

describe('getFileTypeConfig', () => {
  it('returns pdf config', () => {
    const config = getFileTypeConfig('document.pdf')
    expect(config.colorClass).toBe('text-danger bg-danger/10')
  })

  it('returns video config', () => {
    const config = getFileTypeConfig('movie.mp4')
    expect(config.colorClass).toBe('text-success bg-success/10')
  })

  it('returns link config', () => {
    const config = getFileTypeConfig('http://example.com')
    expect(config.colorClass).toBe('text-info bg-info/10')
  })

  it('returns assignment config', () => {
    const config = getFileTypeConfig('assignment')
    expect(config.colorClass).toBe('text-accent bg-accent/10')
  })

  it('returns default file config', () => {
    const config = getFileTypeConfig('unknown.xyz')
    expect(config.colorClass).toBe('text-muted bg-bg-highlight/50')
  })
})
