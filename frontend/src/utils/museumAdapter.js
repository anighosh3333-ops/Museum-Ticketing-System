import { INITIAL_MUSEUMS } from '../data/mockData';

/**
 * Finds the corresponding fallback museum in mockData.js by numeric ID,
 * string ID (e.g. 'mus-1'), or museum name.
 */
export function findFallbackById(targetId) {
  if (targetId === undefined || targetId === null) return null;
  const targetStr = String(targetId);
  const targetNum = parseInt(targetStr.replace(/\D/g, ''), 10);

  return INITIAL_MUSEUMS.find(m => {
    if (m.id === targetId || String(m.id) === targetStr) return true;
    const mNum = parseInt(String(m.id).replace(/\D/g, ''), 10);
    return !isNaN(mNum) && !isNaN(targetNum) && mNum === targetNum;
  }) || null;
}

/**
 * Finds the fallback museum for an API museum object.
 */
export function findFallbackMuseum(rawItem) {
  if (!rawItem) return null;
  if (rawItem.id) {
    const found = findFallbackById(rawItem.id);
    if (found) return found;
  }
  if (rawItem.name) {
    const found = INITIAL_MUSEUMS.find(
      m => m.name.toLowerCase() === rawItem.name.toLowerCase()
    );
    if (found) return found;
  }
  return null;
}

/**
 * Harmonizes backend SQLite museum data with UI fallback attributes
 * (such as country, gallery, highlights, amenities, and timeSlots),
 * ensuring zero layout shifts, zero undefined crashes, and exact visual preservation.
 */
export function adaptMuseum(apiMuseum) {
  if (!apiMuseum) return null;

  const fallback = findFallbackMuseum(apiMuseum) || {};

  // Parse or format openingHours
  let openingHours = fallback.openingHours || '09:00 AM - 06:00 PM';
  if (apiMuseum.opening_time && apiMuseum.closing_time) {
    openingHours = `${apiMuseum.opening_time} - ${apiMuseum.closing_time}`;
  } else if (apiMuseum.opening_time) {
    openingHours = apiMuseum.opening_time;
  }

  const basePrice = Number(
    apiMuseum.ticket_price ?? apiMuseum.basePrice ?? fallback.basePrice ?? 25
  );

  const prices = fallback.prices || {
    adult: basePrice,
    student: Math.round(basePrice * 0.7),
    child: Math.round(basePrice * 0.4)
  };

  // Harmonize exhibitions if present
  const rawExhibitions = apiMuseum.exhibitions || fallback.exhibitions || [];
  const exhibitions = rawExhibitions.map(exh => {
    const exhFallback = (fallback.exhibitions || []).find(
      fe =>
        fe.id === exh.id ||
        String(fe.id) === String(exh.id) ||
        String(fe.id).endsWith(String(exh.id)) ||
        fe.title === exh.title
    ) || {};

    const dateRange =
      exh.dateRange ||
      (exh.start_date && exh.end_date && exh.start_date !== exh.end_date
        ? `${exh.start_date} - ${exh.end_date}`
        : exh.start_date || exhFallback.dateRange || 'Permanent Collection');

    return {
      ...exhFallback,
      ...exh,
      id: exh.id || exhFallback.id,
      title: exh.title || exhFallback.title || '',
      description: exh.description || exhFallback.description || '',
      image: exh.image || exhFallback.image || '',
      curator: exh.curator || exhFallback.curator || 'Curatorial Team',
      dateRange
    };
  });

  return {
    ...fallback,
    ...apiMuseum,
    id: apiMuseum.id ?? fallback.id,
    rawId: fallback.id,
    name: apiMuseum.name || fallback.name || '',
    city: apiMuseum.city || fallback.city || '',
    country: fallback.country || '',
    address: apiMuseum.address || fallback.address || '',
    category: apiMuseum.category || fallback.category || 'General',
    description: apiMuseum.description || fallback.description || '',
    rating: Number(apiMuseum.rating ?? fallback.rating ?? 4.8),
    image: apiMuseum.image || fallback.image || '',
    basePrice,
    ticket_price: basePrice,
    prices,
    openingHours,
    tagline: fallback.tagline || apiMuseum.description || '',
    badge: fallback.badge || apiMuseum.category || '',
    reviewsCount: fallback.reviewsCount || 100,
    highlights: fallback.highlights || [],
    amenities: fallback.amenities || ['Audio Guides', 'Wheelchair Accessible'],
    timeSlots: fallback.timeSlots || ['10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'],
    gallery: fallback.gallery || [apiMuseum.image || fallback.image],
    closedDays: fallback.closedDays || 'None',
    exhibitions
  };
}
