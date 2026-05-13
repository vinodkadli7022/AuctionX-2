# 🏏 IPL Auction Platform

A production-grade, real-time sports tech platform that replicates the IPL auction experience digitally.

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18 & Vite** | Fast, modern frontend SPA |
| **Zustand** | Global state management |
| **Tailwind CSS** | Styling and design system |
| **Node.js & Express** | REST API Backend |
| **Socket.io** | Real-time bi-directional events |
| **PostgreSQL** | Primary relational database |
| **Redis** | Distributed locks & live state |
| **Cloudinary** | Player photo storage |
| **Docker** | Containerization |

---

## 🏗️ Architecture

```
Client (Franchise/Auctioneer/Spectator)
      |
      | (HTTP & WebSockets)
      v
Node.js + Express + Socket.io Server  <--->  Redis (State & Distributed Locks)
      |
      | (pg)
      v
PostgreSQL Database
```

---

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd auctionX
   ```

2. **Start external services (PostgreSQL & Redis):**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Update values if needed
   
   # Run migrations
   npm run migrate
   
   # Seed the database
   npm run seed
   
   # Start the server
   npm run dev
   ```

4. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Auctioneer** | `auctioneer@auctionx.in` | `Auctioneer@123` |
| **Franchise (MI)** | `mi@auctionx.in` | `Franchise@123` |
| **Franchise (CSK)**| `csk@auctionx.in` | `Franchise@123` |
| **Franchise (RCB)**| `rcb@auctionx.in` | `Franchise@123` |
| **Franchise (KKR)**| `kkr@auctionx.in` | `Franchise@123` |
| **Franchise (DC)** | `dc@auctionx.in` | `Franchise@123` |
| **Franchise (RR)** | `rr@auctionx.in` | `Franchise@123` |
| **Franchise (PBKS)**| `pbks@auctionx.in`| `Franchise@123` |
| **Franchise (SRH)**| `srh@auctionx.in` | `Franchise@123` |

---

## 📡 API Documentation

| Method | Endpoint | Auth | Description | Body |
|--------|----------|------|-------------|------|
| POST | `/api/auth/login` | None | Login to account | `{ email, password }` |
| POST | `/api/auth/logout` | Valid JWT | Logout account | None |
| POST | `/api/auth/refresh`| Cookie | Refresh access token | None |
| GET | `/api/players` | Valid JWT | Get paginated players | Query params |
| POST | `/api/players/bulk`| Auctioneer | Bulk upload players | CSV File |
| GET | `/api/franchises` | None | Get all franchises | None |
| GET | `/api/auction/session` | None | Get live session state | None |
| POST | `/api/auction/session/start`| Auctioneer| Start session | `{ name }` |
| POST | `/api/auction/nominate/:id` | Auctioneer| Nominate player | None |
| POST | `/api/auction/sold`| Auctioneer | Mark player sold | None |
| POST | `/api/auction/unsold`| Auctioneer | Mark player unsold | None |

---

## ☁️ Deployment Guide

### Vercel (Frontend)
1. Import the repository into Vercel.
2. Set the Framework Preset to Vite.
3. Set the Root Directory to `frontend`.
4. Add environment variables:
   - `VITE_API_URL` (e.g., `https://auctionx-api.onrender.com/api`)
   - `VITE_SOCKET_URL` (e.g., `https://auctionx-api.onrender.com`)
5. Click **Deploy**.

### Render (Backend)
1. Create a new Web Service on Render from the repository.
2. Choose **Docker** as the runtime.
3. Set the Root Directory to `backend`.
4. Add all environment variables from `.env.example`.
5. Connect to Supabase PostgreSQL and Upstash Redis.
6. Deploy the service.
