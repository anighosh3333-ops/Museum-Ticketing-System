import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, authMode, setAuthMode, login, register } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (authMode === 'login') {
        if (!email.trim() || !password.trim()) {
          setError('Please enter both email and password.');
          return;
        }
        const loggedUser = await login(email, password);
        addToast(`Welcome back, ${loggedUser.name || email.split('@')[0]}!`, 'success');
      } else {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          setError('Please fill in all registration fields.');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          return;
        }
        const registeredUser = await register(fullName, email, password);
        addToast(`Account created! Welcome to Aurum Heritage, ${registeredUser.name || fullName}.`, 'success');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    }
  };

  const handleDemoVisitor = async () => {
    setError('');
    try {
      await login('visitor@aurum.com', 'Visitor@123');
      addToast('Logged in as Patron Visitor: Demo Visitor', 'success');
    } catch (err) {
      setError(err.message || 'Visitor demo login failed.');
    }
  };

  const handleDemoAdmin = async () => {
    setError('');
    try {
      await login('admin@aurum.com', 'Admin@123');
      addToast('Logged in as Chief Curator & Administrator', 'success');
    } catch (err) {
      setError(err.message || 'Admin login failed.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div className="modal-card auth-modal-card" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          type="button" 
          className="modal-close-btn" 
          onClick={closeAuthModal}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="auth-header text-center">
          <div className="auth-icon-circle">
            <Sparkles size={24} className="gold-accent" />
          </div>
          <h2 className="auth-title">
            {authMode === 'login' ? 'Patron Sign In' : 'Join Aurum Heritage'}
          </h2>
          <p className="auth-subtitle">
            {authMode === 'login' 
              ? 'Access your digital passes, upcoming reservations, and priority queue.'
              : 'Create an account to reserve museum passes and receive member perks.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => { setAuthMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => { setAuthMode('register'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="auth-error-banner">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {authMode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="register-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Julian Montgomery"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                className="form-input"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                id="auth-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full auth-submit-btn">
            {authMode === 'login' ? 'Sign In to Account' : 'Register for Free'}
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="auth-demo-section">
          <div className="demo-divider">
            <span>OR 1-CLICK DEMO ACCESS</span>
          </div>

          <div className="demo-buttons-grid">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDemoVisitor}
            >
              <User size={14} />
              <span>Visitor Demo</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDemoAdmin}
            >
              <ShieldCheck size={14} className="accent-gold-text" />
              <span>Curator / Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
