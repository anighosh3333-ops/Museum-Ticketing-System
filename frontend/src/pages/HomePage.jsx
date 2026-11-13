import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Compass, 
  Clock, 
  Ticket, 
  Award,
  Users
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import MuseumCard from '../components/MuseumCard';
import ExhibitionCard from '../components/ExhibitionCard';

export default function HomePage({ onOpenChatbot }) {
  const navigate = useNavigate();
  const { museums, updateDraft } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const featuredMuseums = museums.slice(0, 3);
  
  // Extract all exhibitions across museums
  const popularExhibitions = museums.flatMap(m => 
    (m.exhibitions || []).map(exh => ({
      ...exh,
      museumId: m.id,
      museumName: m.name
    }))
  ).slice(0, 3);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    navigate(`/museums?query=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(selectedCity)}`);
  };

  const handleQuickBook = (museumId) => {
    updateDraft({ museumId });
    navigate('/booking');
  };

  return (
    <div className="homepage-root">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-pill-badge">
            <span>ART • HISTORY • CULTURE</span>
          </div>

          <h1 className="hero-headline">
            Discover Extraordinary Worlds
          </h1>

          <p className="hero-subtext">
            Explore world-class museums, immersive exhibitions and timeless stories from around the world.
          </p>

          <div className="hero-actions-row">
            <Link to="/museums" className="btn btn-primary btn-md">
              <span>Explore Museums</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/booking" className="btn btn-outline btn-md hero-plan-btn">
              <span>Plan Your Visit</span>
            </Link>
          </div>

          {/* Interactive Search & Filter Console */}
          <form onSubmit={handleHeroSearch} className="hero-search-box">
            <div className="search-field">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search museums, cities or exhibitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="search-divider" />

            <div className="search-field city-field">
              <MapPin size={18} className="search-icon" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="city-select"
              >
                <option value="">All Destinations</option>
                <option value="Paris">Paris, France</option>
                <option value="New York">New York, USA</option>
                <option value="New Delhi">New Delhi, India</option>
                <option value="Tokyo">Tokyo, Japan</option>
                <option value="London">London, UK</option>
                <option value="Florence">Florence, Italy</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary hero-submit-btn">
              <span>Explore Passes</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Subtle Feature Strip under Hero */}
          <div className="hero-feature-strip">
            <div className="feature-strip-item">
              <Compass size={18} className="strip-icon" />
              <div className="strip-text">
                <span className="strip-primary">Curated Museums</span>
                <span className="strip-secondary">Across Cities</span>
              </div>
            </div>
            <div className="feature-strip-item">
              <ShieldCheck size={18} className="strip-icon" />
              <div className="strip-text">
                <span className="strip-primary">Easy & Secure</span>
                <span className="strip-secondary">Booking</span>
              </div>
            </div>
            <div className="feature-strip-item">
              <Ticket size={18} className="strip-icon" />
              <div className="strip-text">
                <span className="strip-primary">Digital Tickets</span>
                <span className="strip-secondary">with QR Code</span>
              </div>
            </div>
            <div className="feature-strip-item">
              <Award size={18} className="strip-icon" />
              <div className="strip-text">
                <span className="strip-primary">Visitor Assistant</span>
                <span className="strip-secondary">Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Museums Section */}
      <section className="section-container">
        <div className="section-header-flex">
          <div>
            <div className="section-subtitle">
              <LandmarkIcon size={14} />
              <span>CURATED COLLECTIONS</span>
            </div>
            <h2 className="section-title">Featured Cultural Landmarks</h2>
          </div>
          <Link to="/museums" className="view-all-link">
            <span>View All Museums</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="museums-grid">
          {featuredMuseums.map(museum => (
            <MuseumCard key={museum.id} museum={museum} />
          ))}
        </div>
      </section>

      {/* Current / Popular Exhibitions Section */}
      <section className="section-container section-dark-accent">
        <div className="section-header-flex">
          <div>
            <div className="section-subtitle">
              <Sparkles size={14} />
              <span>LIMITED CURATIONS</span>
            </div>
            <h2 className="section-title">Popular Current Exhibitions</h2>
          </div>
          <Link to="/museums" className="view-all-link">
            <span>All Exhibitions</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="exhibitions-grid">
          {popularExhibitions.map((exh) => (
            <ExhibitionCard 
              key={exh.id} 
              exhibition={exh} 
              museumId={exh.museumId}
              museumName={exh.museumName}
            />
          ))}
        </div>
      </section>

      {/* Why Choose Aurum / Experience Perks */}
      <section className="section-container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="section-subtitle center">
            <Award size={14} />
            <span>THE AURUM DIFFERENCE</span>
          </div>
          <h2 className="section-title">Engineered for Seamless Cultural Exploration</h2>
          <p className="section-description">
            We partner directly with national heritage ministries to eliminate paper tickets,
            curb overcrowding, and fund urgent artifact conservation.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">
              <Ticket size={24} />
            </div>
            <h3 className="feature-title">Skip-The-Line Priority</h3>
            <p className="feature-text">
              Direct turnstile scan with your encrypted smartphone QR pass. No box-office queues or voucher exchanges.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Clock size={24} />
            </div>
            <h3 className="feature-title">Guaranteed Time Slots</h3>
            <p className="feature-text">
              Timed reservation windows guarantee comfortable crowd densities so you can savor masterpieces in tranquility.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Compass size={24} />
            </div>
            <h3 className="feature-title">Free Smart Audio Guide</h3>
            <p className="feature-text">
              Every ticket includes access to curator commentary, artwork insights, and interactive gallery maps.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <ShieldCheck size={24} />
            </div>
            <h3 className="feature-title">Reservation Management</h3>
            <p className="feature-text">
              You can update the reservation record in My Bookings. Contact the museum directly about visit changes or refund terms.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="section-container pb-20">
        <div className="cta-banner-card">
          <div className="cta-banner-content">
            <span className="cta-badge">EXPERIENCE WORLD ART TODAY</span>
            <h2 className="cta-heading">Ready for Your Next Cultural Journey?</h2>
            <p className="cta-text">
              Select a museum, date, and time, then confirm to view your in-app QR pass. Check the museum's entry requirements before visiting.
            </p>
            <div className="cta-buttons-row">
              <Link to="/booking" className="btn btn-primary btn-lg">
                <Ticket size={18} />
                <span>Book Tickets Now</span>
              </Link>
              <button 
                type="button" 
                className="btn btn-secondary btn-lg"
                onClick={onOpenChatbot}
              >
                <span>Ask AI Concierge</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LandmarkIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="accent-gold-text">
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  );
}
