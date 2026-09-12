import routes from '@/routes'

describe('routes', () => {
  it('has the correct number of routes', () => {
    expect(routes).toHaveLength(13)
  })

  it('each route has required fields', () => {
    for (const route of routes) {
      expect(route).toHaveProperty('path')
      expect(route).toHaveProperty('component')
      expect(route).toHaveProperty('label')
    }
  })

  it('all paths are unique', () => {
    const paths = routes.map(r => r.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('all labels are unique', () => {
    const labels = routes.map(r => r.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('maps / to Dashboard', () => {
    expect(routes.find(r => r.path === '/')?.label).toBe('dashboard')
  })

  it('maps /calendar to calendar', () => {
    expect(routes.find(r => r.path === '/calendar')?.label).toBe('calendar')
  })

  it('maps /courses to courses', () => {
    expect(routes.find(r => r.path === '/courses')?.label).toBe('courses')
  })

  it('maps /course/:id to course', () => {
    expect(routes.find(r => r.path === '/course/:id')?.label).toBe('course')
  })

  it('maps /support to support', () => {
    expect(routes.find(r => r.path === '/support')?.label).toBe('support')
  })

  it('maps /settings to settings', () => {
    expect(routes.find(r => r.path === '/settings')?.label).toBe('settings')
  })

  it('maps /messages to messages', () => {
    expect(routes.find(r => r.path === '/messages')?.label).toBe('messages')
  })

  it('maps /resources to resources', () => {
    expect(routes.find(r => r.path === '/resources')?.label).toBe('resources')
  })

  it('maps /notifications to notifications', () => {
    expect(routes.find(r => r.path === '/notifications')?.label).toBe('notifications')
  })

  it('maps /favorites to favorites', () => {
    expect(routes.find(r => r.path === '/favorites')?.label).toBe('favorites')
  })

  it('maps /search to search', () => {
    expect(routes.find(r => r.path === '/search')?.label).toBe('search')
  })

  it('maps /forum/:id to forum', () => {
    expect(routes.find(r => r.path === '/forum/:id')?.label).toBe('forum')
  })

  it('each route component is a lazy React component', () => {
    for (const route of routes) {
      expect(route.component.$$typeof).toBe(Symbol.for('react.lazy'))
    }
  })

  it('each lazy import resolves to a valid module', async () => {
    for (const route of routes) {
      const factory = (route.component as unknown as { _payload: { _result: () => Promise<{ default: unknown }> } })._payload._result
      const mod = await factory()
      expect(mod.default).toBeDefined()
    }
  })
})
