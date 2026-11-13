import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Shield, Clock, Award, Sparkles, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    addToast('Subscribed to Aurum Cultural Gazette!', 'success');
    e.target.reset();
  };

  return (
    <footer className="footer-root">
      <div className="footer-top-perks">
        <div className="footer-perks-grid">
          <div className="perk-item">
            <div className="perk-icon-circle">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="perk-title">Instant Digital Pass</h4>
              <p className="perk-desc">Direct smartphone QR entry with priority skip-the-line access.</p>
            </div>
          </div>
          <div className="perk-item">
            <div className="perk-icon-circle">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="perk-title">Flexible Rescheduling</h4>
              <p className="perk-desc">Change time slots or cancel up to 24h before your visit.</p>
            </div>
          </div>
          <div className="perk-item">
            <div className="perk-icon-circle">
              <Award size={20} />
            </div>
            <div>
              <h4 className="perk-title">Verified Heritage Venues</h4>
              <p className="perk-desc">Official museum ticketing partner for curated national galleries.</p>
            </div>
          </div>
          <div className="perk-item">
            <div className="perk-icon-circle">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="perk-title">Conservation Support</h4>
              <p className="perk-desc">5% of every pass directly funds restoration and archival work.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-main-container">
        <div className="footer-grid">
          {/* Brand info */}
          <div className="footer-brand-col">
            <div className="navbar-brand footer-logo">
              <div className="brand-icon-box">
                <Landmark size={24} />
              </div>
              <div className="brand-text-group">
                <span className="brand-title">AURUM</span>
                <span className="brand-sub">HERITAGE & MUSEUMS</span>
              </div>
            </div>
            <p className="footer-mission-text">
              Connecting culture lovers with legendary antiquities, world-class exhibitions,
              and royal collections worldwide through seamless digital reservations.
            </p>
            <div className="footer-contact-snippet">
              <span className="accent-label">Member Concierge:</span> concierge@aurumheritage.org
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home Gallery</Link></li>
              <li><Link to="/museums">Featured Museums</Link></li>
              <li><Link to="/booking">Reserve Tickets</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              <li><Link to="/admin">Curator Dashboard</Link></li>
            </ul>
          </div>

          {/* Collections */}
          <div className="footer-col">
            <h4 className="footer-col-title">Galleries</h4>
            <ul className="footer-links">
              <li><Link to="/museums">The Grand Louvre</Link></li>
              <li><Link to="/museums">Metropolitan Vault of Fine Arts</Link></li>
              <li><Link to="/museums">National Heritage Palace</Link></li>
              <li><Link to="/museums">Tokyo Digital Arts Pavilion</Link></li>
              <li><Link to="/museums">Royal Armoury Treasury</Link></li>
              <li><Link to="/museums">Galleria degli Uffizi</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-col">
            <h4 className="footer-col-title">The Cultural Gazette</h4>
            <p className="footer-newsletter-text">
              Receive private curatorial previews, exhibition announcements, and member discounts.
            </p>
            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="footer-input"
              />
              <button type="submit" className="footer-submit-btn" aria-label="Subscribe">
                <Send size={16} />
              </button>
            </form>
            <span className="footer-hint">Zero spam. Pure art history & priority invitations.</span>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} AURUM Heritage Ticketing System. All rights reserved.</p>
          <div className="footer-legal-links">
            <span>Privacy Charter</span>
            <span>Visitor Terms</span>
            <span>Accessibility Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
