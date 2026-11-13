import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Landmark, 
  Ticket, 
  CalendarCheck, 
  ShieldCheck, 
  User, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown, 
  MessageSquare,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export default function Navbar({ onOpenChatbot }) {
  const { user, logout, openAuthModal } = useAuth();
  const { bookingDraft, calculatePricing } = useBooking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const pricing = calculatePricing();
  const ticketCount = pricing.totalTickets;

  const isAdmin = user?.role === 'admin' || user?.role === 'Curator Admin';

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMobile}>
          <div className="brand-icon-box">
            <Landmark className="brand-icon" size={24} />
          </div>
          <div className="brand-text-group">
            <span className="brand-title">AURUM</span>
            <span className="brand-sub">MUSEUMS & HERITAGE</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/museums" 
            className={`nav-link ${isActive('/museums') ? 'active' : ''}`}
          >
            Museums
          </Link>
          <Link 
            to="/booking" 
            className={`nav-link ${isActive('/booking') ? 'active' : ''}`}
          >
            <span>Tickets</span>
            {ticketCount > 0 && (
              <span className="nav-badge">{ticketCount}</span>
            )}
          </Link>
          <Link 
            to="/my-bookings" 
            className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`}
          >
            My Bookings
          </Link>
          <button 
            type="button" 
            className="nav-link nav-link-btn" 
            onClick={onOpenChatbot}
          >
            <MessageSquare size={16} />
            <span>Visitor Assistant</span>
          </button>
          {isAdmin && (
            <Link 
              to="/admin" 
              className={`nav-link admin-nav-link ${isActive('/admin') ? 'active' : ''}`}
            >
              <ShieldCheck size={16} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right Section: Auth & Actions */}
        <div className="navbar-actions">
          <Link 
            to="/museums" 
            className="nav-search-btn" 
            title="Search museums, cities or exhibitions"
            aria-label="Search museums"
          >
            <Search size={18} />
          </Link>
          {user ? (
            <div className="user-menu-wrapper">
              <button
                type="button"
                className="user-profile-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
              >
                <span 
                  className="user-profile-clickable"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserDropdownOpen(false);
                    navigate('/profile');
                  }}
                  title="View Account Profile"
                >
                  <img 
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                    alt={user.name} 
                    className="user-avatar-small" 
                  />
                  <span className="user-name-short">{user.name?.split(' ')[0] || user.name}</span>
                </span>
                <ChevronDown size={14} className={`chevron-icon ${userDropdownOpen ? 'rotated' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu" onMouseLeave={() => setUserDropdownOpen(false)}>
                  <Link 
                    to="/profile"
                    className="dropdown-user-header dropdown-user-header-link"
                    onClick={() => setUserDropdownOpen(false)}
                    title="View & Edit Profile"
                  >
                    <p className="dropdown-user-name">{user.name}</p>
                    <p className="dropdown-user-email">{user.email}</p>
                    <span className="dropdown-user-badge">{user.role}</span>
                  </Link>
                  <div className="dropdown-divider" />
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <Link 
                    to="/my-bookings" 
                    className="dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <CalendarCheck size={16} />
                    <span>My Bookings</span>
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <ShieldCheck size={16} />
                      <span>Curator Dashboard</span>
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button 
                    type="button" 
                    className="dropdown-item logout-item"
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              type="button" 
              className="btn btn-outline btn-sm"
              onClick={() => openAuthModal('login')}
            >
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}

          <Link to="/booking" className="btn btn-primary btn-sm book-tickets-cta">
            <Ticket size={16} />
            <span>Book Tickets</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <Link 
            to="/" 
            className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            Home
          </Link>
          <Link 
            to="/museums" 
            className={`mobile-nav-link ${isActive('/museums') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            Museums
          </Link>
          <Link 
            to="/booking" 
            className={`mobile-nav-link ${isActive('/booking') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            Tickets {ticketCount > 0 ? `(${ticketCount})` : ''}
          </Link>
          <Link 
            to="/my-bookings" 
            className={`mobile-nav-link ${isActive('/my-bookings') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            My Bookings
          </Link>
          <button 
            type="button" 
            className="mobile-nav-link mobile-btn" 
            onClick={() => {
              closeMobile();
              onOpenChatbot();
            }}
          >
            Visitor Assistant
          </button>
          {isAdmin && (
            <Link 
              to="/admin" 
              className={`mobile-nav-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={closeMobile}
            >
              Admin Dashboard
            </Link>
          )}

          <div className="mobile-auth-section">
            {user ? (
              <div className="mobile-user-box">
                <Link 
                  to="/profile" 
                  className="mobile-user-details"
                  onClick={closeMobile}
                  title="View Account Profile"
                >
                  <img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} alt={user.name} className="user-avatar-small" />
                  <div>
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-xs text-muted">{user.role}</div>
                  </div>
                </Link>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-full btn-sm"
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary btn-full"
                onClick={() => {
                  closeMobile();
                  openAuthModal('login');
                }}
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
