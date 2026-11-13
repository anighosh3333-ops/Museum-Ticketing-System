import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Ticket, Sparkles } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function ExhibitionCard({ exhibition, museumId, museumName }) {
  const navigate = useNavigate();
  const { updateDraft } = useBooking();

  const handleBookExhibition = () => {
    updateDraft({ 
      museumId: museumId || 'mus-1',
      exhibitionId: exhibition.id 
    });
    navigate('/booking');
  };

  return (
    <div className="exhibition-card">
      <div className="exhibition-media">
        <img 
          src={exhibition.image} 
          alt={exhibition.title} 
          className="exhibition-img" 
          loading="lazy" 
        />
        <div className="exhibition-overlay" />
        <div className="exhibition-badge">
          <Sparkles size={12} />
          <span>Curator Showcase</span>
        </div>
      </div>

      <div className="exhibition-body">
        <div className="exhibition-museum-tag">
          {museumName}
        </div>
        <h3 className="exhibition-title">{exhibition.title}</h3>
        
        <p className="exhibition-desc">{exhibition.description}</p>

        <div className="exhibition-meta-row">
          <div className="meta-pill">
            <Calendar size={13} />
            <span>{exhibition.dateRange}</span>
          </div>
          <div className="meta-pill">
            <User size={13} />
            <span>{exhibition.curator}</span>
          </div>
        </div>

        <button 
          type="button" 
          className="btn btn-outline btn-sm exhibition-btn"
          onClick={handleBookExhibition}
        >
          <Ticket size={14} />
          <span>Book Exhibition Pass</span>
        </button>
      </div>
    </div>
  );
}
