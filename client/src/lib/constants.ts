export const STORAGE_KEYS = {
  CALENDAR_EVENTS: 'aauCalendarEvents',
  COURSE_PROGRESS_PREFIX: 'courseProgress_',
  EXPANDED_SECTIONS_PREFIX: 'expandedSections_',
  USER_FIRST_NAME: 'userFirstName',
  USER_LAST_NAME: 'userLastName',
  USER_STORE: 'aau-user-store',
  APP_STORE: 'aau-app-store',
} as const;

export const API_RETRY_BACKOFF = [500, 1500, 3000] as const;

export const ASSETS = {
  fallback: {
    searchThumbnail: '/images/campus/2wb3689.webp',
  },
  promo: {
    student: '/images/student-life/2wb5786.webp',
    instructor: '/images/student-life/2wb0351.webp',
  },
};

// Grid column values must match CSS media queries in global.css lines 502-513
export const DASHBOARD_CONFIG = {
  FAVORITES_LIMIT: 12,
  WIDGET_ROW_HEIGHT: 100,
  GRID_COLUMNS: 24,
  TABLET_GRID_COLUMNS: 12,
  MOBILE_GRID_COLUMNS: 6,
};
