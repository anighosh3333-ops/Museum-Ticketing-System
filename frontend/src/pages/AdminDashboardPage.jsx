import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  DollarSign, 
  Ticket, 
  Landmark, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Eye, 
  X,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../api';

export default function AdminDashboardPage() {
  const { user, token, login } = useAuth();
  const { 
    museums, 
    bookings, 
    addMuseum, 
    updateMuseum, 
    deleteMuseum, 
    updateBookingStatus, 
    resetAllData 
  } = useBooking();
  const { addToast } = useToast();

  const [activeAdminTab, setActiveAdminTab] = useState('overview'); // 'overview', 'museums', 'bookings'
  const [bookingSearch, setBookingSearch] = useState('');
  const [museumModalOpen, setMuseumModalOpen] = useState(false);
  const [editingMuseum, setEditingMuseum] = useState(null);

  // Live SQLite administrative state
  const [dbStats, setDbStats] = useState(null);
  const [dbBookings, setDbBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'Curator Admin';

  // Fetch real statistics and bookings from SQLite admin endpoints
  const fetchDashboardData = useCallback(async () => {
    const authToken = token || localStorage.getItem('aurum_token');
    if (!authToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }),
        fetch(`${API_BASE_URL}/admin/bookings`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
      ]);

      if (!statsRes.ok || !bookingsRes.ok) {
        if (statsRes.status === 403 || bookingsRes.status === 403) {
          throw new Error('Curator administrator credentials required (403 Forbidden).');
        }
        throw new Error('Unable to retrieve administrative records from database.');
      }

      const statsJson = await statsRes.json();
      const bookingsJson = await bookingsRes.json();

      if (statsJson.success && statsJson.data) {
        setDbStats(statsJson.data);
      }
      if (bookingsJson.success && Array.isArray(bookingsJson.data)) {
        setDbBookings(bookingsJson.data);
      }
    } catch (err) {
      console.error('Admin dashboard fetch error:', err);
      setError(err.message || 'Unable to connect to heritage database.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin, fetchDashboardData]);

  // Handle booking status update with backend persistence
  const handleBookingStatusChange = async (bookingId, newStatus) => {
    setDbBookings(prev => prev.map(b => (b.id === bookingId || b.booking_code === bookingId || b.booking_id === bookingId) ? { ...b, status: newStatus } : b));
    updateBookingStatus(bookingId, newStatus);
    addToast(`Reservation #${bookingId} marked as ${newStatus}`, 'info');

    const authToken = token || localStorage.getItem('aurum_token');
    if (!authToken) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Refresh live stats from SQLite
        const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          if (statsJson.success && statsJson.data) {
            setDbStats(statsJson.data);
          }
        }
      }
    } catch (err) {
      console.warn('Backend booking status update error:', err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="section-container text-center py-24">
        <div className="empty-state-box">
          <ShieldCheck size={48} className="empty-state-icon" />
          <h2 className="empty-state-title">Curator Access Required</h2>
          <p className="empty-state-desc">
            The Operations Dashboard is restricted to authorized museum curatorial staff. Please sign in with curator administrator credentials to access.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={async () => {
                try {
                  await login('admin@aurum.com', 'Admin@123');
                  addToast('Authenticated as Chief Curator & Administrator', 'success');
                } catch (err) {
                  addToast(err.message || 'Login failed', 'error');
                }
              }}
            >
              <ShieldCheck size={15} />
              <span>Sign In as Curator Demo</span>
            </button>
            <Link to="/" className="btn btn-secondary btn-sm">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Museum Form State
  const [museumForm, setMuseumForm] = useState({
    name: '',
    city: '',
    country: '',
    address: '',
    category: 'Art & Antiquities',
    basePrice: 25,
    openingHours: '09:00 AM - 06:00 PM',
    closedDays: 'None',
    tagline: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80'
  });

  // Authoritative data from SQLite
  const allBookings = dbBookings.length > 0 ? dbBookings : bookings;
  const totalBookingsCount = dbStats ? dbStats.totalBookings : allBookings.length;
  const totalRevenue = dbStats ? dbStats.totalRevenue : allBookings.reduce((sum, b) => b.status !== 'Cancelled' ? sum + (b.totalAmount || b.total_amount || 0) : sum, 0);
  const activeMuseumsCount = dbStats ? dbStats.totalMuseums : museums.length;
  const upcomingBookingsCount = dbStats ? dbStats.upcomingBookings : allBookings.filter(b => b.status === 'Upcoming' || b.status === 'confirmed').length;
  const totalPatronsCount = dbStats?.totalPatrons !== undefined 
    ? dbStats.totalPatrons 
    : allBookings.reduce((sum, b) => {
        const adult = b.tickets?.adult || b.adult_count || 0;
        const student = b.tickets?.student || b.student_count || 0;
        const child = b.tickets?.child || b.child_count || 0;
        return sum + adult + student + child;
      }, 0);

  const openAddMuseumModal = () => {
    setEditingMuseum(null);
    setMuseumForm({
      name: '',
      city: '',
      country: '',
      address: '',
      category: 'Art & Antiquities',
      basePrice: 25,
      openingHours: '09:00 AM - 06:00 PM',
      closedDays: 'None',
      tagline: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1544476915-ed1370594142?auto=format&fit=crop&w=1200&q=80'
    });
    setMuseumModalOpen(true);
  };

  const openEditMuseumModal = (museum) => {
    setEditingMuseum(museum);
    setMuseumForm({
      name: museum.name,
      city: museum.city,
      country: museum.country,
      address: museum.address || '',
      category: museum.category,
      basePrice: museum.basePrice,
      openingHours: museum.openingHours,
      closedDays: museum.closedDays || 'None',
      tagline: museum.tagline || '',
      description: museum.description || '',
      image: museum.image
    });
    setMuseumModalOpen(true);
  };

  const handleSaveMuseum = (e) => {
    e.preventDefault();
    if (!museumForm.name || !museumForm.city || !museumForm.country) {
      addToast('Please fill in required fields.', 'warning');
      return;
    }

    if (editingMuseum) {
      updateMuseum({
        ...editingMuseum,
        ...museumForm,
        basePrice: Number(museumForm.basePrice),
        prices: {
          adult: Number(museumForm.basePrice),
          student: Math.round(Number(museumForm.basePrice) * 0.7),
          child: Math.round(Number(museumForm.basePrice) * 0.4)
        }
      });
      addToast(`Updated museum: ${museumForm.name}`, 'success');
    } else {
      addMuseum({
        ...museumForm,
        basePrice: Number(museumForm.basePrice),
        prices: {
          adult: Number(museumForm.basePrice),
          student: Math.round(Number(museumForm.basePrice) * 0.7),
          child: Math.round(Number(museumForm.basePrice) * 0.4)
        }
      });
      addToast(`New museum created: ${museumForm.name}`, 'success');
    }
    setMuseumModalOpen(false);
  };

  const handleDeleteMuseum = (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the network?`)) {
      deleteMuseum(id);
      addToast(`Removed museum: ${name}`, 'info');
    }
  };

  const filteredBookings = allBookings.filter(b => {
    if (!bookingSearch.trim()) return true;
    const q = bookingSearch.toLowerCase();
    const bId = String(b.id || b.booking_code || '').toLowerCase();
    const mName = String(b.museumName || b.museum_name || '').toLowerCase();
    const pName = String(b.customer?.fullName || '').toLowerCase();
    const pEmail = String(b.customer?.email || '').toLowerCase();
    return bId.includes(q) || mName.includes(q) || pName.includes(q) || pEmail.includes(q);
  });

  return (
    <div className="admin-page-root">
      {/* Header */}
      <div className="admin-top-banner">
        <div className="admin-container">
          <div className="admin-header-flex">
            <div>
              <div className="admin-badge">
                <ShieldCheck size={14} className="accent-gold-text" />
                <span>CURATOR & EXECUTIVE CONSOLE</span>
              </div>
              <h1 className="admin-title">Heritage Operations Dashboard</h1>
              <p className="admin-subtitle">
                Real-time booking oversight, revenue analytics, and museum registry management.
              </p>
            </div>

            <div className="admin-header-actions">
              <button 
                type="button" 
                className="btn btn-outline btn-sm reset-data-btn"
                title="Refresh operational data from SQLite database"
                onClick={() => {
                  fetchDashboardData();
                  addToast('Refreshed operational records from database.', 'info');
                }}
              >
                <RotateCcw size={14} />
                <span>Refresh Live Data</span>
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={openAddMuseumModal}
              >
                <Plus size={16} />
                <span>Add Museum</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="admin-nav-tabs">
            <button
              type="button"
              className={`admin-tab-btn ${activeAdminTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveAdminTab('overview')}
            >
              Overview & Analytics
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeAdminTab === 'museums' ? 'active' : ''}`}
              onClick={() => setActiveAdminTab('museums')}
            >
              Museum Registry ({activeMuseumsCount})
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeAdminTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveAdminTab('bookings')}
            >
              All Reservations ({allBookings.length})
            </button>
          </div>
        </div>
      </div>

      <div className="admin-container admin-body-content">
        {/* Loading Indicator */}
        {loading && (
          <div className="section-container text-center py-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={36} className="empty-state-icon" style={{ animation: 'spin 1.2s linear infinite', margin: '0 auto 1rem', color: 'var(--accent)' }} />
            <h3 style={{ fontFamily: 'Cinzel, Georgia, serif', color: 'var(--accent)', fontSize: '1.15rem', marginBottom: '0.35rem' }}>
              Retrieving Operational Telemetry...
            </h3>
            <p className="text-muted text-xs">Synchronizing ledger records and statistics from SQLite database.</p>
          </div>
        )}

        {/* Error Indicator */}
        {error && (
          <div style={{ backgroundColor: 'rgba(184, 92, 82, 0.15)', border: '1px solid var(--error)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <AlertCircle size={18} style={{ color: 'var(--error)' }} />
              <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</span>
            </div>
            <button 
              type="button" 
              onClick={fetchDashboardData}
              className="btn btn-secondary btn-xs"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* KPI Stats Grid */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon-circle gold">
              <Ticket size={22} />
            </div>
            <div>
              <span className="stat-label">Total Bookings</span>
              <div className="stat-val">{totalBookingsCount}</div>
              <span className="stat-trend positive">
                <TrendingUp size={12} /> {upcomingBookingsCount} upcoming passes
              </span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon-circle emerald">
              <DollarSign size={22} />
            </div>
            <div>
              <span className="stat-label">Total Revenue</span>
              <div className="stat-val">${totalRevenue.toLocaleString()} USD</div>
              <span className="stat-trend positive">
                <TrendingUp size={12} /> Live SQLite revenue
              </span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon-circle amber">
              <Landmark size={22} />
            </div>
            <div>
              <span className="stat-label">Partner Museums</span>
              <div className="stat-val">{activeMuseumsCount}</div>
              <span className="stat-trend text-muted">Active institutions</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon-circle blue">
              <Users size={22} />
            </div>
            <div>
              <span className="stat-label">Total Patrons Served</span>
              <div className="stat-val">{totalPatronsCount.toLocaleString()}</div>
              <span className="stat-trend positive">
                <TrendingUp size={12} /> Verified pass holders
              </span>
            </div>
          </div>
        </div>

        {/* TAB 1: Overview & Recent Bookings */}
        {activeAdminTab === 'overview' && (
          <div className="admin-section-stack">
            <div className="admin-table-card">
              <div className="table-card-header">
                <div>
                  <h3 className="table-title">Recent Reservations</h3>
                  <p className="table-subtitle">Live stream of incoming museum passes.</p>
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-xs"
                  onClick={() => setActiveAdminTab('bookings')}
                >
                  View All
                </button>
              </div>

              <div className="admin-table-responsive">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Patron</th>
                      <th>Museum</th>
                      <th>Date & Slot</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.slice(0, 5).map(b => (
                      <tr key={b.id || b.booking_code}>
                        <td className="font-mono text-gold text-xs">{b.booking_code || b.id}</td>
                        <td>
                          <div className="font-medium text-white">{b.customer?.fullName || 'Patron Guest'}</div>
                          <div className="text-xs text-muted">{b.customer?.email || 'guest@aurum.org'}</div>
                        </td>
                        <td>{b.museumName || b.museum_name || 'Museum Landmark'}</td>
                        <td>
                          <div>{b.visitDate || b.visit_date}</div>
                          <div className="text-xs text-muted">{b.timeSlot || b.time_slot}</div>
                        </td>
                        <td className="font-semibold text-white">${b.totalAmount ?? b.total_amount}</td>
                        <td>
                          <span className={`status-badge-cell status-${(b.status || 'upcoming').toLowerCase()}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-row-actions">
                            {(b.status === 'Upcoming' || b.status === 'confirmed') && (
                              <button
                                type="button"
                                className="action-icon-btn check"
                                title="Mark as Visited / Used"
                                onClick={() => handleBookingStatusChange(b.booking_code || b.id, 'Completed')}
                              >
                                <CheckCircle size={15} />
                              </button>
                            )}
                            {b.status !== 'Cancelled' && (
                              <button
                                type="button"
                                className="action-icon-btn cancel"
                                title="Cancel pass"
                                onClick={() => handleBookingStatusChange(b.booking_code || b.id, 'Cancelled')}
                              >
                                <XCircle size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allBookings.length === 0 && !loading && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No reservations recorded in the database yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Museum Management Table */}
        {activeAdminTab === 'museums' && (
          <div className="admin-section-stack">
            <div className="admin-table-card">
              <div className="table-card-header">
                <div>
                  <h3 className="table-title">Museum Registry</h3>
                  <p className="table-subtitle">Manage admission rates, opening hours, and institution profiles.</p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={openAddMuseumModal}
                >
                  <Plus size={15} />
                  <span>Add New Museum</span>
                </button>
              </div>

              <div className="admin-table-responsive">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Museum & Image</th>
                      <th>Location</th>
                      <th>Category</th>
                      <th>Base Rate</th>
                      <th>Operating Hours</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {museums.map(m => (
                      <tr key={m.id}>
                        <td>
                          <div className="museum-cell-flex">
                            <img src={m.image} alt={m.name} className="museum-cell-thumb" />
                            <div>
                              <div className="font-semibold text-white">{m.name}</div>
                              <div className="text-xs text-muted">{m.exhibitions?.length || 0} active exhibitions</div>
                            </div>
                          </div>
                        </td>
                        <td>{m.city}, {m.country}</td>
                        <td>
                          <span className="badge badge-dark text-xs">{m.category}</span>
                        </td>
                        <td className="font-semibold text-gold">${m.basePrice}</td>
                        <td className="text-xs text-muted">{m.openingHours.split('(')[0]}</td>
                        <td>★ {m.rating}</td>
                        <td>
                          <div className="table-row-actions">
                            <button
                              type="button"
                              className="action-icon-btn edit"
                              title="Edit museum details"
                              onClick={() => openEditMuseumModal(m)}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              className="action-icon-btn delete"
                              title="Delete museum"
                              onClick={() => handleDeleteMuseum(m.id, m.name)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: All Bookings Management */}
        {activeAdminTab === 'bookings' && (
          <div className="admin-section-stack">
            <div className="admin-table-card">
              <div className="table-card-header">
                <div>
                  <h3 className="table-title">All Reservations Ledger</h3>
                  <p className="table-subtitle">Search, inspect and manage every issued museum pass.</p>
                </div>
                <div className="admin-search-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by ID, patron, museum..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="admin-search-input"
                  />
                </div>
              </div>

              <div className="admin-table-responsive">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Pass ID</th>
                      <th>Visitor / Email</th>
                      <th>Museum Name</th>
                      <th>Visit Date</th>
                      <th>Time Slot</th>
                      <th>Pass Breakdown</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Quick Status Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => {
                      const adultCount = b.tickets?.adult ?? b.adult_count ?? 0;
                      const studentCount = b.tickets?.student ?? b.student_count ?? 0;
                      const childCount = b.tickets?.child ?? b.child_count ?? 0;

                      return (
                        <tr key={b.id || b.booking_code}>
                          <td className="font-mono text-gold text-xs">{b.booking_code || b.id}</td>
                          <td>
                            <div className="font-medium text-white">{b.customer?.fullName || 'Patron Guest'}</div>
                            <div className="text-xs text-muted">{b.customer?.email || 'guest@aurum.org'}</div>
                            {b.customer?.phone && <div className="text-xs text-muted">{b.customer.phone}</div>}
                          </td>
                          <td>{b.museumName || b.museum_name || 'Museum Landmark'}</td>
                          <td>{b.visitDate || b.visit_date}</td>
                          <td>{b.timeSlot || b.time_slot}</td>
                          <td className="text-xs">
                            {adultCount > 0 && `Adult: ${adultCount} `}
                            {studentCount > 0 && `Student: ${studentCount} `}
                            {childCount > 0 && `Child: ${childCount} `}
                          </td>
                          <td className="font-semibold text-white">${b.totalAmount ?? b.total_amount} USD</td>
                          <td>
                            <span className={`status-badge-cell status-${(b.status || 'upcoming').toLowerCase()}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <select
                              value={b.status}
                              onChange={(e) => handleBookingStatusChange(b.booking_code || b.id, e.target.value)}
                              className="table-status-select"
                            >
                              <option value="Upcoming">Upcoming</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredBookings.length === 0 && !loading && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No reservations match your search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Museum Add/Edit Modal */}
      {museumModalOpen && (
        <div className="modal-backdrop" onClick={() => setMuseumModalOpen(false)}>
          <div className="modal-card admin-form-modal" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setMuseumModalOpen(false)}
            >
              <X size={18} />
            </button>

            <h3 className="modal-title">
              {editingMuseum ? 'Edit Cultural Landmark' : 'Add New Partner Museum'}
            </h3>
            <p className="modal-subtitle">
              Configure admissions, operating hours, and imagery for visitor discovery.
            </p>

            <form onSubmit={handleSaveMuseum} className="admin-museum-form">
              <div className="form-group">
                <label className="form-label">Museum Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Rijksmuseum Heritage Gallery"
                  value={museumForm.name}
                  onChange={(e) => setMuseumForm({ ...museumForm, name: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Amsterdam"
                    value={museumForm.city}
                    onChange={(e) => setMuseumForm({ ...museumForm, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Netherlands"
                    value={museumForm.country}
                    onChange={(e) => setMuseumForm({ ...museumForm, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Street Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Museumstraat 1, 1071 XX Amsterdam"
                  value={museumForm.address}
                  onChange={(e) => setMuseumForm({ ...museumForm, address: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={museumForm.category}
                    onChange={(e) => setMuseumForm({ ...museumForm, category: e.target.value })}
                  >
                    <option value="Art & Antiquities">Art & Antiquities</option>
                    <option value="Fine Art & Sculpture">Fine Art & Sculpture</option>
                    <option value="Ancient History">Ancient History</option>
                    <option value="Modern & Digital Art">Modern & Digital Art</option>
                    <option value="Royal Palaces">Royal Palaces</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Base Ticket Price ($ USD) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-input"
                    value={museumForm.basePrice}
                    onChange={(e) => setMuseumForm({ ...museumForm, basePrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Opening Hours</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 09:00 AM - 06:00 PM (Daily)"
                    value={museumForm.openingHours}
                    onChange={(e) => setMuseumForm({ ...museumForm, openingHours: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Weekly Closed Day(s)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mondays"
                    value={museumForm.closedDays}
                    onChange={(e) => setMuseumForm({ ...museumForm, closedDays: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hero Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={museumForm.image}
                  onChange={(e) => setMuseumForm({ ...museumForm, image: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Tagline</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. A cathedral of Dutch golden age masterpieces."
                  value={museumForm.tagline}
                  onChange={(e) => setMuseumForm({ ...museumForm, tagline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Curatorial Description</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Describe the historical background, collections, and architecture..."
                  value={museumForm.description}
                  onChange={(e) => setMuseumForm({ ...museumForm, description: e.target.value })}
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMuseumModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingMuseum ? 'Save Changes' : 'Create Museum'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
