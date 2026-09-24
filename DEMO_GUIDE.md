# 🎤 5-Minute Technical Demo Script & Viva Q&A Guide

Use this document to prepare for and ace your hackathon presentation and viva session with judges!

---

## ⏱️ 5-Minute Demonstration Outline

### **Minute 1: Introduction & Architecture (The "30,000-Foot View")**
> *"Hello judges! For Problem Statement P01 (Campus Event Management), we built a production-grade REST API and Web Portal using Node.js, Express, MongoDB, and Mongoose. Our architecture strictly follows the Controller-Service-Repository pattern. Express handles incoming HTTP requests, passes them through our authentication, authorization, and validation middlewares, delegates business rules to our Service layer, and queries MongoDB via Mongoose."*

### **Minute 2: Security & Authentication (JWT + HTTP-Only Cookies)**
> *"For security, user passwords are automatically hashed with bcrypt using 10 salt rounds inside a Mongoose pre-save hook. When a student or administrator logs in, we generate a signed JSON Web Token and transmit it exclusively in an **HTTP-only, SameSite cookie**. This completely eliminates Cross-Site Scripting (XSS) token theft vulnerabilities because client-side JavaScript cannot read document cookies."*

### **Minute 3: Role-Based Access Control (RBAC)**
> *"We implemented a two-tier RBAC system:
> 1. **Students (USER):** Can discover published campus events, register for tickets, and view/cancel only their own registrations.
> 2. **Administrators (ADMIN):** Can create and update events, toggle DRAFT, PUBLISHED, and CANCELLED statuses, and view the entire campus registration roster.
> We enforce this via our `protect` token verification middleware and `allowRoles('ADMIN')` authorization middleware."*

### **Minute 4: Business Rules & Concurrency Handling**
> *"Let's examine the core business rules:
> 1. **Cancelled & Draft Events:** Students cannot register for cancelled or draft events; our service immediately throws a 400 Bad Request.
> 2. **Capacity Limit:** Before registering, we calculate active registrations (`status: REGISTERED`). If capacity is reached, we return a 409 Conflict.
> 3. **Duplicate Prevention:** We placed a compound unique index on `{ user: 1, event: 1 }` in MongoDB to prevent double registration at the database level.
> 4. **Resource Ownership:** Students can only cancel registrations they own; attempting to cancel another student's registration results in a 403 Forbidden."*

### **Minute 5: Centralized Error Handling & Live Demo**
> *"Finally, we implemented centralized error handling with a custom `AppError` class and an Express error middleware that translates MongoDB validation errors, CastErrors, duplicate key errors, and JWT expiration into uniform JSON responses. Let me demonstrate the web portal and our Postman test suite!"*

---

## ❓ Top Viva Questions & Model Answers

### **Q1: Why did you store the JWT in an HTTP-only cookie instead of localStorage?**
* **Answer:** Storing JWTs in `localStorage` makes them vulnerable to **Cross-Site Scripting (XSS)** attacks. If malicious third-party script executes in the browser, it can read `localStorage.getItem('token')` and hijack the account. With an `httpOnly: true` cookie, the browser automatically attaches the cookie to requests but forbids any JavaScript code from accessing `document.cookie`.

### **Q2: Why did you separate `app.js` and `server.js`?**
* **Answer:** Separation of concerns. `app.js` is responsible solely for configuring Express middlewares, routes, and error handlers without binding to a network port. `server.js` handles environment variables, database connections, and calls `app.listen()`. This separation makes it easy to run automated integration tests (e.g. using Supertest) without starting a live HTTP server on a port.

### **Q3: What is the difference between Authentication and Authorization?**
* **Answer:** 
  * **Authentication (`auth.middleware.js`):** Verifies *who* you are (identity verification via JWT token).
  * **Authorization (`role.middleware.js`):** Determines *what permissions* you have (e.g., checking if `req.user.role === 'ADMIN'`).

### **Q4: How does bcrypt hashing protect passwords, and what is the salt?**
* **Answer:** Passwords should never be stored in plain text. `bcrypt` is an adaptive one-way hashing function based on the Blowfish cipher. It generates a random string called a **salt** and incorporates it into the hash. The salt ensures that two users with identical passwords will have completely different hashes, preventing rainbow table and dictionary attacks.

### **Q5: How did you design database relationships in MongoDB?**
* **Answer:** We have a **Many-to-Many** relationship between Users and Events, modeled through an intermediary `Registration` collection (Reference Relationship):
  * `User 1 ---- * Registration * ---- 1 Event`
  * Each `Registration` document stores `user: ObjectId` (ref 'User') and `event: ObjectId` (ref 'Event').
  * We use Mongoose `.populate('user')` and `.populate('event')` when joining data.

### **Q6: How do you prevent a user from registering twice for the same event?**
* **Answer:** We implement defense-in-depth:
  1. **Application Layer (Service):** We query `Registration.findOne({ user: userId, event: eventId, status: 'REGISTERED' })` and reject with 409 Conflict if found.
  2. **Database Layer (Index):** We defined a compound unique index: `registrationSchema.index({ user: 1, event: 1 }, { unique: true })`. Even under concurrent requests, MongoDB will reject duplicate document insertions with error code 11000.

### **Q7: What happens to registrations when an admin cancels an event?**
* **Answer:** The event's status is set to `CANCELLED`. In our system, existing registration documents are preserved for auditing and historical records, but all future registration attempts are blocked with a clear 400 error message stating that the event was cancelled.

### **Q8: What is the middleware execution sequence for a protected admin request?**
* **Answer:**
  1. `cors()` & `express.json()` & `cookieParser()`
  2. `protect` middleware: extracts cookie, verifies JWT, loads user from DB, sets `req.user`.
  3. `allowRoles('ADMIN')` middleware: verifies `req.user.role === 'ADMIN'`.
  4. `validate` middleware: runs `express-validator` checks on body/params.
  5. Controller & Service: executes business logic.
  6. Centralized `errorHandler` (if any error is passed to `next(err)`).
