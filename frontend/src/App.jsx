import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import AuthModal from './components/AuthModal';

// Pages
import HomePage from './pages/HomePage';
import MuseumsPage from './pages/MuseumsPage';
import MuseumDetailsPage from './pages/MuseumDetailsPage';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';

import './App.css';

function MainApp() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => setIsChatbotOpen(prev => !prev);
  const openChatbot = () => setIsChatbotOpen(true);
  const closeChatbot = () => setIsChatbotOpen(false);

  return (
    <div className="app-container">
      <Navbar onOpenChatbot={openChatbot} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage onOpenChatbot={openChatbot} />} />
          <Route path="/museums" element={<MuseumsPage />} />
          <Route path="/museums/:id" element={<MuseumDetailsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/confirmation/:id" element={<ConfirmationPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating Concierge Chatbot */}
      <Chatbot
        isOpen={isChatbotOpen}
        onToggle={toggleChatbot}
        onClose={closeChatbot}
      />

      {/* Auth Modal for Login / Registration */}
      <AuthModal />
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <ToastProvider>
            <MainApp />
          </ToastProvider>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
