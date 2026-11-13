import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Camera, 
  ShieldCheck, 
  CalendarCheck, 
  KeyRound, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  Eye, 
  EyeOff, 
  Award,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, logout, openAuthModal } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Synchronize form when user loads or updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setCountry(user.country || '');
      setProfileImage(user.avatar || user.profile_image || null);
    }
  }, [user]);

  // If not logged in, prompt user to sign in
  if (!user) {
    return (
      <div className="section-container text-center py-24">
        <div className="empty-state-box">
          <User size={48} className="empty-state-icon" />
          <h2 className="empty-state-title">Patron Sign In Required</h2>
          <p className="empty-state-desc">
            Please sign in to access your personal patron membership profile, manage your reservations, and update account preferences.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => openAuthModal('login')}
            >
              <User size={15} />
              <span>Sign In to Account</span>
            </button>
            <Link to="/" className="btn btn-secondary btn-sm">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const roleLabel = (user.role === 'admin' || user.role === 'Curator Admin') 
    ? 'Chief Curator Administrator' 
    : 'Patron Heritage Member';

  const memberSinceYear = user.memberSince || (user.created_at ? user.created_at.split('-')[0] : '2026');

  // Photo change handler (converts file to browser-safe base64 data URL)
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPEG, PNG, WebP).', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size exceeds 5MB limit. Please choose a smaller file.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result;
      setProfileImage(base64Url);
      addToast('Photo preview updated. Click "Save Changes" to apply.', 'info');
    };
    reader.onerror = () => {
      addToast('Failed to read image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Submit profile details
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });

    if (!name.trim()) {
      setProfileMessage({ type: 'error', text: 'Full Name is required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setProfileMessage({ type: 'error', text: 'A valid email address is required.' });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim(),
        profile_image: profileImage
      });

      setIsSaving(false);
      setProfileMessage({ type: 'success', text: 'Your profile information has been saved.' });
      addToast('Profile changes saved successfully.', 'success');
    } catch (err) {
      setIsSaving(false);
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
      addToast(err.message || 'Profile update failed.', 'error');
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Current password is required.' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({ type: 'success', text: 'Password has been updated securely.' });
      addToast('Password changed successfully.', 'success');
    } catch (err) {
      setIsChangingPassword(false);
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to change password.' });
      addToast(err.message || 'Password change failed.', 'error');
    }
  };

  const handleLogoutClick = () => {
    logout();
    addToast('Signed out of Aurum account.', 'info');
    navigate('/');
  };

  return (
    <div className="profile-page-root">
      {/* Banner */}
      <div className="page-header-banner">
        <div className="page-header-container">
          <div className="page-header-badge">
            <Award size={14} className="accent-gold-text" />
            <span>PATRON ACCOUNT & CREDENTIALS</span>
          </div>
          <h1 className="page-header-title">Patron Profile</h1>
          <p className="page-header-desc">
            Manage your personal contact details, membership credentials, and secure access settings.
          </p>
        </div>
      </div>

      <div className="section-container profile-container">
        <div className="profile-layout-grid">
          {/* Left Column: Identity & Account Card */}
          <aside className="profile-sidebar-column">
            <div className="profile-card patron-identity-card">
              <div className="profile-avatar-area">
                <div className="avatar-frame">
                  <img 
                    src={profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80'} 
                    alt={user.name} 
                    className="profile-avatar-large" 
                  />
                  <button
                    type="button"
                    className="avatar-change-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload local photo"
                    aria-label="Change profile photo"
                  >
                    <Camera size={16} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handlePhotoSelect} 
                    style={{ display: 'none' }} 
                  />
                </div>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm change-photo-text-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={14} />
                  <span>Change Photo</span>
                </button>
              </div>

              <div className="patron-identity-body">
                <h2 className="patron-display-name">{user.name}</h2>
                <p className="patron-display-email">{user.email}</p>
                <div className="patron-badge-wrap">
                  <span className="badge badge-gold">
                    <ShieldCheck size={13} />
                    <span>{roleLabel}</span>
                  </span>
                </div>

                <div className="patron-meta-list">
                  <div className="patron-meta-row">
                    <span className="meta-label">Member Since</span>
                    <span className="meta-value">{memberSinceYear}</span>
                  </div>
                  <div className="patron-meta-row">
                    <span className="meta-label">Tier Status</span>
                    <span className="meta-value">{user.membershipTier || 'Gold Heritage Pass'}</span>
                  </div>
                  <div className="patron-meta-row">
                    <span className="meta-label">Account ID</span>
                    <span className="meta-value font-mono">AUR-USR-{String(user.id || 1).padStart(4, '0')}</span>
                  </div>
                </div>

                <div className="patron-actions-group">
                  <Link to="/my-bookings" className="btn btn-secondary btn-full btn-sm action-btn-link">
                    <CalendarCheck size={15} className="accent-gold-text" />
                    <span>My Reservations & Passes</span>
                    <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
                  </Link>

                  {(user.role === 'admin' || user.role === 'Curator Admin') && (
                    <Link to="/admin" className="btn btn-secondary btn-full btn-sm action-btn-link">
                      <ShieldCheck size={15} className="text-blue" />
                      <span>Curator Admin Dashboard</span>
                      <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
                    </Link>
                  )}

                  <button 
                    type="button" 
                    className="btn btn-danger btn-full btn-sm"
                    onClick={handleLogoutClick}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Edit Forms */}
          <main className="profile-main-column">
            {/* 1. Personal Information Section */}
            <section className="profile-card form-section-card">
              <div className="card-section-header">
                <div className="header-icon-box">
                  <User size={20} className="accent-gold-text" />
                </div>
                <div>
                  <h3 className="section-heading">Personal Information</h3>
                  <p className="section-subheading">
                    Update your patron contact details associated with ticketing and gallery admissions.
                  </p>
                </div>
              </div>

              {profileMessage.text && (
                <div className={`auth-notice-banner ${profileMessage.type === 'error' ? 'notice-error' : 'notice-success'}`}>
                  {profileMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-two-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-fullname">
                      <span>Full Name</span>
                      <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon">
                      <User size={16} className="input-icon" />
                      <input
                        id="profile-fullname"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Julian Montgomery"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-email">
                      <span>Email Address</span>
                      <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon">
                      <Mail size={16} className="input-icon" />
                      <input
                        id="profile-email"
                        type="email"
                        className="form-input"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-two-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-phone">
                      <span>Phone Number</span>
                    </label>
                    <div className="input-with-icon">
                      <Phone size={16} className="input-icon" />
                      <input
                        id="profile-phone"
                        type="tel"
                        className="form-input"
                        placeholder="+33 6 42 19 88 04"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-country">
                      <span>Country of Residence</span>
                    </label>
                    <div className="input-with-icon">
                      <Globe size={16} className="input-icon" />
                      <input
                        id="profile-country"
                        type="text"
                        className="form-input"
                        placeholder="e.g. France, United Kingdom"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-submit-row">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-md"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </section>

            {/* 2. Security & Password Change Section */}
            <section className="profile-card form-section-card" style={{ marginTop: '2rem' }}>
              <div className="card-section-header">
                <div className="header-icon-box">
                  <KeyRound size={20} className="accent-gold-text" />
                </div>
                <div>
                  <h3 className="section-heading">Security & Password</h3>
                  <p className="section-subheading">
                    Manage your credentials to ensure your digital passes and account remain protected.
                  </p>
                </div>
              </div>

              {passwordMessage.text && (
                <div className={`auth-notice-banner ${passwordMessage.type === 'error' ? 'notice-error' : 'notice-success'}`}>
                  {passwordMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="current-password">
                    <span>Current Password</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon password-input-wrap">
                    <Lock size={16} className="input-icon" />
                    <input
                      id="current-password"
                      type={showPasswords ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-two-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-password">
                      <span>New Password</span>
                      <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon password-input-wrap">
                      <Lock size={16} className="input-icon" />
                      <input
                        id="new-password"
                        type={showPasswords ? 'text' : 'password'}
                        className="form-input"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="confirm-password">
                      <span>Confirm New Password</span>
                      <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon password-input-wrap">
                      <Lock size={16} className="input-icon" />
                      <input
                        id="confirm-password"
                        type={showPasswords ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                <div className="password-controls-row">
                  <button
                    type="button"
                    className="toggle-password-visibility-btn"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? <EyeOff size={15} /> : <Eye size={15} />}
                    <span>{showPasswords ? 'Hide passwords' : 'Show passwords'}</span>
                  </button>

                  <button 
                    type="submit" 
                    className="btn btn-secondary btn-md"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
