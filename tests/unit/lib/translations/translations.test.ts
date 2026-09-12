import { describe, it, expect } from 'vitest';
import { translations } from '@/translations';

const t = translations as any

describe('translations', () => {
  it('has danish common.close equal Luk', () => {
    expect(t.da.common.close).toBe('Luk')
  })

  it('has english common.close equal Close', () => {
    expect(t.en.common.close).toBe('Close')
  })

  it('creates flat alias da.close after side-effect', () => {
    expect(t.da.close).toBe('Luk')
  })

  it('creates underscore alias da.common_close', () => {
    expect(t.da.common_close).toBe('Luk')
  })

  it('creates category alias da.cat_user_account', () => {
    expect(t.da.cat_user_account).toBe('Brugerkonto')
  })

  it('creates da.no_search_results from deeper key', () => {
    expect(t.da.no_search_results).toBe('Ingen resultater')
  })

  it('creates english flat alias en.close', () => {
    expect(t.en.close).toBe('Close')
  })

  it('creates english underscore alias en.common_close', () => {
    expect(t.en.common_close).toBe('Close')
  })

  it('creates english category alias en.cat_user_account', () => {
    expect(t.en.cat_user_account).toBe('User Account')
  })

  it('creates en.no_search_results from deeper key', () => {
    expect(t.en.no_search_results).toBe('No results')
  })

  it('has deep key da.nav.dashboard', () => {
    expect(t.da.nav.dashboard).toBe('Dashboard')
  })
})
