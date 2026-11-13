import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, Ticket, ArrowUpRight } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function MuseumCard({ museum }) {
  const navigate = useNavigate();
  const { updateDraft } = useBooking();

  const handleQuickBook = (e) => {
    e.stopPropagation();
    updateDraft({ museumId: museum.id });
    navigate('/booking');
  };

  return (
    <div className="museum-card group">
      {/* Image container */}
      <div className="museum-card-media">
        <img 
          src={museum.image} 
          alt={museum.name} 
          className="museum-card-img" 
          loading="lazy" 
        />
        <div className="museum-card-overlay" />
        
        {/* Badges */}
        <div className="museum-card-badges">
          <span className="badge badge-gold">{museum.badge || museum.category}</span>
          <div className="badge badge-dark rating-badge">
            <Star size={13} className="text-amber fill-amber" />
            <span>{museum.rating}</span>
            <span className="text-muted text-xs">({museum.reviewsCount?.toLocaleString() || 100})</span>
          </div>
        </div>

        <div className="museum-card-price-tag">
          <span className="price-from">From</span>
          <span className="price-val">${museum.basePrice}</span>
        </div>
      </div>

      {/* Content */}
      <div className="museum-card-body">
        <div className="museum-card-loc">
          <MapPin size={14} className="accent-gold-text" />
          <span>{museum.city}, {museum.country}</span>
        </div>

        <h3 className="museum-card-title">
          <Link to={`/museums/${museum.id}`}>{museum.name}</Link>
        </h3>

        <p className="museum-card-desc">
          {museum.tagline || museum.description}
        </p>

        <div className="museum-card-meta">
          <div className="meta-item">
            <Clock size={13} className="text-muted" />
            <span className="meta-text">{museum.openingHours.split('(')[0].trim()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="museum-card-actions">
          <Link 
            to={`/museums/${museum.id}`} 
            className="btn btn-secondary btn-sm flex-1 text-center"
          >
            <span>View Details</span>
            <ArrowUpRight size={14} />
          </Link>
          <button 
            type="button" 
            className="btn btn-primary btn-sm flex-1"
            onClick={handleQuickBook}
          >
            <Ticket size={14} />
            <span>Book Tickets</span>
          </button>
        </div>
      </div>
    </div>
  );
}
