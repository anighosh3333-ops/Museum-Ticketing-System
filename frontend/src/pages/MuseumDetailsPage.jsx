import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Star, 
  Calendar, 
  Ticket, 
  CheckCircle, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  Volume2, 
  Eye, 
  Compass,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import ExhibitionCard from '../components/ExhibitionCard';
import { useToast } from '../context/ToastContext';
import { adaptMuseum, findFallbackById } from '../utils/museumAdapter';
import { API_BASE_URL } from '../api';

export default function MuseumDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMuseumById, updateDraft } = useBooking();
  const { addToast } = useToast();

  // Initial fallback resolution for zero layout flash
  const fallbackMuseum = useMemo(() => {
    return findFallbackById(id) || getMuseumById(id);
  }, [id, getMuseumById]);

  const [museum, setMuseum] = useState(() => {
    return fallbackMuseum ? adaptMuseum(fallbackMuseum) : null;
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch museum details from the same-origin API route.
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setFetchError(null);

    fetch(`${API_BASE_URL}/museums/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Museum API responded with HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(json => {
        if (isMounted) {
          if (json && json.success && json.data) {
            setMuseum(adaptMuseum(json.data));
            setFetchError(null);
          } else {
            throw new Error(json?.message || 'Museum not found');
          }
          setLoading(false);
        }
      })
      .catch(err => {
        console.warn(`Could not load museum ${id} from API, using fallback data:`, err.message);
        if (isMounted) {
          const fallback = findFallbackById(id) || getMuseumById(id);
          if (fallback) {
            setMuseum(adaptMuseum(fallback));
          } else {
            setFetchError(err.message);
          }
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, getMuseumById]);

  // Quick booking sidebar state
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'exhibitions', 'hours', 'pricing'
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(museum?.timeSlots?.[0] || '11:00 AM');
  const [adultCount, setAdultCount] = useState(1);
  const [studentCount, setStudentCount] = useState(0);

  // Keep time slot in sync if museum loads asynchronously
  useEffect(() => {
    if (museum?.timeSlots?.length && !museum.timeSlots.includes(selectedSlot)) {
      setSelectedSlot(museum.timeSlots[0]);
    }
  }, [museum]);

  if (loading && !museum) {
    return (
      <div className="section-container text-center py-24">
        <div className="empty-state-box" style={{ borderColor: 'var(--border)' }}>
          <Loader2 size={40} className="empty-state-icon" style={{ animation: 'spin 1.2s linear infinite', margin: '0 auto 1rem' }} />
          <h3 className="empty-state-title">Loading Institution...</h3>
          <p className="empty-state-desc">Retrieving collection details from Aurum database.</p>
        </div>
      </div>
    );
  }

  if (!museum) {
    return (
      <div className="section-container text-center py-24">
        <h2>Museum Not Found</h2>
        <p className="text-muted my-4">The museum you are looking for does not exist or has been relocated.</p>
        <Link to="/museums" className="btn btn-primary">Return to Museums</Link>
      </div>
    );
  }

  const prices = museum.prices || { adult: 25, student: 15, child: 0 };
  const quickTotal = (adultCount * prices.adult) + (studentCount * prices.student);

  const handleProceedToBook = () => {
    updateDraft({
      museumId: museum.id,
      visitDate: selectedDate,
      timeSlot: selectedSlot,
      tickets: {
        adult: adultCount,
        student: studentCount,
        child: 0
      }
    });
    addToast(`Selected ${museum.name} for ${selectedDate}`, 'info');
    navigate('/booking');
  };

  return (
    <div className="museum-details-root">
      {/* Breadcrumbs */}
      <div className="details-breadcrumb-bar">
        <div className="details-container">
          <nav className="breadcrumb-nav">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <Link to="/museums">Museums</Link>
            <ChevronRight size={14} />
            <span className="current-crumb">{museum.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Visual Banner */}
      <div className="details-hero">
        <img 
          src={museum.image} 
          alt={museum.name} 
          className="details-hero-bg" 
        />
        <div className="details-hero-overlay" />
        
        <div className="details-container details-hero-content">
          <div className="details-badges-row">
            <span className="badge badge-gold">{museum.badge || museum.category}</span>
            <div className="badge badge-dark">
              <Star size={13} className="text-amber fill-amber" />
              <span>{museum.rating}</span>
              <span className="text-muted text-xs">({museum.reviewsCount?.toLocaleString()} reviews)</span>
            </div>
          </div>

          <h1 className="details-hero-title">{museum.name}</h1>
          <p className="details-hero-tagline">{museum.tagline}</p>

          <div className="details-meta-pills">
            <div className="meta-pill">
              <MapPin size={15} className="accent-gold-text" />
              <span>{museum.address}</span>
            </div>
            <div className="meta-pill">
              <Clock size={15} className="accent-gold-text" />
              <span>{museum.openingHours}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="details-container details-main-layout">
        {/* Left Column: Details & Content */}
        <div className="details-content-column">
          {/* Navigation Tabs */}
          <div className="details-tabs-bar">
            <button
              type="button"
              className={`details-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={`details-tab-btn ${activeTab === 'exhibitions' ? 'active' : ''}`}
              onClick={() => setActiveTab('exhibitions')}
            >
              Exhibitions ({museum.exhibitions?.length || 0})
            </button>
            <button
              type="button"
              className={`details-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
              onClick={() => setActiveTab('gallery')}
            >
              Gallery
            </button>
            <button
              type="button"
              className={`details-tab-btn ${activeTab === 'visitor-info' ? 'active' : ''}`}
              onClick={() => setActiveTab('visitor-info')}
            >
              Visitor Info
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="tab-pane">
              <h2 className="tab-section-title">About the Institution</h2>
              <p className="tab-body-text">{museum.description}</p>

              <h3 className="tab-subsection-title">Curatorial Highlights</h3>
              <div className="highlights-list">
                {museum.highlights?.map((highlight, idx) => (
                  <div key={idx} className="highlight-item">
                    <CheckCircle size={18} className="accent-gold-text" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              <h3 className="tab-subsection-title">Visitor Amenities</h3>
              <div className="amenities-tags-grid">
                {museum.amenities?.map((amenity, i) => (
                  <span key={i} className="amenity-chip">
                    <Sparkles size={13} className="accent-gold-text" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Exhibitions */}
          {activeTab === 'exhibitions' && (
            <div className="tab-pane">
              <h2 className="tab-section-title">Current Curated Exhibitions</h2>
              <p className="tab-body-text mb-6">
                Admission to these special exhibitions is included with all general Aurum passes.
              </p>
              <div className="exhibitions-grid">
                {museum.exhibitions?.map(exh => (
                  <ExhibitionCard 
                    key={exh.id} 
                    exhibition={exh} 
                    museumId={museum.id}
                    museumName={museum.name} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Gallery */}
          {activeTab === 'gallery' && (
            <div className="tab-pane">
              <h2 className="tab-section-title">Gallery & Architecture</h2>
              <p className="tab-body-text mb-6">
                Photographic glimpses into the halls, architectural masterworks, and collections.
              </p>
              <div className="details-gallery-grid">
                {(museum.gallery || [museum.image]).map((imgUrl, i) => (
                  <div key={i} className="gallery-thumb-box">
                    <img src={imgUrl} alt={`${museum.name} gallery ${i + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Visitor Info */}
          {activeTab === 'visitor-info' && (
            <div className="tab-pane">
              <h2 className="tab-section-title">Visiting Hours & Entry Guidelines</h2>
              <div className="hours-card">
                <div className="hours-row">
                  <span className="day-name">Daily Operating Hours</span>
                  <span className="day-val font-semibold text-white">{museum.openingHours}</span>
                </div>
                <div className="hours-row">
                  <span className="day-name">Weekly Scheduled Closure</span>
                  <span className="day-val text-amber">{museum.closedDays || 'None (Open Daily)'}</span>
                </div>
                <div className="hours-row">
                  <span className="day-name">Last Admittance</span>
                  <span className="day-val">60 minutes prior to closing time</span>
                </div>
                <div className="hours-row">
                  <span className="day-name">Express Queue Gate</span>
                  <span className="day-val font-semibold text-gold">Check the museum's official entry instructions</span>
                </div>
              </div>

              <h3 className="tab-subsection-title">Security & Visitor Protocols</h3>
              <ul className="guidelines-list">
                <li>Backpacks and large luggage exceeding 55×35×20 cm must be checked at the cloakroom.</li>
                <li>Non-commercial photography without flash or tripods is permitted in most permanent galleries.</li>
                <li>Check whether the museum accepts this in-app QR pass and follow its visitor entry instructions.</li>
              </ul>

              <h3 className="tab-subsection-title mt-6">Official Admission Pricing</h3>
              <div className="pricing-matrix">
                <div className="pricing-tier-card">
                  <div className="tier-header">
                    <h4>Adult Admission</h4>
                    <span className="tier-price">${prices.adult}</span>
                  </div>
                  <p className="tier-sub">Ages 18 and above. Full access to permanent collection & exhibitions.</p>
                </div>

                <div className="pricing-tier-card">
                  <div className="tier-header">
                    <h4>Student Admission</h4>
                    <span className="tier-price">${prices.student}</span>
                  </div>
                  <p className="tier-sub">Valid student identification card required at entry gates.</p>
                </div>

                <div className="pricing-tier-card">
                  <div className="tier-header">
                    <h4>Child Admission</h4>
                    <span className="tier-price">{prices.child === 0 ? 'FREE' : `$${prices.child}`}</span>
                  </div>
                  <p className="tier-sub">Ages 0 to 12. Must be accompanied by an adult pass holder.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Direct Booking Console */}
        <div className="details-sidebar-column">
          <div className="booking-widget-card sticky-widget">
            <div className="widget-header">
              <span className="widget-subtitle">DIRECT RESERVATION</span>
              <h3 className="widget-title">Book Tickets</h3>
              <div className="widget-price-preview">
                <span className="text-muted text-sm">Starts from</span>
                <span className="preview-price">${museum.basePrice}</span>
                <span className="text-muted text-xs">/ ticket</span>
              </div>
            </div>

            {/* Date selection */}
            <div className="widget-field">
              <label className="widget-label" htmlFor="museum-visit-date">
                <Calendar size={14} className="accent-gold-text" />
                <span>Select Date</span>
              </label>
              <input
                id="museum-visit-date"
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="widget-input"
              />
            </div>

            {/* Time slot selection */}
            <div className="widget-field">
              <label className="widget-label">
                <Clock size={14} className="accent-gold-text" />
                <span>Select Time</span>
              </label>
              <div className="widget-slots-grid">
                {museum.timeSlots?.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-chip ${selectedSlot === slot ? 'active' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket quantity selector */}
            <div className="widget-field">
              <label className="widget-label">
                <Ticket size={14} className="accent-gold-text" />
                <span>Ticket quantities</span>
              </label>
              
              <div className="quantity-counter-row">
                <div>
                  <div className="font-medium text-sm text-white">Adult (${prices.adult})</div>
                  <span className="text-xs text-muted">Ages 18+</span>
                </div>
                <div className="counter-controls">
                  <button 
                    type="button"
                    className="counter-btn"
                    onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                    disabled={adultCount <= 1}
                  >
                    -
                  </button>
                  <span className="counter-val">{adultCount}</span>
                  <button 
                    type="button"
                    className="counter-btn"
                    onClick={() => setAdultCount(adultCount + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="quantity-counter-row mt-2">
                <div>
                  <div className="font-medium text-sm text-white">Student (${prices.student})</div>
                  <span className="text-xs text-muted">With Student ID</span>
                </div>
                <div className="counter-controls">
                  <button 
                    type="button"
                    className="counter-btn"
                    onClick={() => setStudentCount(Math.max(0, studentCount - 1))}
                    disabled={studentCount <= 0}
                  >
                    -
                  </button>
                  <span className="counter-val">{studentCount}</span>
                  <button 
                    type="button"
                    className="counter-btn"
                    onClick={() => setStudentCount(studentCount + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total calculation & Action */}
            <div className="widget-total-row">
              <div>
                <span className="text-xs text-muted">Total Amount</span>
                <div className="total-display">${quickTotal} USD</div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={handleProceedToBook}
              >
                <span>Continue to Booking</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="widget-guarantee">
              <ShieldCheck size={14} className="text-amber" />
              <span>In-app QR pass after confirmation. No payment is collected.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
