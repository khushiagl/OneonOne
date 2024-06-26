import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UserProfilePage from './pages/ProfilePage';
import ContactsPage from './pages/ContactsPage';
import SchedulesPage from './pages/SchedulesPage';
import ScheduleEditPage from './pages/ScheduleEditPage'; 
import InvitationEditPage from './pages/InvitationEditPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/schedules/:id" element={<ScheduleEditPage />} />
        <Route path="/invitations/:id" element={<InvitationEditPage />} />
      </Routes>
    </Router>
  );
}

export default App;

