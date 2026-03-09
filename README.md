# StreetCats

StreetCats is a web application to report stray cats sightings with an interactive map. Registered users can add their own reports and interact with the community.

**Project:** UNINA "Web Technologies" exam (2024/25) | **Developer:** Gino Pandozzi-Trani

## Prerequisites

Ensure you have installed:
- **Node.js** 18+ - https://nodejs.org/
- **PostgreSQL** 12+ - https://www.postgresql.org/download/
- **Firefox** (for E2E tests) - https://www.mozilla.org/firefox/

## Setup

### 1. Create Database

```bash
psql -U postgres
CREATE DATABASE "TechWeb-24-25";
\q
```

### 2. Import Data

```bash
psql -U postgres -d TechWeb-24-25 -f db.sql
```

### 3. Install Dependencies

**Backend:**
```bash
cd backend
npm install --legacy-peer-deps
```

**Frontend:**
```bash
cd techweb-frontend
npm install --legacy-peer-deps
```

**E2E Tests (optional):**
```bash
cd TestE2E
npm install
npx playwright install firefox
```

### 4. Configure Environment

**Backend `.env` (backend/.env):**
```env
PORT=5000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/TechWeb-24-25
POSTGRES_PASSWORD=postgres
JWT_SECRET=your_super_secret_key_here_min_32_chars
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Get reCAPTCHA keys from: https://www.google.com/recaptcha/admin/create

**Frontend `.env` (techweb-frontend/.env):**
```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### 5. Start Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd techweb-frontend
npm run dev
```

Access at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 6. Run Tests

```bash
cd TestE2E
npm run test:e2e
```

For interactive UI mode:
```bash
npm run test:e2e:ui
```

For tests with browser visible:
```bash
npm run test:e2e:headed
```

## Technologies Used

- **Next.js 15** (React) with Turbopack
- **TypeScript**
- **Node.js + Express**
- **PostgreSQL**
- **Leaflet** - Interactive mapping
- **Playwright** - End-to-end testing
- **JWT + Bcrypt** - Authentication & security
- **Google reCAPTCHA V2** - Bot protection
- **Tailwind CSS + DaisyUI** - Responsive UI

## Special Thanks

A special thank you to all contributors and testers who helped improve this project throughout its development.



