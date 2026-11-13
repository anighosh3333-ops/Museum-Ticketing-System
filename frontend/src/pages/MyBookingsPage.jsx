import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  Ticket, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  QrCode, 
  Eye, 
  Calendar, 
  RotateCcw, 
  Sparkles 
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import TicketCard from '../components/TicketCard';

export default function MyBookingsPage() {
  const { bookings, cancelBooking, refreshBookings } = useBooking();
  const { addToast } = useToast();

  useEffect(() => {
    refreshBookings?.();
  }, [refreshBookings]);

  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Upcoming', 'Completed', 'Cancelled'
  const [ticketModalBooking, setTicketModalBooking] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'All') return true;
    return b.status.toLowerCase() === activeTab.toLowerCase();
  });

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;
    cancelBooking(cancelModalBooking.id);
    addToast(`Booking #${cancelModalBooking.id} has been cancelled.`, 'info');
    setCancelModalBooking(null);
  };

  return (
    <div className="my-bookings-page-root">
      {/* Page Header */}
      <div className="page-header-banner">
        <div className="page-header-container">
          <div className="page-header-badge">
            <CalendarCheck size={14} className="accent-gold-text" />
            <span>PATRON RESERVATIONS</span>
          </div>
          <h1 className="page-header-title">My Museum Passes</h1>
          <p className="page-header-desc">
            Manage your scheduled gallery admissions, download digital QR tickets, or cancel upcoming visits.
          </p>
        </div>
      </div>

      <div className="section-container">
        {/* Status Filter Tabs */}
        <div className="bookings-tabs-bar">
          {['All', 'Upcoming', 'Completed', 'Cancelled'].map(tab => {
            const count = tab === 'All' 
              ? bookings.length 
              : bookings.filter(b => b.status.toLowerCase() === tab.toLowerCase()).length;
            return (
              <button
                key={tab}
                type="button"
                className={`booking-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                <span>{tab}</span>
                <span className="tab-count-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="bookings-list-stack">
            {filteredBookings.map(b => {
              const totalTickets = (b.tickets?.adult || 0) + (b.tickets?.student || 0) + (b.tickets?.child || 0);
              const isUpcoming = b.status === 'Upcoming';

              return (
                <div key={b.id} className="booking-item-card">
                  {/* Media */}
                  <div className="booking-item-media">
                    <img src={b.museumImage} alt={b.museumName} className="booking-item-img" />
                    <span className={`booking-status-tag status-${b.status.toLowerCase()}`}>
                      {b.status}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="booking-item-body">
                    <div className="booking-id-row">
                      <span className="booking-id-pill">PASS ID: {b.id}</span>
                      <span className="booking-booked-date">Booked on {b.bookingDate}</span>
                    </div>

                    <h3 className="booking-museum-name">{b.museumName}</h3>
                    <div className="booking-loc-row">
                      <MapPin size={14} className="accent-gold-text" />
                      <span>{b.museumLocation}</span>
                    </div>

                    <div className="booking-item-metrics">
                      <div className="metric-box">
                        <Calendar size={14} />
                        <div>
                          <div className="metric-label">VISIT DATE</div>
                          <div className="metric-val">{b.visitDate}</div>
                        </div>
                      </div>

                      <div className="metric-box">
                        <Clock size={14} />
                        <div>
                          <div className="metric-label">ENTRY TIME</div>
                          <div className="metric-val">{b.timeSlot}</div>
                        </div>
                      </div>

                      <div className="metric-box">
                        <Ticket size={14} />
                        <div>
                          <div className="metric-label">VISITORS</div>
                          <div className="metric-val">{totalTickets} Visitor{totalTickets > 1 ? 's' : ''}</div>
                        </div>
                      </div>

                      <div className="metric-box">
                        <Sparkles size={14} />
                        <div>
                          <div className="metric-label">PRICE</div>
                          <div className="metric-val font-semibold text-gold">${b.totalAmount} USD</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="booking-actions-row">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setTicketModalBooking(b)}
                      >
                        <QrCode size={15} />
                        <span>View Ticket</span>
                      </button>

                      {isUpcoming && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm cancel-btn"
                          onClick={() => setCancelModalBooking(b)}
                        >
                          <X size={15} />
                          <span>Cancel Booking</span>
                        </button>
                      )}

                      {!isUpcoming && (
                        <Link 
                          to={`/booking?museumId=${b.museumId}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <RotateCcw size={14} />
                          <span>Book Again</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state-box">
            <Ticket size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No passes in this category</h3>
            <p className="empty-state-desc">
              You do not have any {activeTab.toLowerCase()} reservations registered in your account.
            </p>
            <Link to="/museums" className="btn btn-primary">
              Discover Museums & Reserve Pass
            </Link>
          </div>
        )}
      </div>

      {/* View Ticket Modal */}
      {ticketModalBooking && (
        <div className="modal-backdrop" onClick={() => setTicketModalBooking(null)}>
          <div className="modal-card ticket-dialog-card" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setTicketModalBooking(null)}
              aria-label="Close ticket modal"
            >
              <X size={18} />
            </button>
            <TicketCard booking={ticketModalBooking} />
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelModalBooking && (
        <div className="modal-backdrop" onClick={() => setCancelModalBooking(null)}>
          <div className="modal-card cancel-dialog-card" onClick={e => e.stopPropagation()}>
            <div className="cancel-icon-circle">
              <AlertTriangle size={24} className="text-amber" />
            </div>
            <h3 className="cancel-dialog-title">Cancel Reservation?</h3>
            <p className="cancel-dialog-text">
              Are you sure you wish to cancel your pass to <strong>{cancelModalBooking.museumName}</strong> for <strong>{cancelModalBooking.visitDate} ({cancelModalBooking.timeSlot})</strong>?
            </p>
            <p className="cancel-policy-note">
              Aurum does not collect payments or issue refunds. Canceling here updates the reservation record in this app; contact the museum directly about its cancellation and refund policy.
            </p>
            <div className="cancel-dialog-buttons">
              <button
                type="button"
                className="btn btn-secondary flex-1"
                onClick={() => setCancelModalBooking(null)}
              >
                Keep Reservation
              </button>
              <button
                type="button"
                className="btn btn-danger flex-1"
                onClick={handleConfirmCancel}
              >
                Yes, Cancel Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
