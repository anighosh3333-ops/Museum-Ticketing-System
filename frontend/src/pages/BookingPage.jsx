import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Landmark, 
  Calendar, 
  Clock, 
  Ticket, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Tag, 
  Sparkles, 
  Check, 
  AlertCircle,
  Headphones,
  Glasses
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryMuseumId = searchParams.get('museumId');

  const { 
    museums, 
    bookingDraft, 
    updateDraft, 
    updateCustomer, 
    updateTicketCount, 
    toggleAddOn, 
    applyPromo, 
    calculatePricing, 
    confirmBooking 
  } = useBooking();
  const { addToast } = useToast();

  React.useEffect(() => {
    if (queryMuseumId && queryMuseumId !== bookingDraft.museumId) {
      updateDraft({ museumId: queryMuseumId });
    }
  }, [queryMuseumId]);

  const [promoInput, setPromoInput] = useState(bookingDraft.promoCode || '');
  const [promoFeedback, setPromoFeedback] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const pricing = calculatePricing();
  const selectedMuseum = pricing.museum;
  const prices = selectedMuseum?.prices || { adult: 25, student: 15, child: 10 };

  const handleMuseumChange = (e) => {
    const newId = e.target.value;
    const targetMuseum = museums.find(m => m.id === newId) || museums[0];
    const validSlots = targetMuseum?.timeSlots || [];
    const validSlot = validSlots.includes(bookingDraft.timeSlot) ? bookingDraft.timeSlot : (validSlots[0] || '10:00 AM');
    updateDraft({ museumId: newId, timeSlot: validSlot });
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromo(promoInput);
    setPromoFeedback(res);
    if (res.success) {
      addToast(res.message, 'success');
    } else {
      addToast(res.message, 'warning');
    }
  };

  const validate = () => {
    const errors = {};
    if (pricing.totalTickets <= 0) {
      errors.tickets = 'Please select at least one ticket (Adult, Student, or Child).';
    }
    if (!bookingDraft.visitDate) {
      errors.date = 'Please pick a valid visit date.';
    }
    if (!bookingDraft.timeSlot) {
      errors.timeSlot = 'Please select a preferred entry time slot.';
    }
    if (!bookingDraft.customer?.fullName?.trim()) {
      errors.fullName = 'Full Name is required for pass registration.';
    }
    if (!bookingDraft.customer?.email?.trim() || !bookingDraft.customer.email.includes('@')) {
      errors.email = 'A valid email address is required for your reservation record.';
    }
    if (!bookingDraft.customer?.phone?.trim()) {
      errors.phone = 'Phone number is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please complete all required fields before confirming.', 'warning');
      return;
    }

    setIsProcessing(true);
    addToast('Securing your reservation slot and issuing QR code...', 'info');

    try {
      const newBooking = await confirmBooking();
      setIsProcessing(false);
      addToast('Pass confirmed! Safe travels to your cultural destination.', 'success');
      const targetId = newBooking.booking_code || newBooking.id;
      navigate(`/confirmation/${targetId}`);
    } catch (err) {
      setIsProcessing(false);
      addToast(err.message || 'Failed to complete booking. Please try again.', 'error');
    }
  };

  const currentStep = React.useMemo(() => {
    if (!bookingDraft.museumId) return 1;
    if (!bookingDraft.visitDate || !bookingDraft.timeSlot) return 2;
    if (pricing.totalTickets <= 0) return 3;
    if (!bookingDraft.customer?.fullName?.trim() || !bookingDraft.customer?.email?.trim()) return 4;
    return 5;
  }, [bookingDraft, pricing.totalTickets]);

  return (
    <div className="booking-page-root">
      {/* Banner */}
      <div className="page-header-banner">
        <div className="page-header-container">
          <div className="page-header-badge">
            <Ticket size={14} className="accent-gold-text" />
            <span>RESERVATION CONSOLE</span>
          </div>
          <h1 className="page-header-title">Reserve Museum Entry Pass</h1>
          <p className="page-header-desc">
            Complete your reservation in a few simple steps and get an in-app QR pass.
          </p>
        </div>
      </div>

      <div className="section-container">
        {/* Clean Multi-Step Visual Indicator */}
        <div className="booking-stepper-bar">
          <div className={`stepper-step ${currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : ''}`}>
            <span className="step-circle">1</span>
            <span className="step-label">Museum</span>
          </div>
          <span className="stepper-arrow">→</span>

          <div className={`stepper-step ${currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : ''}`}>
            <span className="step-circle">2</span>
            <span className="step-label">Date & Time</span>
          </div>
          <span className="stepper-arrow">→</span>

          <div className={`stepper-step ${currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : ''}`}>
            <span className="step-circle">3</span>
            <span className="step-label">Tickets</span>
          </div>
          <span className="stepper-arrow">→</span>

          <div className={`stepper-step ${currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : ''}`}>
            <span className="step-circle">4</span>
            <span className="step-label">Details</span>
          </div>
          <span className="stepper-arrow">→</span>

          <div className={`stepper-step ${currentStep === 5 ? 'current' : ''}`}>
            <span className="step-circle">5</span>
            <span className="step-label">Payment</span>
          </div>
        </div>

        <form onSubmit={handleConfirm} className="booking-form-grid">
          {/* Left Column: Booking Options */}
          <div className="booking-steps-column">
            {/* Step 1: Select Museum */}
            <div className="booking-card-step">
              <div className="step-badge-header">
                <div className="step-num">1</div>
                <div>
                  <h3 className="step-title">Select Cultural Landmark</h3>
                  <p className="step-desc">Choose which museum gallery you plan to explore.</p>
                </div>
              </div>

              <div className="form-group mt-4">
                <div className="input-with-icon">
                  <Landmark size={18} className="input-icon" />
                  <select 
                    value={bookingDraft.museumId} 
                    onChange={handleMuseumChange}
                    className="form-select"
                  >
                    {museums.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.city}, {m.country} (${m.basePrice})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedMuseum && (
                <div className="selected-museum-pill">
                  <img src={selectedMuseum.image} alt={selectedMuseum.name} className="pill-thumb" />
                  <div className="pill-info">
                    <span className="pill-name">{selectedMuseum.name}</span>
                    <span className="pill-hours">{selectedMuseum.openingHours}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Date & Time */}
            <div className="booking-card-step">
              <div className="step-badge-header">
                <div className="step-num">2</div>
                <div>
                  <h3 className="step-title">Visit Date & Entry Window</h3>
                  <p className="step-desc">Pick your scheduled admission date and reserved entry time slot.</p>
                </div>
              </div>

              <div className="date-time-grid mt-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="booking-date">
                    <Calendar size={14} className="accent-gold-text" />
                    <span>Select Date</span>
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDraft.visitDate}
                    onChange={(e) => updateDraft({ visitDate: e.target.value })}
                    className={`form-input ${formErrors.date ? 'input-error' : ''}`}
                  />
                  {formErrors.date && <span className="field-error-text">{formErrors.date}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Clock size={14} className="accent-gold-text" />
                    <span>Select Time Slot</span>
                  </label>
                  <div className="booking-slots-picker">
                    {selectedMuseum?.timeSlots?.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        className={`slot-pill ${bookingDraft.timeSlot === slot ? 'active' : ''}`}
                        onClick={() => updateDraft({ timeSlot: slot })}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {formErrors.timeSlot && <span className="field-error-text">{formErrors.timeSlot}</span>}
                </div>
              </div>
            </div>

            {/* Step 3: Ticket Quantities */}
            <div className="booking-card-step">
              <div className="step-badge-header">
                <div className="step-num">3</div>
                <div>
                  <h3 className="step-title">Select Admission Quantities</h3>
                  <p className="step-desc">Customize quantities by category for everyone in your party.</p>
                </div>
              </div>

              {formErrors.tickets && (
                <div className="validation-alert mt-4">
                  <AlertCircle size={16} />
                  <span>{formErrors.tickets}</span>
                </div>
              )}

              <div className="tickets-stepper-list mt-4">
                {/* Adult */}
                <div className="stepper-row">
                  <div className="stepper-details">
                    <div className="stepper-title">Adult Pass</div>
                    <span className="stepper-price">${prices.adult} USD</span>
                    <span className="stepper-note">General admission for visitors aged 18+</span>
                  </div>
                  <div className="counter-controls">
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => updateTicketCount('adult', -1)}
                      disabled={(bookingDraft.tickets.adult || 0) <= 0}
                    >
                      -
                    </button>
                    <span className="counter-val">{bookingDraft.tickets.adult || 0}</span>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => updateTicketCount('adult', 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Student */}
                <div className="stepper-row">
                  <div className="stepper-details">
                    <div className="stepper-title">Student Pass</div>
                    <span className="stepper-price">${prices.student} USD</span>
                    <span className="stepper-note">Requires valid university or high school ID card</span>
                  </div>
                  <div className="counter-controls">
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => updateTicketCount('student', -1)}
                      disabled={(bookingDraft.tickets.student || 0) <= 0}
                    >
                      -
                    </button>
                    <span className="counter-val">{bookingDraft.tickets.student || 0}</span>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => updateTicketCount('student', 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Child */}
                <div className="stepper-row">
                  <div className="stepper-details">
                    <div className="stepper-title">Child Pass (Under 12)</div>
                    <span className="stepper-price">{prices.child === 0 ? 'FREE ($0)' : `$${prices.child} USD`}</span>
                    <span className="stepper-note">Must be accompanied by adult ticket holder</span>
                  </div>
                  <div className="counter-controls">
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => updateTicketCount('child', -1)}
                      disabled={(bookingDraft.tickets.child || 0) <= 0}
                    >
                      -
                    </button>
                    <span className="counter-val">{bookingDraft.tickets.child || 0}</span>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => updateTicketCount('child', 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional Add-Ons */}
              <div className="addons-section mt-6">
                <h4 className="addons-title">
                  <Sparkles size={16} className="accent-gold-text" />
                  <span>Enhance Your Visit (Optional Add-ons)</span>
                </h4>
                <div className="addons-grid">
                  <div 
                    className={`addon-card ${bookingDraft.addOns.includes('VIP Audio Guide') ? 'selected' : ''}`}
                    onClick={() => toggleAddOn('VIP Audio Guide')}
                  >
                    <div className="addon-icon">
                      <Headphones size={20} />
                    </div>
                    <div className="addon-info">
                      <div className="addon-name">VIP Multilingual Audio Guide</div>
                      <div className="addon-desc">Curator commentary in 12 languages</div>
                    </div>
                    <div className="addon-price">+$8</div>
                  </div>

                  <div 
                    className={`addon-card ${bookingDraft.addOns.includes('VR Gallery Experience') ? 'selected' : ''}`}
                    onClick={() => toggleAddOn('VR Gallery Experience')}
                  >
                    <div className="addon-icon">
                      <Glasses size={20} />
                    </div>
                    <div className="addon-info">
                      <div className="addon-name">VR Gallery Reconstruction</div>
                      <div className="addon-desc">15-minute immersive historical simulation</div>
                    </div>
                    <div className="addon-price">+$8</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Customer Details */}
            <div className="booking-card-step">
              <div className="step-badge-header">
                <div className="step-num">4</div>
                <div>
                  <h3 className="step-title">Pass Holder Information</h3>
                  <p className="step-desc">Enter the visitor information where the digital QR pass will be delivered.</p>
                </div>
              </div>

              <div className="customer-form-grid mt-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-fullname">Full Name *</label>
                  <div className="input-with-icon">
                    <User size={16} className="input-icon" />
                    <input
                      id="cust-fullname"
                      type="text"
                      className={`form-input ${formErrors.fullName ? 'input-error' : ''}`}
                      placeholder="e.g. Eleanor Vance"
                      value={bookingDraft.customer?.fullName || ''}
                      onChange={(e) => updateCustomer({ fullName: e.target.value })}
                      required
                    />
                  </div>
                  {formErrors.fullName && <span className="field-error-text">{formErrors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cust-email">Email Address *</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="input-icon" />
                    <input
                      id="cust-email"
                      type="email"
                      className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                      placeholder="you@domain.com"
                      value={bookingDraft.customer?.email || ''}
                      onChange={(e) => updateCustomer({ email: e.target.value })}
                      required
                    />
                  </div>
                  {formErrors.email && <span className="field-error-text">{formErrors.email}</span>}
                </div>

                <div className="form-group full-width">
                  <label className="form-label" htmlFor="cust-phone">Mobile Phone *</label>
                  <div className="input-with-icon">
                    <Phone size={16} className="input-icon" />
                    <input
                      id="cust-phone"
                      type="tel"
                      className={`form-input ${formErrors.phone ? 'input-error' : ''}`}
                      placeholder="+1 (555) 019-2834"
                      value={bookingDraft.customer?.phone || ''}
                      onChange={(e) => updateCustomer({ phone: e.target.value })}
                      required
                    />
                  </div>
                  {formErrors.phone && <span className="field-error-text">{formErrors.phone}</span>}
                </div>

                <div className="form-group full-width">
                  <label className="form-label" htmlFor="cust-requests">Special Accessibility / Group Requests</label>
                  <textarea
                    id="cust-requests"
                    rows={2}
                    className="form-textarea"
                    placeholder="e.g. Wheelchair assistance, language preferences, student group notes..."
                    value={bookingDraft.customer?.specialRequests || ''}
                    onChange={(e) => updateCustomer({ specialRequests: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Confirmation Sticky Box */}
          <div className="booking-summary-column">
            <div className="summary-sticky-card">
              <h3 className="summary-title">Booking Summary</h3>

              {/* Museum Preview */}
              <div className="summary-museum-box">
                <img 
                  src={selectedMuseum?.image} 
                  alt={selectedMuseum?.name} 
                  className="summary-museum-img" 
                />
                <div>
                  <h4 className="summary-museum-name">{selectedMuseum?.name}</h4>
                  <span className="summary-museum-loc">{selectedMuseum?.city}, {selectedMuseum?.country}</span>
                </div>
              </div>

              {/* Schedule snapshot */}
              <div className="summary-schedule-rows">
                <div className="summary-row">
                  <span className="row-label">Scheduled Date:</span>
                  <span className="row-value">{bookingDraft.visitDate}</span>
                </div>
                <div className="summary-row">
                  <span className="row-label">Entry Slot:</span>
                  <span className="row-value">{bookingDraft.timeSlot}</span>
                </div>
                <div className="summary-row">
                  <span className="row-label">Total Passes:</span>
                  <span className="row-value">{pricing.totalTickets} person(s)</span>
                </div>
              </div>

              <div className="summary-divider" />

              {/* Ticket Breakdown */}
              <div className="summary-price-breakdown">
                {bookingDraft.tickets.adult > 0 && (
                  <div className="summary-row">
                    <span className="row-label">Adult × {bookingDraft.tickets.adult}</span>
                    <span className="row-value">${pricing.adultTotal}</span>
                  </div>
                )}
                {bookingDraft.tickets.student > 0 && (
                  <div className="summary-row">
                    <span className="row-label">Student × {bookingDraft.tickets.student}</span>
                    <span className="row-value">${pricing.studentTotal}</span>
                  </div>
                )}
                {bookingDraft.tickets.child > 0 && (
                  <div className="summary-row">
                    <span className="row-label">Child × {bookingDraft.tickets.child}</span>
                    <span className="row-value">${pricing.childTotal}</span>
                  </div>
                )}
                {pricing.addOnTotal > 0 && (
                  <div className="summary-row">
                    <span className="row-label">Add-ons ({bookingDraft.addOns.length})</span>
                    <span className="row-value">+${pricing.addOnTotal}</span>
                  </div>
                )}

                <div className="summary-row text-xs text-muted">
                  <span className="row-label">Subtotal:</span>
                  <span className="row-value">${pricing.subtotal}</span>
                </div>

                {pricing.discountAmount > 0 && (
                  <div className="summary-row text-gold font-medium">
                    <span className="row-label">Promo Discount ({bookingDraft.discountPercent}%):</span>
                    <span className="row-value">-${pricing.discountAmount}</span>
                  </div>
                )}

                <div className="summary-row text-xs text-muted">
                  <span className="row-label">Heritage Conservation (5%):</span>
                  <span className="row-value">+${pricing.conservationFee}</span>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="summary-promo-box">
                <div className="promo-input-group">
                  <Tag size={15} className="promo-icon" />
                  <input
                    type="text"
                    placeholder="Promo code (HERITAGE20)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="promo-input"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    onClick={handleApplyPromo}
                  >
                    Apply
                  </button>
                </div>
                {promoFeedback && (
                  <span className={`promo-feedback ${promoFeedback.success ? 'success' : 'error'}`}>
                    {promoFeedback.message}
                  </span>
                )}
              </div>

              <div className="summary-divider" />

              {/* Total Row */}
              <div className="summary-grand-total">
              <span className="grand-label">Booking Total:</span>
                <span className="grand-price">${pricing.totalAmount} USD</span>
              </div>

              {/* Confirm CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="btn btn-primary btn-full btn-lg confirm-booking-btn"
              >
                {isProcessing ? (
                  <span>Generating Secure Passes...</span>
                ) : (
                  <>
                    <Ticket size={18} />
                    <span>Confirm Reservation & Get Pass</span>
                  </>
                )}
              </button>

              <div className="summary-assurance">
                <ShieldCheck size={16} className="text-amber" />
                <span>No payment is collected by this app.</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
