import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ContactsPage from './pages/ContactsPage';
import SchedulesPage from './pages/SchedulesPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
