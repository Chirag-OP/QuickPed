# QuickPed 🚲

---

## 🏗 System Architecture

The project has been cleanly separated into an isolated full-stack monorepo:

### 📱 Frontend (`/frontend`)
Built with **React**, **Vite**, and **TailwindCSS**.
- **PWA Ready**: Mobile-first responsive design, easily installable as a web app.
- **Native Routing**: Powered by `react-router-dom` for reliable hardware back-button support and native URL navigation.
- **Gatekeeper Auth**: A strict `<RootGatekeeper>` that automatically redirects users based on their active JWT roles (`VERIFIED_RIDER` vs `SUPER_ADMIN`).
- **Student App**: Interactive Maps, QR Scanners, Live Ride Tracking, Digital Wallet, and Issue Reporting.
- **Operator Dashboard**: Complete management panels for Fleets, Users, Docks, Dynamic Pricing, and Revenue Reports.

### ⚙️ Backend (`/backend`)
Built with **NestJS**, **Prisma ORM**, and **PostgreSQL (Supabase)**.
- **Stateless Authentication**: JWT-based auth perfectly mapping users to `GUEST_RIDER`, `VERIFIED_RIDER`, `ADMIN`, or `SUPER_ADMIN` roles.
- **High-Performance OTP System**: 
  - "Fire and forget" non-blocking SMS dispatch for sub-100ms API response times.
  - Active 60-second cooldown rate-limiting.
  - 3-strike brute-force account lockouts.
- **Strict Data Integrity**: E.164 phone string normalization injected before any Prisma transaction, completely eliminating duplicate database rows.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **PostgreSQL**: Running locally or via Supabase
- **Package Manager**: `npm`

### 1. Start the Backend
Navigate to the backend directory, install dependencies, and sync the Prisma schema:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```
*The NestJS server will start on `http://127.0.0.1:3000`.*

### 2. Start the Frontend
In a new terminal instance, launch the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
*Vite proxy is strictly bound to `http://127.0.0.1:3000` to prevent Node.js IPv6 resolution latency bugs.*

---

## 🛡 Security & Compliance
QuickPed enforces SOLID backend architectural principles. The Database schema uses native constraints (`@unique`, `@id`) to manage `User` and `OtpTracker` models. JWT payloads strictly adhere to predefined contract modules, and React components utilize locked internal logic mapped to `useNavigate()`, guaranteeing a completely isolated UI freeze during structural updates.

---

*QuickPed – Revolutionizing Campus Commutes.*
