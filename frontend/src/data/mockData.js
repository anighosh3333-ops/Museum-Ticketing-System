// Mock data for AURUM Museum Ticketing System

export const INITIAL_MUSEUMS = [
  {
    id: "mus-1",
    name: "The Grand Louvre of Antiquities",
    tagline: "Home to the world's most celebrated masterpieces and ancient civilizations.",
    city: "Paris",
    country: "France",
    address: "Rue de Rivoli, 75001 Paris, France",
    category: "Art & Antiquities",
    rating: 4.9,
    reviewsCount: 14820,
    badge: "UNESCO World Heritage",
    image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544476915-ed1370594142?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574958269340-fa927503f3dd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80"
    ],
    openingHours: "09:00 AM - 06:00 PM (Wed & Fri till 09:45 PM)",
    closedDays: "Tuesdays",
    basePrice: 22,
    prices: {
      adult: 22,
      student: 15,
      child: 0 // Free under 12
    },
    description: "The Grand Louvre stands as the quintessential monument to human creativity, housing over 35,000 works of art across eight curatorial departments. From the Winged Victory of Samothrace and the Venus de Milo to the Mona Lisa, wander through centuries of dynastic grandeur and artistic pinnacle.",
    highlights: [
      "Priority Access via the Glass Pyramid",
      "Over 35,000 Historical Artifacts",
      "Interactive Multilingual Audio Tour",
      "Majestic Napoleon III State Apartments"
    ],
    amenities: ["Audio Guides", "Wheelchair Accessible", "Cloakroom", "Fine Dining & Cafes", "Gift Boutique"],
    timeSlots: ["09:30 AM", "11:00 AM", "12:30 PM", "02:00 PM", "03:30 PM", "05:00 PM"],
    exhibitions: [
      {
        id: "exh-101",
        title: "Echoes of the Nile: Royal Tombs of Luxor",
        curator: "Dr. Amelie Laurent",
        dateRange: "Oct 15 - Dec 30, 2026",
        image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        description: "An extraordinary collection of gold sarcophagi, ritual papyri, and personal amulets from the Valley of the Kings."
      },
      {
        id: "exh-102",
        title: "Masters of the Italian High Renaissance",
        curator: "Prof. Giancarlo Rossi",
        dateRange: "Permanent Collection",
        image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80",
        description: "A breathtaking encounter with Da Vinci, Raphael, and Titian featuring freshly restored tempera masterpieces."
      }
    ]
  },
  {
    id: "mus-2",
    name: "Metropolitan Vault of Fine Arts",
    tagline: "Five millennia of global culture across two million square feet of gallery space.",
    city: "New York",
    country: "USA",
    address: "1000 Fifth Avenue, New York, NY 10028",
    category: "Fine Art & Sculpture",
    rating: 4.8,
    reviewsCount: 11250,
    badge: "Must Visit",
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80"
    ],
    openingHours: "10:00 AM - 05:00 PM (Fri & Sat till 09:00 PM)",
    closedDays: "Wednesdays",
    basePrice: 30,
    prices: {
      adult: 30,
      student: 18,
      child: 10
    },
    description: "Located on the edge of Central Park, the Metropolitan Vault presents the world's most encyclopedic art collection. Discover classical Roman sculpture, American stained glass, medieval European armory, and contemporary visionary installations under one iconic roof.",
    highlights: [
      "The Temple of Dendur in The Sackler Wing",
      "Rooftop Sculpture Garden overlooking Central Park",
      "Arms and Armor Court with Equestrian Knights",
      "Renowned European Impressionist Galleries"
    ],
    amenities: ["Rooftop Garden", "Free Wi-Fi", "Stroller Rental", "Audio Tour Devices", "Valet Parking"],
    timeSlots: ["10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"],
    exhibitions: [
      {
        id: "exh-201",
        title: "Gilded Ages: Splendor and Excess",
        curator: "Victoria Sterling",
        dateRange: "Nov 01 - Jan 28, 2027",
        image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80",
        description: "Exploring couture fashion, gold jewelry, and private palatial interiors of New York's 19th-century elite."
      }
    ]
  },
  {
    id: "mus-3",
    name: "National Heritage & Imperial Palace",
    tagline: "Sacred architecture, Mughal jewels, and ancient Vedic manuscripts.",
    city: "New Delhi",
    country: "India",
    address: "Janpath Road, Rajpath Area, New Delhi 110011",
    category: "Ancient History",
    rating: 4.9,
    reviewsCount: 9400,
    badge: "Heritage Landmark",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80"
    ],
    openingHours: "10:00 AM - 06:00 PM (Tuesday to Sunday)",
    closedDays: "Mondays & National Holidays",
    basePrice: 15,
    prices: {
      adult: 15,
      student: 8,
      child: 5
    },
    description: "Spanning five thousand years of Indian subcontinental history, this grand monument houses rare Harappan seals, gilded Chola bronzes, celestial Mughal miniatures, and jewel-encrusted royal armaments.",
    highlights: [
      "Indus Valley Civilization Relics & Dancing Girl",
      "Rare Gilded Mughal Swords & Daggers",
      "Tanjore Gold Leaf Painting Gallery",
      "Ancient Palm-Leaf Buddhist Sutras"
    ],
    amenities: ["Botanical Courtyard", "Live Artisans Corner", "Wheelchair Friendly", "Audio Guide in 8 Languages"],
    timeSlots: ["10:15 AM", "11:45 AM", "01:30 PM", "03:00 PM", "04:30 PM"],
    exhibitions: [
      {
        id: "exh-301",
        title: "Jewels of the Nizams & Mughal Court",
        curator: "Dr. Rajeshwar Sharma",
        dateRange: "Aug 10 - Dec 15, 2026",
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
        description: "The Jacob Diamond, Colombian emerald turban ornaments, and solid gold ceremonial thrones."
      }
    ]
  },
  {
    id: "mus-4",
    name: "Tokyo Digital & Modern Arts Pavilion",
    tagline: "Where boundary-breaking digital light, immersive sound, and modern sculpture merge.",
    city: "Tokyo",
    country: "Japan",
    address: "6-10-1 Roppongi, Minato City, Tokyo 106-6108",
    category: "Modern & Digital Art",
    rating: 4.95,
    reviewsCount: 16200,
    badge: "Futuristic & Immersive",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80"
    ],
    openingHours: "09:00 AM - 09:00 PM (Daily)",
    closedDays: "None",
    basePrice: 28,
    prices: {
      adult: 28,
      student: 20,
      child: 12
    },
    description: "An awe-inspiring universe of borderless artworks. Walk through crystal floral waterfalls, interact with generative AI lighting installations, and feel sensory sculptures evolve with your movements.",
    highlights: [
      "Borderless Digital Light Forest",
      "Infinite Mirror Room with Floating Lanterns",
      "Sensory Tea House with Floral Projections",
      "Interactive Soundscape Dome"
    ],
    amenities: ["Interactive App", "Luggage Lockers", "Bioluminescent Cafe", "Accessibility Lifts"],
    timeSlots: ["09:00 AM", "10:30 AM", "12:00 PM", "01:30 PM", "03:00 PM", "04:30 PM", "06:00 PM", "07:30 PM"],
    exhibitions: [
      {
        id: "exh-401",
        title: "Ephemeral Worlds: Light & Memory",
        curator: "Kenzo Takahashi",
        dateRange: "Ongoing Special Showcase",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
        description: "A 360-degree holographic installation tracking seasonal shifts through algorithmic petals and cosmic nebulae."
      }
    ]
  },
  {
    id: "mus-5",
    name: "Royal Armoury & Tower Treasury",
    tagline: "The fortress of kings, Crown Jewels, and centuries of royal intrigue.",
    city: "London",
    country: "UK",
    address: "Tower Hill, London EC3N 4AB",
    category: "Royal Palaces",
    rating: 4.85,
    reviewsCount: 13900,
    badge: "Royal Fortress",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=800&q=80"
    ],
    openingHours: "09:00 AM - 05:30 PM (Tuesday to Saturday)",
    closedDays: "Sundays & Christmas Day",
    basePrice: 25,
    prices: {
      adult: 25,
      student: 16,
      child: 12
    },
    description: "Step into nine centuries of British royal history. Stand in front of the glittering Crown Jewels, inspect the Line of Kings equestrian armory, and walk the ancient ramparts defended by the Yeoman Warders.",
    highlights: [
      "The Imperial State Crown & Cullinan Diamonds",
      "Henry VIII's Personal Gilded Tournament Armour",
      "Yeoman Warder (Beefeater) Guided Tours",
      "Medieval White Tower and Norman Chapel"
    ],
    amenities: ["Official Beefeater Tours", "Family Activity Trails", "Historic Armoury Shop", "River Thames Terrace"],
    timeSlots: ["09:30 AM", "11:00 AM", "01:00 PM", "02:30 PM", "04:00 PM"],
    exhibitions: [
      {
        id: "exh-501",
        title: "Tudor Steel: The Tournament of Knights",
        curator: "Sir Alistair Finch",
        dateRange: "Sep 01 - Nov 30, 2026",
        image: "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=800&q=80",
        description: "Engraved royal plate armor, jousting lances, and ceremonial broadswords from the court of Henry VIII."
      }
    ]
  },
  {
    id: "mus-6",
    name: "Galleria degli Uffizi Renaissance Sanctum",
    tagline: "The cradle of Western painting overlooking the serene Arno River.",
    city: "Florence",
    country: "Italy",
    address: "Piazzale degli Uffizi, 6, 50122 Firenze FI, Italy",
    category: "Art & Antiquities",
    rating: 4.9,
    reviewsCount: 15400,
    badge: "Italian Masterpiece",
    image: "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
    ],
    openingHours: "08:15 AM - 06:30 PM (Tuesday to Sunday)",
    closedDays: "Mondays",
    basePrice: 24,
    prices: {
      adult: 24,
      student: 14,
      child: 8
    },
    description: "Originally built for the magistrates of the Medici dynasty, the Uffizi is the absolute shrine of Renaissance genius, showcasing Botticelli's Birth of Venus, Michelangelo's Doni Tondo, and Caravaggio's Medusa.",
    highlights: [
      "Botticelli's Primavera and Birth of Venus",
      "Medici Private Sculpture Hallway",
      "Caravaggio Chiaroscuro Room",
      "Panoramic Rooftop Terrace facing Palazzo Vecchio"
    ],
    amenities: ["Priority Skip-the-Line Entry", "Official Medici Audio Guide", "Historic Cafe on Terrace", "Bookshop"],
    timeSlots: ["08:30 AM", "10:15 AM", "12:00 PM", "02:15 PM", "04:00 PM", "05:15 PM"],
    exhibitions: [
      {
        id: "exh-601",
        title: "Botticelli & The Golden Age of Lorenzo",
        curator: "Contessa Maria Valori",
        dateRange: "Oct 01 - Jan 15, 2027",
        image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80",
        description: "An intimate assembly of preparatory drawings, tempera panels, and poetic manuscripts from the Medici Golden Age."
      }
    ]
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: "AUR-8942-701A",
    museumId: "mus-1",
    museumName: "The Grand Louvre of Antiquities",
    museumLocation: "Paris, France",
    museumImage: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80",
    visitDate: "2026-10-18",
    timeSlot: "11:00 AM",
    status: "Upcoming",
    bookingDate: "2026-09-28",
    tickets: {
      adult: 2,
      student: 1,
      child: 0
    },
    addOns: ["VIP Audio Guide (x2)"],
    totalAmount: 67,
    customer: {
      fullName: "Eleanor Vance",
      email: "eleanor.vance@culturepass.org",
      phone: "+33 6 42 19 88 04",
      specialRequests: "Audio guides in English requested"
    }
  },
  {
    id: "AUR-5120-339B",
    museumId: "mus-4",
    museumName: "Tokyo Digital & Modern Arts Pavilion",
    museumLocation: "Tokyo, Japan",
    museumImage: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80",
    visitDate: "2026-08-14",
    timeSlot: "04:30 PM",
    status: "Completed",
    bookingDate: "2026-08-01",
    tickets: {
      adult: 2,
      student: 0,
      child: 1
    },
    addOns: ["Sensory Hologram Pass"],
    totalAmount: 76,
    customer: {
      fullName: "Eleanor Vance",
      email: "eleanor.vance@culturepass.org",
      phone: "+33 6 42 19 88 04",
      specialRequests: ""
    }
  }
];

export const CHATBOT_FAQ = [
  {
    keywords: ["price", "pricing", "cost", "how much", "rate", "fee", "discount", "admission cost"],
    reply: "Prices and ticket categories vary by museum. Open a museum's details or the booking summary to see its listed prices and the conservation fee before confirming."
  },
  {
    keywords: ["hour", "time", "open", "close", "timing", "schedule"],
    reply: "Opening hours and closure days vary by museum. Check the selected museum's details page for its current hours before planning your visit."
  },
  {
    keywords: ["how to book", "book", "booking", "reserve", "reservation", "flow"],
    reply: "To make a reservation: open a museum, choose a visit date and time, select ticket quantities, enter your contact details, then confirm. The confirmation page and My Bookings show your in-app QR pass. This app records the reservation but does not collect payment or guarantee venue admission."
  },
  {
    keywords: ["payment", "pay", "card", "charge", "checkout"],
    reply: "This app shows a booking total and records reservations, but it does not collect card payments or process refunds. Check with the museum about its payment and admission arrangements."
  },
  {
    keywords: ["cancel", "refund", "policy", "cancellation"],
    reply: "Aurum does not collect payments or issue refunds. Canceling in My Bookings updates the reservation record in this app; contact the museum directly about changes to an actual visit and its refund policy."
  },
  {
    keywords: ["audio", "guide", "headset", "language"],
    reply: "Audio guide availability and languages vary by museum. Check the museum details and booking options to see whether an audio guide is listed."
  },
  {
    keywords: ["qr", "digital pass", "digital ticket", "show my pass", "print", "entry"],
    reply: "After confirming a reservation, open its QR pass on the confirmation page or in My Bookings. Check the museum's own entry instructions to confirm whether it accepts this pass; Aurum does not email or text tickets."
  },
  {
    keywords: ["student", "discount", "id"],
    reply: "Student prices and ID requirements vary by museum. Check the listed ticket price and confirm the venue's proof-of-eligibility rules before your visit."
  },
  {
    keywords: ["hello", "hi", "hey", "greetings"],
    reply: "Hello! I can help you find museum prices and hours, explain how reservations and QR passes work, and clarify what this app can do. What would you like to know?"
  }
];

export const INITIAL_USER = {
  name: "Eleanor Vance",
  email: "eleanor.vance@culturepass.org",
  role: "Patron Member",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  memberSince: "2024",
  membershipTier: "Gold Heritage Pass"
};
