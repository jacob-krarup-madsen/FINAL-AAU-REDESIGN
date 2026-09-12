## Summary

- **Dependency Reduction & Bundle Size Optimization**:
  - Uninstalled the `tailwind-merge` dependency.
  - Simplified the `cn.ts` class utility helper to use `clsx` directly. This change reduces the production bundle size of `index.js` by **27.27 KB** (minified) and **8.32 KB** (gzipped).
- **Dashboard Rendering Performance Optimizations**:
  - Wrapped `DailySummaryStrip`, `FocusBanner`, `DashboardHeader`, and `WidgetGrid` in `React.memo` to skip unnecessary re-renders when the Dashboard 60-second timer updates the `now` state.
  - Wrapped `handleNavigate` and `handleToggleWidget` in `useCallback` to stabilize event handler references.
  - Memoized column layout calculations in `WidgetGrid.tsx` using `useMemo` to cache filters.
- **Codebase Simplification & Hook Consolidation**:
  - Consolidated custom hooks by inlining `useArchivableCollection` directly into `useManagedCollection.ts` and deleting the obsolete hook file to reduce file overhead.
  - Pruned unused date utility helpers (`hoursFromNow`, `getHoursUntil`, `calculateUrgency`) and their tests from `date.ts` and `date.test.ts`.
  - Re-exported `useManagedCollection` in the hooks index instead of the deleted hook.
  - Unified the custom `EmptyState` component used on the `Resources` page with the global `EmptyState` UI primitive, deleting the local `EmptyState.tsx` component file.
- **React Fast Refresh & Mock Data Standardization**:
  - Moved the `todayEvents` mock data array out of `QuickOverviewWidget.tsx` and into the central mock data Registry (`lib/data/index.ts`) to resolve React Fast Refresh warnings.
- **ESLint & Correctness Corrections**:
  - Fixed variable declaration scopes (`let` to `const`) in `WidgetSkeleton.tsx` and `Settings.test.tsx`.
  - Addressed missing React Hook dependency array warnings across components (`useMessagesState.ts`, `useNotificationsState.ts`, `ProfileTab.tsx`, `MonthView.tsx`).
  - Wrapped `useFormat.ts` helper utilities in `useCallback` to ensure reference stability.
- **Extracted Inline Tests**: Extracted all legacy inline `import.meta.vitest` test blocks into separate `__tests__/` directories.
- **Vite Chunking**: Configured Rollup manual chunking for mock data and translations to optimize initial load sizes.
- **Dependency Reduction**:
  - Uninstalled `@fontsource/barlow` dependency, utilizing native system font stacks in `global.css` instead.
- **Codebase Simplification & Re-export Pruning**:
  - Unified duplicate course registry models by removing the redundant `courseData` and `CourseRaw` declarations, pointing all usages directly to `courses`.
  - Deleted 5 redundant intermediate Calendar view and dialog re-export pages, importing components directly from their definitions and reducing double-memoization.
  - Pruned unused exported UI types and local page exports to resolve Knip configuration warnings.

## Verification

- `npm run lint` (`tsc --noEmit`) passes with 0 errors.
- ESLint checks pass with 0 errors.
- `npx vitest run` passes successfully (93 test files, 921 tests).
- `npm run build` succeeds in under 1.7s without warnings, outputting optimized chunks.

## Notes

- React core libraries (`react`, `react-dom`, `react-router`, `react-router-dom`) are isolated into a `vendor-react` chunk.
- Main bundle chunk size is kept to **105 KB**, well below the 400 KB warning threshold.
