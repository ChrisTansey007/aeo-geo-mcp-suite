import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

import AppShell from './shell/AppShell';
import Dashboard from './pages/Dashboard';
import RunDetail from './pages/RunDetail';
import History from './pages/History';
import Settings from './pages/Settings';
import Chat from './pages/Chat';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
  { index: true, element: <Dashboard /> },
  { path: 'runs/:id', element: <RunDetail /> },
  { path: 'history', element: <History /> },
  { path: 'chat', element: <Chat /> },
  { path: 'settings', element: <Settings /> }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
