import { Navigate, Route, Routes } from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { EventsPage } from './pages/EventsPage';
import { BookingsPage } from './pages/BookingsPage';
import { GraphBoardPage } from './pages/GraphBoardPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/events" element={<EventsPage />} />
      <Route path="/admin/bookings" element={<BookingsPage />} />
      <Route path="/graphboard" element={<GraphBoardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
