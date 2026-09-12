import { describe, it, expect } from 'vitest';
import { allTools, allEssentials, allToolsList } from '@/lib/utils';

describe('tools', () => {
  it('allTools has at least one item', () => {
    expect(allTools.length).toBeGreaterThan(0)
  })
  it('allEssentials has at least one item', () => {
    expect(allEssentials.length).toBeGreaterThan(0)
  })
  it('allToolsList equals combined array', () => {
    expect(allToolsList).toEqual([...allTools, ...allEssentials])
  })
  it('every allTools item has category tools', () => {
    allTools.forEach(t => {
      expect((t as { category?: string }).category).toBe('tools')
    })
  })
  it('every allEssentials item has category essentials', () => {
    allEssentials.forEach(t => {
      expect((t as { category?: string }).category).toBe('essentials')
    })
  })
  it('every item has an icon component', () => {
    allToolsList.forEach(t => {
      expect(t.icon).toBeDefined()
      expect(t.icon.displayName).toBeDefined()
    })
  })
  it('contains Digital Eksamen tool by id 1', () => {
    expect(allToolsList.some(t => t.id === 1)).toBe(true)
  })
})
