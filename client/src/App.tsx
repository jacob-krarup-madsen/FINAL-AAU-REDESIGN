import { Suspense } from 'react';


import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/Layout';
import Layout from '@/components/Layout';
import NotFound from '@/pages/NotFound';
import routes from './routes';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      {routes.map((route) =>
        route.path === '/' ? (
          <Route key="/" index element={<route.component />} />
        ) : (
          <Route key={route.path} path={route.path} element={<route.component />} />
        ),
      )}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

