import { Navigate, Route, Routes } from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { EventsPage } from './pages/EventsPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/events" element={<EventsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
