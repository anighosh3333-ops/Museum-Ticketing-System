const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("./database");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "aurum_secret_jwt_key_2026";

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===============================
// AUTH MIDDLEWARE
// ===============================
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && (authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader);

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token required"
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || !decoded || !decoded.id) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired authentication token"
            });
        }

        const user = db.prepare("SELECT id, name, email, role, phone, country, profile_image, created_at FROM users WHERE id = ?").get(decoded.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found"
            });
        }

        req.user = user;
        next();
    });
}

function optionalAuth(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && (authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader);

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (!err && decoded && decoded.id) {
            const user = db.prepare("SELECT id, name, email, role, phone, country, profile_image, created_at FROM users WHERE id = ?").get(decoded.id);
            req.user = user || null;
        } else {
            req.user = null;
        }
        next();
    });
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Forbidden: Curator administrator access required"
        });
    }
    next();
}

// ===============================
// Health Check
// ===============================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Aurum Museum Ticketing API is running!"
    });
});

// ===============================
// AUTHENTICATION ROUTES
// ===============================

// POST /api/auth/register
app.post("/api/auth/register", (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Full name is required."
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "A valid email address is required."
            });
        }

        if (!password || typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if email already registered
        const existing = db.prepare("SELECT id FROM users WHERE LOWER(email) = ?").get(normalizedEmail);
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "An account with this email address already exists."
            });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = db.prepare(`
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, 'user')
        `).run(name.trim(), normalizedEmail, hashedPassword);

        const newUser = {
            id: result.lastInsertRowid,
            name: name.trim(),
            email: normalizedEmail,
            role: "user"
        };

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            data: newUser
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create account: " + error.message
        });
    }
});

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").get(normalizedEmail);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone || "",
                    country: user.country || "",
                    profile_image: user.profile_image || null,
                    created_at: user.created_at
                }
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to sign in: " + error.message
        });
    }
});

// GET /api/auth/me
app.get("/api/auth/me", authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            phone: req.user.phone || "",
            country: req.user.country || "",
            profile_image: req.user.profile_image || null,
            created_at: req.user.created_at
        }
    });
});

// PUT /api/auth/profile
app.put("/api/auth/profile", authenticateToken, (req, res) => {
    try {
        const { name, email, phone, country, profile_image } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Full name is required."
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "A valid email address is required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if email conflicts with another user
        const existing = db.prepare("SELECT id FROM users WHERE LOWER(email) = ? AND id != ?").get(normalizedEmail, req.user.id);
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "This email address is already in use by another account."
            });
        }

        const cleanName = name.trim();
        const cleanPhone = phone !== undefined ? (typeof phone === "string" ? phone.trim() : "") : (req.user.phone || "");
        const cleanCountry = country !== undefined ? (typeof country === "string" ? country.trim() : "") : (req.user.country || "");
        const cleanProfileImage = profile_image !== undefined ? profile_image : (req.user.profile_image || null);

        db.prepare(`
            UPDATE users
            SET name = ?, email = ?, phone = ?, country = ?, profile_image = ?
            WHERE id = ?
        `).run(cleanName, normalizedEmail, cleanPhone, cleanCountry, cleanProfileImage, req.user.id);

        const updatedUser = db.prepare("SELECT id, name, email, role, phone, country, profile_image, created_at FROM users WHERE id = ?").get(req.user.id);

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile: " + error.message
        });
    }
});

// PUT /api/auth/password
app.put("/api/auth/password", authenticateToken, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required."
            });
        }

        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long."
            });
        }

        const user = db.prepare("SELECT password FROM users WHERE id = ?").get(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const isMatch = bcrypt.compareSync(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect current password."
            });
        }

        const hashed = bcrypt.hashSync(newPassword, 10);
        db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, req.user.id);

        res.json({
            success: true,
            message: "Password changed successfully."
        });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({
            success: false,
            message: "Failed to change password: " + error.message
        });
    }
});

// GET /api/auth/users (Admin Only)
app.get("/api/auth/users", authenticateToken, requireAdmin, (req, res) => {
    try {
        const users = db.prepare("SELECT id, name, email, role, phone, country, profile_image, created_at FROM users ORDER BY id ASC").all();
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
});

// ===============================
// GET ALL MUSEUMS
// ===============================
app.get("/api/museums", (req, res) => {
    try {
        const museums = db
            .prepare("SELECT * FROM museums ORDER BY id ASC")
            .all();

        res.json({
            success: true,
            count: museums.length,
            data: museums
        });
    } catch (error) {
        console.error("Error fetching museums:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch museums"
        });
    }
});

// ===============================
// GET MUSEUM BY ID
// ===============================
app.get("/api/museums/:id", (req, res) => {
    try {
        let idParam = req.params.id;
        // Support both numeric IDs (e.g. 1) and prefixed IDs (e.g. "mus-1")
        if (typeof idParam === "string" && idParam.startsWith("mus-")) {
            idParam = idParam.replace("mus-", "");
        }

        const museum = db
            .prepare("SELECT * FROM museums WHERE id = ?")
            .get(idParam);

        if (!museum) {
            return res.status(404).json({
                success: false,
                message: "Museum not found"
            });
        }

        // Attach exhibitions for this museum if available
        const exhibitions = db
            .prepare("SELECT * FROM exhibitions WHERE museum_id = ?")
            .all(museum.id);

        res.json({
            success: true,
            data: {
                ...museum,
                exhibitions: exhibitions || []
            }
        });
    } catch (error) {
        console.error("Error fetching museum:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch museum"
        });
    }
});

// Helper to get museum prices
function getMuseumPrices(museum) {
    const mockPrices = {
        1: { adult: 22, student: 15, child: 0 },
        2: { adult: 30, student: 18, child: 10 },
        3: { adult: 15, student: 8, child: 5 },
        4: { adult: 28, student: 20, child: 12 },
        5: { adult: 25, student: 16, child: 12 },
        6: { adult: 24, student: 14, child: 8 }
    };

    const basePrice = Number(museum.ticket_price) || 25;
    if (mockPrices[museum.id]) {
        return mockPrices[museum.id];
    }
    return {
        adult: basePrice,
        student: Math.round(basePrice * 0.7),
        child: Math.round(basePrice * 0.4)
    };
}

// Generate unique booking code e.g. AUR-XXXXXX
function generateBookingCode() {
    let bookingCode;
    let exists = true;
    while (exists) {
        const randomHex = Math.floor(100000 + Math.random() * 900000).toString();
        bookingCode = `AUR-${randomHex}`;
        const found = db.prepare("SELECT id FROM bookings WHERE booking_code = ?").get(bookingCode);
        if (!found) {
            exists = false;
        }
    }
    return bookingCode;
}

// Helper to format booking objects
function formatBookingRow(b) {
    const tickets = db.prepare("SELECT * FROM booking_tickets WHERE booking_id = ?").all(b.id);
    return {
        booking_id: b.id,
        booking_code: b.booking_code,
        id: b.booking_code,
        museum: {
            id: b.museum_id,
            name: b.museum_name,
            city: b.museum_city,
            image: b.museum_image,
            address: b.museum_address
        },
        museumId: b.museum_id,
        museumName: b.museum_name,
        museumLocation: `${b.museum_city || ''}`,
        museumImage: b.museum_image,
        visit_date: b.visit_date,
        visitDate: b.visit_date,
        time_slot: b.time_slot,
        timeSlot: b.time_slot,
        adult_count: b.adult_count,
        student_count: b.student_count,
        child_count: b.child_count,
        tickets: {
            adult: b.adult_count,
            student: b.student_count,
            child: b.child_count
        },
        ticket_details: tickets,
        total_amount: b.total_amount,
        totalAmount: b.total_amount,
        status: b.status === 'confirmed' ? 'Upcoming' : b.status,
        bookingDate: b.created_at ? b.created_at.split(' ')[0] : new Date().toISOString().split('T')[0]
    };
}

// ===============================
// CREATE BOOKING
// ===============================
app.post("/api/bookings", optionalAuth, (req, res) => {
    try {
        let rawMuseumId = req.body.museum_id ?? req.body.museumId;
        if (typeof rawMuseumId === "string" && rawMuseumId.startsWith("mus-")) {
            rawMuseumId = rawMuseumId.replace("mus-", "");
        }
        const museumId = parseInt(rawMuseumId, 10);

        const visitDate = req.body.visit_date ?? req.body.visitDate;
        const timeSlot = req.body.time_slot ?? req.body.timeSlot;
        const adultCount = Math.max(0, parseInt(req.body.adult_count ?? req.body.adultCount ?? req.body.tickets?.adult ?? 0, 10));
        const studentCount = Math.max(0, parseInt(req.body.student_count ?? req.body.studentCount ?? req.body.tickets?.student ?? 0, 10));
        const childCount = Math.max(0, parseInt(req.body.child_count ?? req.body.childCount ?? req.body.tickets?.child ?? 0, 10));
        
        // Rule 10 & 11: Do NOT trust user_id from frontend. Use authenticated token if present.
        const userId = req.user ? req.user.id : null;
        const customer = req.body.customer || {};

        // Validation
        if (isNaN(museumId)) {
            return res.status(400).json({ success: false, message: "Valid museum_id is required." });
        }

        const museum = db.prepare("SELECT * FROM museums WHERE id = ?").get(museumId);
        if (!museum) {
            return res.status(404).json({ success: false, message: "Museum not found." });
        }

        if (!visitDate) {
            return res.status(400).json({ success: false, message: "Visit date is required." });
        }

        if (!timeSlot) {
            return res.status(400).json({ success: false, message: "Time slot is required." });
        }

        const totalTickets = adultCount + studentCount + childCount;
        if (totalTickets <= 0) {
            return res.status(400).json({ success: false, message: "At least one ticket must be selected." });
        }

        // Authoritative ticket prices
        const prices = getMuseumPrices(museum);
        const adultTotal = adultCount * prices.adult;
        const studentTotal = studentCount * prices.student;
        const childTotal = childCount * prices.child;

        // Keep server-side pricing aligned with the checkout: each supported
        // add-on costs $8 and is included in the discounted subtotal.
        const supportedAddOns = new Set(["VIP Audio Guide", "VR Gallery Experience"]);
        const requestedAddOns = req.body.addOns ?? req.body.add_ons ?? [];
        if (!Array.isArray(requestedAddOns) || requestedAddOns.some(addOn => !supportedAddOns.has(addOn))) {
            return res.status(400).json({ success: false, message: "One or more selected add-ons are invalid." });
        }
        const addOns = [...new Set(requestedAddOns)];
        const addOnTotal = addOns.length * 8;
        const subtotal = adultTotal + studentTotal + childTotal + addOnTotal;

        // Promo code support
        const promoCode = (req.body.promo_code ?? req.body.promoCode ?? "").trim().toUpperCase();
        let discountPercent = 0;
        if (promoCode === "HERITAGE20" || promoCode === "MUSEUM20") {
            discountPercent = 20;
        } else if (promoCode === "STUDENT10") {
            discountPercent = 10;
        }
        const discountAmount = Math.round((subtotal * discountPercent) / 100);
        const discountedSubtotal = Math.max(0, subtotal - discountAmount);
        const conservationFee = discountedSubtotal > 0 ? Math.round(discountedSubtotal * 0.05) : 0;
        const totalAmount = discountedSubtotal + conservationFee;

        const bookingCode = generateBookingCode();

        const insertBookingStmt = db.prepare(`
            INSERT INTO bookings (
                booking_code,
                user_id,
                museum_id,
                visit_date,
                time_slot,
                adult_count,
                student_count,
                child_count,
                total_amount,
                status
            ) VALUES (
                @booking_code,
                @user_id,
                @museum_id,
                @visit_date,
                @time_slot,
                @adult_count,
                @student_count,
                @child_count,
                @total_amount,
                @status
            )
        `);

        const insertTicketStmt = db.prepare(`
            INSERT INTO booking_tickets (booking_id, ticket_type, quantity, price)
            VALUES (@booking_id, @ticket_type, @quantity, @price)
        `);

        const createBookingTx = db.transaction(() => {
            const result = insertBookingStmt.run({
                booking_code: bookingCode,
                user_id: userId,
                museum_id: museum.id,
                visit_date: visitDate,
                time_slot: timeSlot,
                adult_count: adultCount,
                student_count: studentCount,
                child_count: childCount,
                total_amount: totalAmount,
                status: "confirmed"
            });
            const newBookingId = result.lastInsertRowid;

            if (adultCount > 0) {
                insertTicketStmt.run({ booking_id: newBookingId, ticket_type: "adult", quantity: adultCount, price: prices.adult });
            }
            if (studentCount > 0) {
                insertTicketStmt.run({ booking_id: newBookingId, ticket_type: "student", quantity: studentCount, price: prices.student });
            }
            if (childCount > 0) {
                insertTicketStmt.run({ booking_id: newBookingId, ticket_type: "child", quantity: childCount, price: prices.child });
            }

            return newBookingId;
        });

        const newId = createBookingTx();

        const responseData = {
            booking_id: newId,
            booking_code: bookingCode,
            id: bookingCode,
            user_id: userId,
            museum: {
                id: museum.id,
                name: museum.name,
                city: museum.city,
                category: museum.category,
                image: museum.image,
                address: museum.address
            },
            museumId: museum.id,
            museumName: museum.name,
            museumLocation: `${museum.city}, ${museum.address || ''}`,
            museumImage: museum.image,
            visit_date: visitDate,
            visitDate: visitDate,
            time_slot: timeSlot,
            timeSlot: timeSlot,
            adult_count: adultCount,
            student_count: studentCount,
            child_count: childCount,
            tickets: {
                adult: adultCount,
                student: studentCount,
                child: childCount
            },
            prices,
            addOns,
            subtotal,
            addOnTotal,
            discountAmount,
            conservationFee,
            total_amount: totalAmount,
            totalAmount: totalAmount,
            status: "Upcoming",
            bookingDate: new Date().toISOString().split("T")[0],
            customer: {
                fullName: customer.fullName || (req.user ? req.user.name : "Patron Guest"),
                email: customer.email || (req.user ? req.user.email : "guest@aurum.org"),
                phone: customer.phone || "",
                specialRequests: customer.specialRequests || ""
            }
        };

        res.status(201).json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create booking: " + error.message
        });
    }
});

// ===============================
// GET CURRENT USER'S BOOKINGS (Authenticated)
// ===============================
app.get("/api/bookings/my", authenticateToken, (req, res) => {
    try {
        const bookings = db
            .prepare(`
                SELECT b.*, m.name AS museum_name, m.city AS museum_city, m.image AS museum_image, m.address AS museum_address
                FROM bookings b
                LEFT JOIN museums m ON b.museum_id = m.id
                WHERE b.user_id = ?
                ORDER BY b.id DESC
            `)
            .all(req.user.id);

        const formatted = bookings.map(formatBookingRow);

        res.json({
            success: true,
            count: formatted.length,
            data: formatted
        });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user bookings"
        });
    }
});

// ===============================
// GET BOOKING BY ID OR CODE
// ===============================
app.get("/api/bookings/:id", (req, res) => {
    try {
        const idParam = req.params.id;
        const booking = db
            .prepare(`
                SELECT b.*, m.name AS museum_name, m.city AS museum_city, m.image AS museum_image, m.address AS museum_address
                FROM bookings b
                LEFT JOIN museums m ON b.museum_id = m.id
                WHERE b.id = ? OR b.booking_code = ?
            `)
            .get(idParam, idParam);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.json({
            success: true,
            data: formatBookingRow(booking)
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking"
        });
    }
});

// ===============================
// GET ALL BOOKINGS (Admin Only)
// ===============================
app.get("/api/bookings", authenticateToken, requireAdmin, (req, res) => {
    try {
        const bookings = db
            .prepare(`
                SELECT b.*, m.name AS museum_name, m.city AS museum_city, m.image AS museum_image, m.address AS museum_address
                FROM bookings b
                LEFT JOIN museums m ON b.museum_id = m.id
                ORDER BY b.id DESC
            `)
            .all();

        const formatted = bookings.map(formatBookingRow);

        res.json({
            success: true,
            count: formatted.length,
            data: formatted
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings"
        });
    }
});

// ===============================
// ADMIN ENDPOINTS (Admin Only)
// ===============================

// GET /api/admin/stats
app.get("/api/admin/stats", authenticateToken, requireAdmin, (req, res) => {
    try {
        const totalMuseums = db.prepare("SELECT COUNT(*) AS count FROM museums").get().count;
        const totalBookings = db.prepare("SELECT COUNT(*) AS count FROM bookings").get().count;
        const totalRevenueRow = db.prepare("SELECT COALESCE(SUM(total_amount), 0) AS total FROM bookings WHERE LOWER(status) != 'cancelled'").get();
        const totalRevenue = totalRevenueRow ? totalRevenueRow.total : 0;
        const upcomingBookingsRow = db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE LOWER(status) IN ('confirmed', 'upcoming')").get();
        const upcomingBookings = upcomingBookingsRow ? upcomingBookingsRow.count : 0;
        const totalPatronsRow = db.prepare("SELECT COALESCE(SUM(adult_count + student_count + child_count), 0) AS count FROM bookings WHERE LOWER(status) != 'cancelled'").get();
        const totalPatrons = totalPatronsRow ? totalPatronsRow.count : 0;

        res.json({
            success: true,
            data: {
                totalMuseums,
                totalBookings,
                totalRevenue,
                upcomingBookings,
                totalPatrons
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch admin stats: " + error.message
        });
    }
});

// GET /api/admin/bookings
app.get("/api/admin/bookings", authenticateToken, requireAdmin, (req, res) => {
    try {
        const bookings = db.prepare(`
            SELECT 
                b.id AS booking_id,
                b.booking_code,
                b.user_id,
                b.museum_id,
                b.visit_date,
                b.time_slot,
                b.adult_count,
                b.student_count,
                b.child_count,
                b.total_amount,
                b.status,
                b.created_at,
                m.name AS museum_name,
                m.city AS museum_city,
                m.image AS museum_image,
                m.address AS museum_address,
                u.name AS user_name,
                u.email AS user_email,
                u.phone AS user_phone
            FROM bookings b
            LEFT JOIN museums m ON b.museum_id = m.id
            LEFT JOIN users u ON b.user_id = u.id
            ORDER BY b.id DESC
        `).all();

        const formatted = bookings.map(b => {
            const displayStatus = (b.status === 'confirmed' || b.status === 'upcoming') 
                ? 'Upcoming' 
                : (b.status === 'completed' ? 'Completed' : (b.status === 'cancelled' ? 'Cancelled' : b.status));

            return {
                id: b.booking_code,
                booking_id: b.booking_id,
                booking_code: b.booking_code,
                bookingCode: b.booking_code,
                museum_name: b.museum_name || "Museum Landmark",
                museumName: b.museum_name || "Museum Landmark",
                city: b.museum_city || "",
                museumCity: b.museum_city || "",
                visit_date: b.visit_date,
                visitDate: b.visit_date,
                time_slot: b.time_slot,
                timeSlot: b.time_slot,
                adult_count: b.adult_count || 0,
                student_count: b.student_count || 0,
                child_count: b.child_count || 0,
                total_amount: b.total_amount,
                totalAmount: b.total_amount,
                status: displayStatus,
                created_date: b.created_at,
                created_at: b.created_at,
                bookingDate: b.created_at ? b.created_at.split(' ')[0] : '',
                museum: {
                    id: b.museum_id,
                    name: b.museum_name || "Museum Landmark",
                    city: b.museum_city || "",
                    image: b.museum_image || "",
                    address: b.museum_address || ""
                },
                museumId: b.museum_id,
                museumImage: b.museum_image || "",
                customer: {
                    fullName: b.user_name || "Patron Guest",
                    email: b.user_email || "guest@aurum.org",
                    phone: b.user_phone || ""
                },
                tickets: {
                    adult: b.adult_count || 0,
                    student: b.student_count || 0,
                    child: b.child_count || 0
                }
            };
        });

        res.json({
            success: true,
            count: formatted.length,
            data: formatted
        });
    } catch (error) {
        console.error("Error fetching admin bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch admin bookings: " + error.message
        });
    }
});

// PATCH / PUT /api/admin/bookings/:id/status
const handleStatusUpdate = (req, res) => {
    try {
        const idParam = req.params.id;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: "Status is required." });
        }

        const booking = db.prepare("SELECT id FROM bookings WHERE id = ? OR booking_code = ?").get(idParam, idParam);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        const normalized = status.toLowerCase();
        db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(normalized, booking.id);

        res.json({
            success: true,
            message: `Booking #${idParam} status updated to ${status}.`
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update booking status: " + error.message
        });
    }
};

app.patch("/api/admin/bookings/:id/status", authenticateToken, requireAdmin, handleStatusUpdate);
app.put("/api/admin/bookings/:id/status", authenticateToken, requireAdmin, handleStatusUpdate);

// ===============================
// SERVER
// ===============================
app.listen(PORT, () => {
    console.log(`Aurum backend running on http://localhost:${PORT}`);
});
