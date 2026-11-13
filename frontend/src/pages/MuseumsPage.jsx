import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, SlidersHorizontal, RotateCcw, Landmark, Loader2, AlertCircle } from 'lucide-react';
import MuseumCard from '../components/MuseumCard';
import { INITIAL_MUSEUMS } from '../data/mockData';
import { adaptMuseum } from '../utils/museumAdapter';
import { API_BASE_URL } from '../api';

export default function MuseumsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Museum API Data State
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMuseums = () => {
    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/museums`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Museum server responded with HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(json => {
        if (json && json.success && Array.isArray(json.data)) {
          const adapted = json.data.map(adaptMuseum);
          setMuseums(adapted);
          setError(null);
        } else {
          throw new Error(json?.message || 'Invalid response from museums API');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch museums from backend:', err);
        setError(err.message);
        // Fallback to INITIAL_MUSEUMS to preserve functionality if backend is unavailable
        setMuseums(INITIAL_MUSEUMS.map(adaptMuseum));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMuseums();
  }, []);

  const initialQuery = searchParams.get('query') || '';
  const initialCity = searchParams.get('city') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  // Categories list
  const categories = ['All', 'History', 'Art', 'Science', 'Culture', 'Technology'];

  // Cities list derived from current loaded museums
  const cities = useMemo(() => {
    const set = new Set(museums.map(m => m.city).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [museums]);

  // Filtered & sorted museums
  const filteredMuseums = useMemo(() => {
    return museums.filter(museum => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        (museum.name && museum.name.toLowerCase().includes(q)) ||
        (museum.city && museum.city.toLowerCase().includes(q)) ||
        (museum.country && museum.country.toLowerCase().includes(q)) ||
        (museum.description && museum.description.toLowerCase().includes(q));

      const matchCity = selectedCity === '' || selectedCity === 'All' || 
        (museum.city && museum.city.toLowerCase() === selectedCity.toLowerCase());
      
      const matchCategory = (() => {
        if (selectedCategory === 'All') return true;
        const cat = selectedCategory.toLowerCase();
        const mCat = (museum.category || '').toLowerCase();
        if (cat === 'history') {
          return mCat.includes('history') || mCat.includes('antiquit') || mCat.includes('palace');
        }
        if (cat === 'art') {
          return mCat.includes('art') || mCat.includes('sculpture');
        }
        if (cat === 'science') {
          return mCat.includes('science') || mCat.includes('tech') || mCat.includes('modern');
        }
        if (cat === 'culture') {
          return mCat.includes('culture') || mCat.includes('antiquit') || mCat.includes('heritage') || mCat.includes('palace');
        }
        if (cat === 'technology') {
          return mCat.includes('tech') || mCat.includes('digital') || mCat.includes('modern');
        }
        return mCat.includes(cat);
      })();

      return matchQuery && matchCity && matchCategory;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return (a.basePrice || 0) - (b.basePrice || 0);
      if (sortBy === 'price-high') return (b.basePrice || 0) - (a.basePrice || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0; // 'featured' order
    });
  }, [museums, searchQuery, selectedCity, selectedCategory, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedCategory('All');
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="museums-page-root">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="page-header-container">
          <div className="page-header-badge">
            <Landmark size={14} className="accent-gold-text" />
            <span>GLOBAL PARTNER GALLERIES</span>
          </div>
          <h1 className="page-header-title">Museums</h1>
          <p className="page-header-desc">
            Explore iconic museums and cultural institutions.
          </p>
        </div>
      </div>

      <div className="section-container">
        {/* Search & Filter Bar */}
        <div className="filter-console-wrapper">
          <div className="filter-console-top">
            <div className="filter-search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search museums, cities or exhibitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-search-input"
              />
            </div>

            <div className="filter-controls-row">
              <div className="filter-select-wrapper">
                <MapPin size={16} className="select-icon" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Cities ▼</option>
                  {cities.filter(c => c !== 'All').map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="filter-select-wrapper">
                <SlidersHorizontal size={16} className="select-icon" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="rating">Sort: Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {(searchQuery || selectedCity || selectedCategory !== 'All' || sortBy !== 'featured') && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm reset-filter-btn"
                  onClick={handleResetFilters}
                  title="Reset all filters"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="category-chips-list">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="results-count-bar">
          <span>Showing <strong className="text-white">{loading ? '...' : filteredMuseums.length}</strong> cultural institutions</span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="empty-state-box" style={{ borderColor: 'var(--border)' }}>
            <Loader2 size={40} className="empty-state-icon" style={{ animation: 'spin 1.2s linear infinite', margin: '0 auto 1rem' }} />
            <h3 className="empty-state-title">Loading Collections...</h3>
            <p className="empty-state-desc">Fetching institutional records from the Aurum database.</p>
          </div>
        ) : error && museums.length === 0 ? (
          /* Error State (when no data could be loaded) */
          <div className="empty-state-box">
            <AlertCircle size={40} className="empty-state-icon text-amber" style={{ margin: '0 auto 1rem' }} />
            <h3 className="empty-state-title">Unable to Connect</h3>
            <p className="empty-state-desc">{error}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={fetchMuseums}
            >
              <RotateCcw size={14} />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : filteredMuseums.length > 0 ? (
          /* Grid of Museums */
          <div className="museums-grid">
            {filteredMuseums.map(museum => (
              <MuseumCard key={museum.id} museum={museum} />
            ))}
          </div>
        ) : (
          /* Empty Search Filter State */
          <div className="empty-state-box">
            <Landmark size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No museums found</h3>
            <p className="empty-state-desc">
              We couldn't find any institutions matching your search criteria. Try modifying your keywords or clearing the category filters.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
