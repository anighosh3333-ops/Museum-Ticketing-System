import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, CalendarCheck, Home, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import TicketCard from '../components/TicketCard';
import { API_BASE_URL } from '../api';

export default function ConfirmationPage() {
  const { id } = useParams();
  const { getBookingById } = useBooking();

  const [booking, setBooking] = useState(() => getBookingById(id));
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!booking && id) {
      setLoading(true);
      fetch(`${API_BASE_URL}/bookings/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Booking not found on server');
          return res.json();
        })
        .then(json => {
          if (json && json.success && json.data) {
            setBooking(json.data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.warn("Could not fetch booking from API:", err.message);
          setLoading(false);
        });
    }
  }, [id, booking]);

  if (loading && !booking) {
    return (
      <div className="section-container text-center py-20">
        <div className="empty-state-box" style={{ borderColor: 'var(--border)' }}>
          <Loader2 size={36} className="empty-state-icon" style={{ animation: 'spin 1.2s linear infinite', margin: '0 auto 1rem' }} />
          <h3 className="empty-state-title">Retrieving Digital Pass...</h3>
          <p className="empty-state-desc">Fetching confirmed reservation details from Aurum ledger.</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="section-container text-center py-20">
        <h2>Booking Not Found</h2>
        <p className="text-muted my-4">Could not retrieve confirmation details for this identifier.</p>
        <Link to="/museums" className="btn btn-primary">Browse Museums</Link>
      </div>
    );
  }

  return (
    <div className="confirmation-page-root">
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="confirmation-header-card">
          <div className="success-badge-icon">
            <CheckCircle2 size={36} className="text-emerald" />
          </div>
          <div className="confirmation-header-text">
            <div className="confirmation-pretitle">
              <Sparkles size={14} className="accent-gold-text" />
              <span>RESERVATION CONFIRMED</span>
            </div>
            <h1 className="confirmation-main-title">Your Digital Museum Pass is Ready</h1>
            <p className="confirmation-sub-text">
              Your reservation is saved in Aurum. Show the QR code below at the museum and check the venue's entry instructions before your visit.
            </p>
          </div>
        </div>

        {/* The Digital Pass Card with QR Code and Print Actions */}
        <div className="confirmation-ticket-area">
          <TicketCard booking={booking} isCompact={false} />
        </div>

        {/* Next Steps / Quick Actions */}
        <div className="confirmation-actions-row no-print">
          <Link to="/my-bookings" className="btn btn-secondary btn-md">
            <CalendarCheck size={16} />
            <span>View in My Bookings</span>
          </Link>
          <Link to="/" className="btn btn-outline btn-md">
            <Home size={16} />
            <span>Return to Home</span>
          </Link>
          <Link to="/museums" className="btn btn-primary btn-md">
            <span>Explore More Galleries</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Visiting Tips Notice */}
        <div className="visiting-tips-card no-print">
          <h4 className="tips-title">Important Entry Reminders</h4>
          <ul className="tips-list">
            <li><strong>Entry:</strong> Follow the museum's visitor instructions and present this QR code if accepted.</li>
            <li><strong>Visit time:</strong> Your selected entry slot is {booking.timeSlot} on {booking.visitDate}.</li>
            <li><strong>Add-ons:</strong> Check with the museum for instructions on any selected add-ons.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
