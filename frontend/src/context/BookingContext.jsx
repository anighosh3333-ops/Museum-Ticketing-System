import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_MUSEUMS, INITIAL_BOOKINGS } from '../data/mockData';
import { adaptMuseum } from '../utils/museumAdapter';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../api';

const BookingContext = createContext(null);

// Helper to reliably match a museum by either numeric ID (1) or string ID ('mus-1')
export function matchMuseum(museumList, searchId) {
  if (!museumList || museumList.length === 0) return null;
  if (!searchId) return museumList[0];
  const targetStr = String(searchId);
  const targetNum = parseInt(targetStr.replace(/\D/g, ''), 10);

  return museumList.find(m => {
    if (m.id === searchId || String(m.id) === targetStr) return true;
    if (m.rawId === searchId || String(m.rawId) === targetStr) return true;
    const mNum = parseInt(String(m.id).replace(/\D/g, ''), 10);
    return !isNaN(mNum) && !isNaN(targetNum) && mNum === targetNum;
  }) || museumList[0];
}

export function BookingProvider({ children }) {
  const { user, token } = useAuth();

  // Museums state with localStorage and mockData fallback
  const [museums, setMuseums] = useState(() => {
    try {
      const saved = localStorage.getItem('aurum_museums');
      return saved ? JSON.parse(saved) : INITIAL_MUSEUMS.map(adaptMuseum);
    } catch {
      return INITIAL_MUSEUMS.map(adaptMuseum);
    }
  });

  // Bookings state with localStorage fallback
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('aurum_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Current active draft for booking flow
  const [bookingDraft, setBookingDraft] = useState({
    museumId: 1,
    exhibitionId: '',
    visitDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Day after tomorrow
    timeSlot: '11:00 AM',
    tickets: {
      adult: 1,
      student: 0,
      child: 0
    },
    addOns: [],
    promoCode: '',
    discountPercent: 0,
    customer: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '+33 6 42 19 88 04',
      specialRequests: ''
    }
  });

  // Update customer in draft when logged in user changes
  useEffect(() => {
    if (user) {
      setBookingDraft(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          fullName: user.name || prev.customer.fullName,
          email: user.email || prev.customer.email
        }
      }));
    }
  }, [user]);

  // Synchronize museums from backend API on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/museums`)
      .then(res => res.json())
      .then(json => {
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const adapted = json.data.map(adaptMuseum);
          setMuseums(adapted);
        }
      })
      .catch(err => {
        console.warn('Backend museums sync skipped:', err.message);
      });
  }, []);

  // Synchronize bookings from backend API based on user role and auth token
  const refreshBookings = useCallback(async () => {
    try {
      const authToken = token || localStorage.getItem('aurum_token');
      if (!authToken) {
        return;
      }

      const savedUser = user || JSON.parse(localStorage.getItem('aurum_user') || 'null');
      const isAdmin = savedUser && (savedUser.role === 'admin' || savedUser.role === 'Curator Admin');
      
      const endpoint = isAdmin ? `${API_BASE_URL}/bookings` : `${API_BASE_URL}/bookings/my`;

      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data)) {
          setBookings(json.data);
        }
      }
    } catch (err) {
      console.warn('Backend bookings sync skipped:', err.message);
    }
  }, [token, user]);

  useEffect(() => {
    if (token) {
      refreshBookings();
    } else {
      setBookings([]);
    }
  }, [token, refreshBookings]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('aurum_museums', JSON.stringify(museums));
  }, [museums]);

  useEffect(() => {
    localStorage.setItem('aurum_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Update draft fields
  const updateDraft = (updates) => {
    setBookingDraft(prev => {
      let next = {
        ...prev,
        ...updates
      };

      // If museum changes, ensure the selected time slot belongs to the target museum
      if (updates.museumId && updates.museumId !== prev.museumId) {
        const targetMuseum = matchMuseum(museums, updates.museumId) || museums[0];
        const validSlots = targetMuseum?.timeSlots || [];
        if (validSlots.length > 0 && (!updates.timeSlot || !validSlots.includes(updates.timeSlot))) {
          if (!validSlots.includes(prev.timeSlot)) {
            next.timeSlot = validSlots[0];
          }
        }
      }

      return next;
    });
  };

  const updateCustomer = (customerUpdates) => {
    setBookingDraft(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        ...customerUpdates
      }
    }));
  };

  const updateTicketCount = (type, delta) => {
    setBookingDraft(prev => {
      const current = prev.tickets[type] || 0;
      const next = Math.max(0, current + delta);
      return {
        ...prev,
        tickets: {
          ...prev.tickets,
          [type]: next
        }
      };
    });
  };

  const toggleAddOn = (addonName) => {
    setBookingDraft(prev => {
      const exists = prev.addOns.includes(addonName);
      return {
        ...prev,
        addOns: exists 
          ? prev.addOns.filter(a => a !== addonName)
          : [...prev.addOns, addonName]
      };
    });
  };

  const applyPromo = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'HERITAGE20' || clean === 'MUSEUM20') {
      updateDraft({ promoCode: clean, discountPercent: 20 });
      return { success: true, message: '20% Heritage discount applied!' };
    } else if (clean === 'STUDENT10') {
      updateDraft({ promoCode: clean, discountPercent: 10 });
      return { success: true, message: '10% Cultural discount applied!' };
    }
    return { success: false, message: 'Invalid promo code. Try "HERITAGE20"' };
  };

  // Calculate pricing breakdown
  const calculatePricing = (draft = bookingDraft) => {
    const museum = matchMuseum(museums, draft.museumId) || museums[0];
    const prices = museum?.prices || { adult: museum?.ticket_price || 25, student: 15, child: 10 };

    const adultTotal = (draft.tickets.adult || 0) * prices.adult;
    const studentTotal = (draft.tickets.student || 0) * prices.student;
    const childTotal = (draft.tickets.child || 0) * prices.child;
    const addOnTotal = (draft.addOns || []).length * 8; // $8 per add-on

    const subtotal = adultTotal + studentTotal + childTotal + addOnTotal;
    const discountAmount = Math.round((subtotal * (draft.discountPercent || 0)) / 100);
    const conservationFee = subtotal > 0 ? Math.round((subtotal - discountAmount) * 0.05) : 0; // 5% conservation fee
    const totalAmount = Math.max(0, subtotal - discountAmount + conservationFee);
    const totalTickets = (draft.tickets.adult || 0) + (draft.tickets.student || 0) + (draft.tickets.child || 0);

    return {
      adultTotal,
      studentTotal,
      childTotal,
      addOnTotal,
      subtotal,
      discountAmount,
      conservationFee,
      totalAmount,
      totalTickets,
      museum
    };
  };

  // Complete and confirm a booking via backend API POST /api/bookings
  const confirmBooking = async () => {
    const pricing = calculatePricing();
    const museum = pricing.museum;

    const numericMuseumId = typeof museum?.id === 'number'
      ? museum.id
      : parseInt(String(museum?.id || bookingDraft.museumId).replace(/\D/g, ''), 10) || 1;

    const payload = {
      museum_id: numericMuseumId,
      visit_date: bookingDraft.visitDate,
      time_slot: bookingDraft.timeSlot,
      adult_count: bookingDraft.tickets?.adult || 0,
      student_count: bookingDraft.tickets?.student || 0,
      child_count: bookingDraft.tickets?.child || 0,
      promo_code: bookingDraft.promoCode,
      addOns: bookingDraft.addOns,
      customer: { ...bookingDraft.customer }
    };

    try {
      const authToken = token || localStorage.getItem('aurum_token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Booking failed with status ${response.status}`);
      }

      const json = await response.json();
      if (!json.success || !json.data) {
        throw new Error(json.message || 'Failed to complete booking.');
      }

      const apiData = json.data;
      const createdBooking = {
        ...apiData,
        id: apiData.booking_code || apiData.id,
        bookingCode: apiData.booking_code,
        bookingId: apiData.booking_id,
        museumId: apiData.museumId || museum?.id,
        museumName: apiData.museumName || museum?.name,
        museumLocation: apiData.museumLocation || `${museum?.city}, ${museum?.country || ''}`,
        museumImage: apiData.museumImage || museum?.image,
        visitDate: apiData.visitDate || bookingDraft.visitDate,
        timeSlot: apiData.timeSlot || bookingDraft.timeSlot,
        status: 'Upcoming',
        bookingDate: apiData.bookingDate || new Date().toISOString().split('T')[0],
        tickets: apiData.tickets || { ...bookingDraft.tickets },
        addOns: [...bookingDraft.addOns],
        totalAmount: apiData.totalAmount ?? apiData.total_amount ?? pricing.totalAmount,
        customer: { ...bookingDraft.customer }
      };

      setBookings(prev => [createdBooking, ...prev]);
      return createdBooking;
    } catch (apiErr) {
      console.warn('API booking failed, using local offline reservation fallback:', apiErr.message);

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const newBookingId = `AUR-${randomSuffix}-${randomHex}`;

      const fallbackBooking = {
        id: newBookingId,
        booking_code: newBookingId,
        bookingCode: newBookingId,
        museumId: museum?.id,
        museumName: museum?.name,
        museumLocation: `${museum?.city}, ${museum?.country || ''}`,
        museumImage: museum?.image,
        visitDate: bookingDraft.visitDate,
        timeSlot: bookingDraft.timeSlot,
        status: 'Upcoming',
        bookingDate: new Date().toISOString().split('T')[0],
        tickets: { ...bookingDraft.tickets },
        addOns: [...bookingDraft.addOns],
        totalAmount: pricing.totalAmount,
        customer: { ...bookingDraft.customer }
      };

      setBookings(prev => [fallbackBooking, ...prev]);
      return fallbackBooking;
    }
  };

  const cancelBooking = (bookingId) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId || b.booking_code === bookingId) ? { ...b, status: 'Cancelled' } : b)
    );
  };

  const getBookingById = (bookingId) => {
    if (!bookingId) return null;
    const bStr = String(bookingId);
    return bookings.find(b => 
      b.id === bookingId || 
      b.booking_code === bookingId || 
      String(b.id) === bStr || 
      String(b.booking_code) === bStr || 
      String(b.booking_id) === bStr
    );
  };

  const getMuseumById = (museumId) => {
    return matchMuseum(museums, museumId) || museums[0];
  };

  // Admin Actions
  const addMuseum = (newMuseum) => {
    const id = `mus-${Date.now()}`;
    const museumObj = {
      id,
      ...newMuseum,
      rating: 4.8,
      reviewsCount: 1,
      gallery: newMuseum.gallery || [newMuseum.image],
      exhibitions: newMuseum.exhibitions || [],
      amenities: newMuseum.amenities || ['Audio Guides', 'Wheelchair Accessible'],
      timeSlots: newMuseum.timeSlots || ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM']
    };
    setMuseums(prev => [museumObj, ...prev]);
    return museumObj;
  };

  const updateMuseum = (updatedMuseum) => {
    setMuseums(prev => prev.map(m => m.id === updatedMuseum.id ? updatedMuseum : m));
  };

  const deleteMuseum = (museumId) => {
    setMuseums(prev => prev.filter(m => m.id !== museumId));
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => (b.id === bookingId || b.booking_code === bookingId) ? { ...b, status: newStatus } : b));
  };

  const resetAllData = () => {
    setMuseums(INITIAL_MUSEUMS.map(adaptMuseum));
    setBookings(INITIAL_BOOKINGS);
    localStorage.removeItem('aurum_museums');
    localStorage.removeItem('aurum_bookings');
  };

  return (
    <BookingContext.Provider value={{
      museums,
      bookings,
      bookingDraft,
      updateDraft,
      updateCustomer,
      updateTicketCount,
      toggleAddOn,
      applyPromo,
      calculatePricing,
      confirmBooking,
      cancelBooking,
      getBookingById,
      getMuseumById,
      refreshBookings,
      addMuseum,
      updateMuseum,
      deleteMuseum,
      updateBookingStatus,
      resetAllData
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
