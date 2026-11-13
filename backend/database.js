const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "museum.db");

const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Users
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    phone TEXT,
    country TEXT,
    profile_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Safely ensure phone, country, profile_image exist in users table if table was created previously
try {
  const userColumns = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  if (!userColumns.includes("phone")) {
    db.exec("ALTER TABLE users ADD COLUMN phone TEXT");
  }
  if (!userColumns.includes("country")) {
    db.exec("ALTER TABLE users ADD COLUMN country TEXT");
  }
  if (!userColumns.includes("profile_image")) {
    db.exec("ALTER TABLE users ADD COLUMN profile_image TEXT");
  }
} catch (alterErr) {
  console.warn("User schema verification notice:", alterErr.message);
}

// Museums
db.exec(`
  CREATE TABLE IF NOT EXISTS museums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    category TEXT,
    description TEXT,
    address TEXT,
    ticket_price REAL DEFAULT 0,
    rating REAL DEFAULT 0,
    image TEXT,
    opening_time TEXT,
    closing_time TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Exhibitions
db.exec(`
  CREATE TABLE IF NOT EXISTS exhibitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    museum_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date TEXT,
    end_date TEXT,
    image TEXT,
    FOREIGN KEY (museum_id) REFERENCES museums(id) ON DELETE CASCADE
  )
`);

// Bookings
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_code TEXT UNIQUE NOT NULL,
    user_id INTEGER,
    museum_id INTEGER NOT NULL,
    visit_date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    adult_count INTEGER DEFAULT 0,
    student_count INTEGER DEFAULT 0,
    child_count INTEGER DEFAULT 0,
    total_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (museum_id) REFERENCES museums(id) ON DELETE CASCADE
  )
`);

// Booking tickets
db.exec(`
  CREATE TABLE IF NOT EXISTS booking_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    ticket_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    price REAL DEFAULT 0,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )
`);

// Seed default demo admin account if not already created
try {
  const bcrypt = require("bcryptjs");
  const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@aurum.com");
  if (!existingAdmin) {
    const hashedAdminPassword = bcrypt.hashSync("Admin@123", 10);
    db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run("Chief Curator Admin", "admin@aurum.com", hashedAdminPassword, "admin");
    console.log("Demo admin account initialized (admin@aurum.com).");
  }
} catch (seedErr) {
  console.warn("Could not seed admin user:", seedErr.message);
}

console.log("Museum database initialized successfully.");

module.exports = db;