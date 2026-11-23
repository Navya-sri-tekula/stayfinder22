# 🏠 StayFinder - Location-Based Hostel, PG, Hotel & Room Discovery Platform

**StayFinder** is a modern full-stack web application designed for students, working professionals, and travelers to discover nearby hostels, PGs, boutique hotels, and independent rooms using interactive OpenStreetMap maps, live vacant bed counts, weekly food menus, transparent curfew rules, and honest resident reviews.

Property owners can register, list their properties, pin exact coordinates on an interactive map, manage room capacities, update occupied/vacant beds, configure day-by-day food menus, and establish house rules.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (JavaScript, JSX)
- **Routing**: React Router v6
- **HTTP Client**: Axios with JWT interceptors
- **Interactive Maps**: Leaflet + React-Leaflet + OpenStreetMap
- **Icons**: Lucide React
- **Styling**: Custom responsive CSS design system (mobile-first, cards, badges, modal dialogs)
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Authentication**: JSON Web Tokens (JWT) + bcrypt password hashing
- **File Uploads**: Multer memory storage + Neon Object Storage (S3-compatible persistent image URLs; no writes to Vercel's read-only filesystem)
- **ORM / Database**: Sequelize ORM with Neon PostgreSQL in production; local SQLite fallback only for development
- **Architecture**: Clean layered architecture (Controllers, Services, Models, Routes, Middleware, Utils)

---

## 🚀 Key Features

### 👤 User / Tenant Features
- **Booking Requests**: Tenants submit date-based room/bed requests; owners approve or reject; tenants can track or cancel requests. No online payments are collected.
- **User Authentication**: Secure registration and login with bcrypt-hashed passwords and JWT tokens.
- **Modern Homepage**: Hero search bar, stay categories, popular tech hubs (Bangalore, Hyderabad, Pune, Mumbai), and verified featured stays.
- **Advanced Search & Filtering**:
  - Filter by Stay Type: **Hostel**, **PG / Coliving**, **Hotel**, **Private Room**
  - Filter by Price Range: Minimum and Maximum price
  - Filter by Sharing: **Single**, **2 Sharing**, **3 Sharing**, **4 Sharing**
  - Filter by Facilities: **Food Available**, **WiFi**, **AC**, **Parking**, **Laundry**
  - Filter by Distance: **Within 1 km, 3 km, 5 km, 10 km** from your position or GPS location
- **Interactive Leaflet Map**:
  - OpenStreetMap tiles with custom markers for every stay.
  - Marker popups with thumbnail, price, rating, address, and quick link to details.
  - Interactive radius circle overlay centered on your coordinates.
  - Toggle between **Split View** (list + sticky map), **Full Map View**, or **Grid View**.
- **Comprehensive Property Details**:
  - Photo gallery with thumbnail selector.
  - Room categories with **Total Beds**, **Occupied Beds**, and **Vacant Beds** badge (`Available = Total - Occupied`).
  - Weekly day-by-day **Food Menu** (Breakfast, Lunch, Snacks, Dinner) with serving hours.
  - Transparent **Outing Timings & Rules** (Entry time, Curfew, Visitor policy, Weekend rules).
  - Leaflet neighborhood map pin.
  - Owner / host contact card with direct phone and email links.
- **Wishlist**: Save favorite stays with heart toggles, preventing duplicate entries.
- **Ratings & Reviews**: 1 to 5 star ratings with detailed comments and average score calculation.

### 🏢 Property Owner Features
- **Owner Dashboard**:
  - Key business metrics: **Total Properties**, **Total Rooms**, **Vacant Beds**, **Occupied Beds**, and **Review Count**.
  - Property listing overview with real-time occupancy indicators.
- **Add & Edit Property Listings**:
  - Name, type, description, address, city, state, pincode, starting price.
  - **Interactive Map Picker**: Click or drag a pin on the OpenStreetMap to set exact latitude and longitude.
  - Upload multiple property photos via Multer.
  - Select facilities and define initial house rules.
- **Room & Bed Management**:
  - Add room numbers, sharing types, prices, AC, and attached bathrooms.
  - Manage bed inventory: validates that occupied beds cannot exceed total beds.
  - Quick **Check-In (+)** and **Check-Out (-)** buttons for 1-click bed occupancy updates.
- **Weekly Food Menu Management**:
  - Add, edit, or delete meal items for each day of the week (Monday through Sunday) with start and end times.
- **Facilities & House Rules Configuration**:
  - Dynamically add and remove facilities (WiFi, AC, Gym, RO Water, Biometrics, etc.).
  - Define custom rules (Gate timings, Curfews, Visitor policies, Noise policies).

---

## 🗄️ Relational Database Schema

The production database uses Neon PostgreSQL through Sequelize ORM:

```
users
├── id (PK, INT AUTO_INCREMENT)
├── name (VARCHAR)
├── email (VARCHAR UNIQUE)
├── phone (VARCHAR)
├── password (VARCHAR HASHED)
├── role (ENUM: 'user', 'owner')
└── created_at / updated_at

properties
├── id (PK, INT AUTO_INCREMENT)
├── owner_id (FK -> users.id, ON DELETE CASCADE)
├── name (VARCHAR)
├── type (ENUM: 'hostel', 'pg', 'hotel', 'room')
├── description (TEXT)
├── address (VARCHAR)
├── city (VARCHAR)
├── state (VARCHAR)
├── pincode (VARCHAR)
├── latitude (DECIMAL 10,8)
├── longitude (DECIMAL 11,8)
├── starting_price (DECIMAL 10,2)
├── status (ENUM: 'available', 'full', 'maintenance')
└── created_at / updated_at

property_images
├── id (PK, INT AUTO_INCREMENT)
├── property_id (FK -> properties.id, ON DELETE CASCADE)
└── image_url (VARCHAR 1000)

rooms
├── id (PK, INT AUTO_INCREMENT)
├── property_id (FK -> properties.id, ON DELETE CASCADE)
├── room_number (VARCHAR)
├── sharing_type (VARCHAR)
├── total_beds (INT)
├── occupied_beds (INT)
├── price (DECIMAL 10,2)
├── ac (BOOLEAN)
├── attached_bathroom (BOOLEAN)
└── description (TEXT)
* available_beds = total_beds - occupied_beds

facilities
├── id (PK, INT AUTO_INCREMENT)
├── property_id (FK -> properties.id, ON DELETE CASCADE)
└── facility_name (VARCHAR)

food_menu
├── id (PK, INT AUTO_INCREMENT)
├── property_id (FK -> properties.id, ON DELETE CASCADE)
├── day (VARCHAR)
├── meal_type (VARCHAR)
├── menu (TEXT)
├── start_time (VARCHAR)
└── end_time (VARCHAR)

property_rules
├── id (PK, INT AUTO_INCREMENT)
├── property_id (FK -> properties.id, ON DELETE CASCADE)
├── rule_name (VARCHAR)
└── rule_value (VARCHAR)

wishlist
├── id (PK, INT AUTO_INCREMENT)
├── user_id (FK -> users.id, ON DELETE CASCADE)
├── property_id (FK -> properties.id, ON DELETE CASCADE)
└── UNIQUE(user_id, property_id)

reviews
├── id (PK, INT AUTO_INCREMENT)
├── user_id (FK -> users.id, ON DELETE CASCADE)
├── property_id (FK -> properties.id, ON DELETE CASCADE)
├── rating (INT, 1-5)
├── comment (TEXT)
└── created_at
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js** (v18 or newer recommended, tested on v22)
- **MySQL** (Optional: Sequelize connects automatically to MySQL if running; if MySQL is not running locally, it gracefully connects to SQLite so you can test right away!)

### 2. Environment Setup
The backend environment file is configured at `backend/.env`. You can edit it if you want to connect to a specific MySQL instance:

```env
PORT=5000
NODE_ENV=development

# MySQL Database Configuration
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stayfinder_db
DB_USER=root
DB_PASSWORD=

# JWT Secrets
JWT_SECRET=stayfinder_jwt_secure_secret_key_2026
JWT_EXPIRES_IN=7d

# Optional Neon Object Storage (Falls back to local /uploads/ if omitted)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Install Dependencies
```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### 4. Seed Demo Data
Populate the database with verified hostels, PGs, rooms, food menus, and reviews:
```bash
cd backend
npm run seed
```

### 5. Start the Application
Run the backend server:
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

In a second terminal, run the frontend client:
```bash
cd frontend
npm run dev
# Web application available on http://localhost:3000
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Access / Purpose |
|------|-------|----------|------------------|
| **Property Owner** | `owner@stayfinder.com` | `owner123` | Access Owner Dashboard, create listings, manage rooms, beds, food menus, rules |
| **Property Owner 2** | `priya@stayfinder.com` | `owner123` | Secondary owner managing Hyderabad & Pune properties |
| **User (Tenant)** | `user@stayfinder.com` | `user123` | Search stays, apply distance/price filters, save to wishlist, write reviews |
| **User 2** | `sneha@stayfinder.com` | `user123` | Secondary user account |

*(On the Login page, there are quick 1-click **Demo Owner** and **Demo User** buttons for instant testing).*

---

## 📡 REST API Reference

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user or owner | No |
| `POST` | `/api/auth/login` | Login user/owner & return JWT | No |
| `GET` | `/api/auth/profile` | Get current user profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile information | Yes |

### Properties
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/properties` | List & filter properties (supports search, city, type, price, sharing, facilities, radius, sorting, pagination) | Optional |
| `GET` | `/api/properties/:id` | Get complete property details with rooms, food, rules, reviews | Optional |
| `POST` | `/api/properties` | Create new property listing | Owner |
| `PUT` | `/api/properties/:id` | Update property listing | Owner |
| `DELETE` | `/api/properties/:id` | Delete property listing | Owner |
| `POST` | `/api/properties/:id/images` | Upload photos via Multer | Owner |
| `DELETE` | `/api/properties/:id/images/:imageId` | Remove property photo | Owner |
| `GET` | `/api/properties/owner/my-properties` | Get owner's listings with room & bed stats | Owner |
| `GET` | `/api/properties/owner/dashboard-stats` | Get owner dashboard counters | Owner |
| `POST` | `/api/properties/:propertyId/facilities` | Add facility to property | Owner |
| `DELETE` | `/api/properties/:propertyId/facilities/:id` | Remove facility | Owner |
| `POST` | `/api/properties/:propertyId/rules` | Add house rule to property | Owner |
| `DELETE` | `/api/properties/:propertyId/rules/:id` | Remove house rule | Owner |

### Rooms & Bed Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/properties/:propertyId/rooms` | Get all rooms for a property | No |
| `POST` | `/api/rooms` | Add room (room_number, sharing_type, total_beds, occupied_beds, price, ac, attached_bathroom) | Owner |
| `PUT` | `/api/rooms/:id` | Update room details & occupied beds | Owner |
| `DELETE` | `/api/rooms/:id` | Delete room | Owner |

### Food Menu
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/properties/:propertyId/food` | Get weekly food menu | No |
| `POST` | `/api/food` | Add meal item (day, meal_type, menu, start_time, end_time) | Owner |
| `PUT` | `/api/food/:id` | Update meal item | Owner |
| `DELETE` | `/api/food/:id` | Delete meal item | Owner |

### Wishlist
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/wishlist` | Get logged-in user's saved stays | Yes |
| `POST` | `/api/wishlist` | Save property to wishlist (prevents duplicates) | Yes |
| `DELETE` | `/api/wishlist/:propertyId` | Remove property from wishlist | Yes |

### Reviews & Ratings
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/properties/:propertyId/reviews` | Get reviews and average rating | No |
| `POST` | `/api/reviews` | Post a rating (1-5) and review | Yes |
| `DELETE` | `/api/reviews/:id` | Delete review | Yes (Owner of review) |

## Production deployment configuration

- **Database:** Neon PostgreSQL using a pooled connection string in the backend Vercel project's `DATABASE_URL`.
- **Image storage:** Neon Object Storage bucket `stayfinder-images` with public-read object URLs and branch-scoped S3 credentials stored only in Vercel environment variables.
- **Owner registration:** Property-owner signup requires the private `OWNER_REGISTRATION_CODE`; regular tenant signup does not.
- **API routing:** The frontend Vercel project proxies `/api/*` requests to the backend project, so the browser uses same-origin API requests.
- **Payments:** Not enabled; booking requests are submitted to owners for approval or rejection.

Required backend environment keys are documented in `backend/.env.example`. Never commit production connection strings, JWT secrets, storage credentials, or the owner invitation code.
