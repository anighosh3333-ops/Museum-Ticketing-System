import React, { useRef } from 'react';
import { Landmark, Calendar, Clock, MapPin, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import QRCode from './QRCode';
import { useToast } from '../context/ToastContext';

export default function TicketCard({ booking, isCompact = false }) {
  const { addToast } = useToast();
  const ticketRef = useRef(null);

  if (!booking) return null;

  const totalTickets = (booking.tickets?.adult || 0) + 
                       (booking.tickets?.student || 0) + 
                       (booking.tickets?.child || 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    addToast('Preparing your offline digital pass...', 'info');
    setTimeout(() => {
      // Create a print/save trigger
      window.print();
      addToast('Digital pass downloaded successfully!', 'success');
    }, 400);
  };

  return (
    <div className={`ticket-wrapper ${isCompact ? 'compact' : ''}`} ref={ticketRef}>
      {/* Decorative Brand Header */}
      <div className="ticket-top-ribbon">
        <div className="ribbon-brand">
          <Landmark size={18} className="gold-accent" />
          <div className="ribbon-title-wrap">
            <span className="ribbon-aurum">AURUM</span>
            <span className="ribbon-sep">•</span>
            <span className="ribbon-sub">Museum Ticket</span>
          </div>
        </div>
        <div className="ribbon-badge">
          <ShieldCheck size={14} />
          <span>VERIFIED PASS</span>
        </div>
      </div>

      <div className="ticket-main-grid">
        {/* Left / Info Section */}
        <div className="ticket-info-panel">
          <div className="ticket-header-group">
            <span className="ticket-id-tag">Booking ID: {booking.id}</span>
            <h2 className="ticket-museum-name">{booking.museumName}</h2>
            <div className="ticket-loc-text">
              <MapPin size={14} />
              <span>{booking.museumLocation || 'Main Wing Gallery'}</span>
            </div>
          </div>

          <div className="ticket-details-grid">
            <div className="ticket-detail-item">
              <span className="ticket-label">DATE</span>
              <div className="ticket-val-row">
                <Calendar size={16} />
                <span className="ticket-val font-semibold">{booking.visitDate}</span>
              </div>
            </div>

            <div className="ticket-detail-item">
              <span className="ticket-label">TIME</span>
              <div className="ticket-val-row">
                <Clock size={16} />
                <span className="ticket-val font-semibold">{booking.timeSlot}</span>
              </div>
            </div>

            <div className="ticket-detail-item">
              <span className="ticket-label">VISITORS</span>
              <div className="ticket-val font-semibold">
                {totalTickets} {totalTickets === 1 ? 'Visitor' : 'Visitors'}
              </div>
              <div className="ticket-types-list mt-1">
                {booking.tickets?.adult > 0 && (
                  <span className="type-chip">Adult: {booking.tickets.adult}</span>
                )}
                {booking.tickets?.student > 0 && (
                  <span className="type-chip">Student: {booking.tickets.student}</span>
                )}
                {booking.tickets?.child > 0 && (
                  <span className="type-chip">Child: {booking.tickets.child}</span>
                )}
              </div>
            </div>

            <div className="ticket-detail-item">
              <span className="ticket-label">BOOKING ID</span>
              <div className="ticket-val font-mono font-medium">{booking.id}</div>
              <span className="ticket-subval">{booking.customer?.fullName || booking.customer?.email}</span>
            </div>
          </div>

          {booking.addOns && booking.addOns.length > 0 && (
            <div className="ticket-addons-row">
              <span className="ticket-label">INCLUDED ADD-ONS:</span>
              <span className="addons-text">{booking.addOns.join(', ')}</span>
            </div>
          )}

          <div className="ticket-footer-strip">
            <div className={`ticket-status-pill status-${booking.status?.toLowerCase() || 'upcoming'}`}>
              <CheckCircle size={14} />
              <span>{booking.status?.toUpperCase() || 'CONFIRMED'}</span>
            </div>
            <div className="ticket-price-total">
              <span className="ticket-label">TOTAL PAID:</span>
              <span className="ticket-amount">${booking.totalAmount} USD</span>
            </div>
          </div>
        </div>

        {/* Perforation Divider */}
        <div className="ticket-perforation">
          <div className="perf-circle top" />
          <div className="perf-line" />
          <div className="perf-circle bottom" />
        </div>

        {/* Right / QR Code & Stub Section */}
        <div className="ticket-qr-panel">
          <div className="qr-box-wrapper">
            <QRCode value={`${booking.id}|${booking.museumId}|${booking.visitDate}|${booking.timeSlot}`} size={140} />
          </div>
          <div className="qr-scan-text">
            <span>SCAN AT TURNSTILE / GATE</span>
          </div>
          <div className="ticket-barcode-simulation">
            <div className="barcode-bars" />
            <span className="barcode-number">*{booking.id.replace(/-/g, '')}*</span>
          </div>
        </div>
      </div>

      {/* Action buttons (only in non-compact / printable view) */}
      {!isCompact && (
        <div className="ticket-actions-bar no-print">
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={handleDownload}
          >
            <Download size={15} />
            <span>Download Ticket</span>
          </button>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={handlePrint}
          >
            <Printer size={15} />
            <span>Print Ticket</span>
          </button>
        </div>
      )}
    </div>
  );
}
