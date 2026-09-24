# 🎓 Campus Event Management REST API & Web Portal (PS P01)

A secure, scalable RESTful API and responsive Web Interface for college event discovery, registrations, and administrative supervision. Built for internal backend hackathons adhering strictly to production-grade Node.js and MongoDB architectural patterns.

---

## 🚀 Key Features

- **Authentication & Security:**
  - Stateless JWT authentication delivered strictly through **HTTP-Only Cookies** (`httpOnly: true`, `sameSite: 'lax'`, `secure: production`).
  - Strong password hashing with **bcryptjs** (10 salt rounds) with automated pre-save Mongoose hooks.
  - Strict exclusion of passwords in JSON responses (`select: false` & `toJSON` sanitization).
- **Role-Based Access Control (RBAC):**
  - Granular `allowRoles('ADMIN')` and `protect` middleware guards.
  - **USER (Students):** Discover published events, register for available seats, view personal registration history, cancel eligible tickets.
  - **ADMIN (Organizers):** Create events, manage draft/published/cancelled lifecycles, inspect campus-wide rosters, update student attendance/registration status.
- **Strict Business Rules Enforcement:**
  - 🚫 **Cancelled/Draft Events:** Registrations are strictly rejected (400 Bad Request).
  - 🛑 **Capacity Protection:** Dynamic computation of active registrations against maximum capacity (409 Conflict if full).
  - 🔒 **Duplicate Protection:** Compound unique database index on `(user, event)` prevents double booking.
  - 🛡️ **Resource Ownership Isolation:** Students can only inspect and cancel their *own* registrations (403 Forbidden).
- **Centralized Robust Error Handling:**
  - Standardized JSON responses `{ success, statusCode, message, errors }`.
  - Automated translation for Mongoose `CastError` (400), `DuplicateKey 11000` (409), `ValidationError` (400), and JWT expiration/tampering (401).

---

## 📂 Project Architecture

```
campus-event-management/
├── public/                 # Interactive Student & Admin Web Portal (HTML/CSS/JS)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── src/
│   ├── config/
│   │   └── db.js           # Mongoose MongoDB Connection
│   ├── controllers/        # Request/Response Orchestration
│   │   ├── auth.controller.js
│   │   ├── event.controller.js
│   │   └── registration.controller.js
│   ├── middleware/         # Security, RBAC, Validation & Error Handlers
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   ├── models/             # Mongoose Schemas with Indexes
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Registration.js
│   ├── routes/             # REST Endpoints Mounting
│   │   ├── auth.routes.js
│   │   ├── event.routes.js
│   │   ├── registration.routes.js
│   │   └── admin.routes.js
│   ├── services/           # Pure Business Logic Layer
│   │   ├── auth.service.js
│   │   ├── event.service.js
│   │   └── registration.service.js
│   ├── utils/
│   │   └── AppError.js     # Operational Error Wrapper
│   ├── validators/         # Input Validation Rules (express-validator)
│   │   ├── auth.validator.js
│   │   ├── event.validator.js
│   │   └── registration.validator.js
│   ├── app.js              # Express Application Builder
│   └── server.js           # Database Loader & Server Startup
├── src/scripts/
│   └── seed.js             # Database Seeding Script
├── .env                    # Environment Variables
├── .env.example
├── .gitignore
├── package.json
├── postman_collection.json # Postman Test Suite
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Clone & Install Dependencies
```bash
# Navigate to the project root
cd "C:\Users\RAM\OneDrive\Desktop\clg"

# Install dependencies
npm install
```

### 3. Environment Variables Configuration
Create a `.env` file in the root directory (already pre-configured):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/campus_event_management
JWT_SECRET=super_secret_campus_event_management_jwt_key_2026_hackathon
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN_DAYS=7
```

### 4. Seed Database with Test Data
Populates the database with 1 Administrator, 3 Students, multiple events in varying states (DRAFT, PUBLISHED, NEARLY FULL, CANCELLED), and sample registrations:
```bash
npm run seed
```

### 5. Launch the Server
```bash
# Production mode
npm start

# Development mode (with live reload)
npm run dev
```

Visit the interactive Web Portal in your browser at: **`http://localhost:5000`**

---

## 🔑 Test Credentials (from Seeder)

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **ADMIN** | Campus Administrator | `admin@campus.edu` | `AdminPassword123` |
| **USER** | Rahul Sharma | `rahul@student.edu` | `StudentPassword123` |
| **USER** | Priya Patel | `priya@student.edu` | `StudentPassword123` |
| **USER** | Amit Verma | `amit@student.edu` | `StudentPassword123` |

---

## 📡 REST API Endpoint Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Create student/admin account; returns HTTP-only cookie |
| `POST` | `/api/auth/login` | Public | Authenticate user; sets JWT HTTP-only cookie |
| `POST` | `/api/auth/logout` | Public | Clears authentication cookie |
| `GET` | `/api/auth/me` | Logged In | Retrieve current user profile |

### 📅 Events (`/api/events`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public/User | View all `PUBLISHED` events with real-time seat counts |
| `GET` | `/api/events/:id` | Public/User | View details for a specific event |
| `POST` | `/api/events` | **ADMIN** | Create new event (`DRAFT` or `PUBLISHED`) |
| `PATCH` | `/api/events/:id` | **ADMIN** | Update event details/capacity |
| `PATCH` | `/api/events/:id/publish` | **ADMIN** | Publish draft event to students |
| `PATCH` | `/api/events/:id/cancel` | **ADMIN** | Cancel event and block new registrations |

### 🎟️ Registrations (`/api/registrations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/registrations/events/:eventId/register` | **USER** | Register for event (enforces capacity & duplicate rules) |
| `GET` | `/api/registrations/my` | **USER** | Retrieve current student's personal registrations |
| `PATCH` | `/api/registrations/:id/cancel` | **USER** | Cancel own registration ticket |

### 👑 Admin Management (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/registrations` | **ADMIN** | View complete campus registration roster |
| `PATCH` | `/api/admin/registrations/:id/status` | **ADMIN** | Update registration status (`REGISTERED`, `ATTENDED`, `CANCELLED`) |

---

## 🧪 Postman Testing

1. Open Postman.
2. Click **Import** and select `postman_collection.json` located in the project root.
3. The collection uses the `{{baseUrl}}` variable defaulting to `http://localhost:5000/api`.
4. Cookies are handled automatically by Postman's cookie jar.
5. Execute requests sequentially across Authentication, Events, Registrations, and Admin folders to test both success (200, 201) and negative failure cases (400, 401, 403, 404, 409).
