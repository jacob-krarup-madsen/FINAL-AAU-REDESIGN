import { describe, it, expect } from 'vitest';
import { getFavoriteLabel, sortFavorites, resolveFavorite, allToolsList } from '@/lib/utils';
import type { FavoriteItem } from '@/lib/types';
import type { CourseWithStatus } from '@/store';

describe('favorites utility', () => {
  describe('getFavoriteLabel', () => {
    it('returns correct labels in Danish', () => {
      expect(getFavoriteLabel('course', 'da')).toBe('Kursus')
      expect(getFavoriteLabel('tool', 'da')).toBe('Værktøj')
      expect(getFavoriteLabel('file', 'da')).toBe('Fil')
      expect(getFavoriteLabel('forum', 'da')).toBe('Forum')
      expect(getFavoriteLabel('link', 'da')).toBe('Link')
    })

    it('returns correct labels in English', () => {
      expect(getFavoriteLabel('course', 'en')).toBe('Course')
      expect(getFavoriteLabel('tool', 'en')).toBe('Tool')
      expect(getFavoriteLabel('file', 'en')).toBe('File')
      expect(getFavoriteLabel('forum', 'en')).toBe('Forum')
      expect(getFavoriteLabel('link', 'en')).toBe('Link')
    })

    it('returns type if label is missing in translations', () => {
      expect(getFavoriteLabel('nonexistent' as any, 'da')).toBe('nonexistent')
    })
  })

  describe('sortFavorites', () => {
    it('sorts favorites by order property', () => {
      const favs: FavoriteItem[] = [
        { id: '1', type: 'course', entityId: 1, addedAt: 0, order: 2 },
        { id: '2', type: 'tool', entityId: 1, addedAt: 0, order: 1 },
        { id: '3', type: 'file', entityId: 1, addedAt: 0, order: 3 },
      ]
      const sorted = sortFavorites(favs)
      expect(sorted[0].id).toBe('2')
      expect(sorted[1].id).toBe('1')
      expect(sorted[2].id).toBe('3')
    })

    it('does not mutate original array', () => {
      const favs: FavoriteItem[] = [
        { id: '1', type: 'course', entityId: 1, addedAt: 0, order: 2 },
        { id: '2', type: 'tool', entityId: 1, addedAt: 0, order: 1 },
      ]
      sortFavorites(favs)
      expect(favs[0].id).toBe('1')
    })
  })

  describe('resolveFavorite', () => {
    const mockCourses: CourseWithStatus[] = [
      { id: 1, title: 'Dansk Titel', titleEn: 'English Title', label: 'L1', labelEn: 'L1E', img: '', code: 'C1' } as any
    ]
    const t = (key: string) => `translated_${key}`

    it('resolves course type', () => {
      const fav: FavoriteItem = { id: 'f1', type: 'course', entityId: 1, addedAt: 0, order: 0 }
      const resolved = resolveFavorite(fav, 'da', mockCourses, t)
      expect(resolved?.title).toBe('Dansk Titel')
      expect(resolved?.link).toBe('/course/1')
      
      const resolvedEn = resolveFavorite(fav, 'en', mockCourses, t)
      expect(resolvedEn?.title).toBe('English Title')
    })

    it('returns null if course not found', () => {
      const fav: FavoriteItem = { id: 'f1', type: 'course', entityId: 999, addedAt: 0, order: 0 }
      expect(resolveFavorite(fav, 'da', mockCourses, t)).toBeNull()
    })

    it('resolves tool type with titleKey', () => {
      const fav: FavoriteItem = { id: 'f1', type: 'tool', entityId: 1, addedAt: 0, order: 0 }
      const resolved = resolveFavorite(fav, 'da', mockCourses, t)
      expect(resolved?.title).toBe('translated_digital_exam')
      expect(resolved?.external).toBe(true)
    })

    it('resolves tool type with explicit titles', () => {
      const fav: FavoriteItem = { id: 'f1', type: 'tool', entityId: 5, addedAt: 0, order: 0 }
      const resolved = resolveFavorite(fav, 'da', mockCourses, t)
      expect(resolved?.title).toBe('Outlook Mail')
      
      const resolvedEn = resolveFavorite(fav, 'en', mockCourses, t)
      expect(resolvedEn?.title).toBe('Outlook Mail')
    })

    it('resolves tool with missing title fields to empty string', () => {
      const mockTool = { id: 9999, category: 'other', url: '', titleDa: '', titleEn: '' } as any
      allToolsList.push(mockTool)
      const fav: FavoriteItem = { id: 'f1', type: 'tool', entityId: 9999, addedAt: 0, order: 0 }
      const resolved = resolveFavorite(fav, 'da', mockCourses, t)
      expect(resolved?.title).toBe('')
      const idx = allToolsList.indexOf(mockTool)
      if (idx > -1) allToolsList.splice(idx, 1)
    })

    it('returns null if tool not found', () => {
      const fav: FavoriteItem = { id: 'f1', type: 'tool', entityId: 999, addedAt: 0, order: 0 }
      expect(resolveFavorite(fav, 'da', mockCourses, t)).toBeNull()
    })

    it('resolves forum type', () => {
      const fav: FavoriteItem = { id: 'f1', type: 'forum', entityId: 10, addedAt: 0, order: 0 }
      const resolved = resolveFavorite(fav, 'da', mockCourses, t)
      expect(resolved?.title).toBe('Studienævn for DDK')
      
      const resolvedEn = resolveFavorite(fav, 'en', mockCourses, t)
      expect(resolvedEn?.title).toBe('Study Board for DDK')
    })

    it('returns null if forum not found', () => {
      const fav: FavoriteItem = { id: 'f1', type: 'forum', entityId: 999, addedAt: 0, order: 0 }
      expect(resolveFavorite(fav, 'da', mockCourses, t)).toBeNull()
    })

    it('resolves file type', () => {
      const fav: FavoriteItem = { id: 'f1', type: 'file', entityId: 101, addedAt: 0, order: 0 }
      const resolved = resolveFavorite(fav, 'da', mockCourses, t)
      expect(resolved?.title).toBe('Kursusbeskrivelse og pensum')
      expect(resolved?.link).toBe('/course/1')

      const resolvedEn = resolveFavorite(fav, 'en', mockCourses, t)
      expect(resolvedEn?.title).toBe('Course Description and Syllabus')
    })

    it('returns null if file not found', () => {
      const fav: FavoriteItem = { id: 'f1', type: 'file', entityId: 999, addedAt: 0, order: 0 }
      expect(resolveFavorite(fav, 'da', mockCourses, t)).toBeNull()
    })

    it('returns null for link type', () => {
      const fav: FavoriteItem = { id: 'f1', type: 'link', entityId: 1, addedAt: 0, order: 0 }
      expect(resolveFavorite(fav, 'da', mockCourses, t)).toBeNull()
    })
  })
})
