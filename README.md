# StreetCats

StreetCats is a web application to report stray cats sightings around the world with an interactive map and a responsive experience. Registered users can add their own reports and interact with other ones in the community.

This project was realized for the UNINA "Web Technologies" exam, more specifically the 2024/25 one, successfully passing the review with full grades.

**Developer:** Gino Pandozzi-Trani (N86003116)

## Prerequisites

Before starting, ensure you have the following installed:

| Requirement | Version | Installation |
|-------------|---------|--------------|
| **Node.js** | 18.x or higher | https://nodejs.org/ |
| **npm** | 9.x or higher | Included with Node.js |
| **PostgreSQL** | 12 or higher | https://www.postgresql.org/download/ |
| **Firefox** (for E2E tests) | Latest | https://www.mozilla.org/firefox/ |

**Verify installation:**
```bash
node --version
npm --version
psql --version
firefox --version  # For testing
```

## Setup

The application requires a PostgreSQL database. We recommend using pgAdmin for the setup.

### 1. Create the Database

Create a new database with the following default settings:

| Setting | Value |
|---------|-------|
| Port | 5432 |
| User | postgres |
| DB Name | TechWeb-24-25 |

**Via psql command line:**
```bash
psql -U postgres
CREATE DATABASE "TechWeb-24-25";
\q
```

> **Important:** If you wish to use different values or names, you must update the `DATABASE_URL` variable in the `.env` file located inside the `backend` folder.

### 2. Import Data (Restore)

To populate the database with initial data, use the `db.sql` file:

**Via psql command line:**
```bash
psql -U postgres -d TechWeb-24-25 -f db.sql
```

Alternatively, use pgAdmin:
- Open pgAdmin and right-click on your database
- Select "Restore"
- **Format:** `All Files` (*.*)
- **Filename:** Select the `db.sql` file (located in the root directory)

### 3. Installation

Install dependencies for both Frontend and Backend modules.

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

**E2E Tests (optional, only if you plan to run tests):**
```bash
cd TestE2E
npm install
npx playwright install firefox
```

> **Note:** The `npx playwright install firefox` command downloads the Firefox browser binary needed for E2E testing. This is separate from your system Firefox installation.

### 4. Environment Configuration

Configure the `.env` files for both backend and frontend.

**Backend `.env` file** (located in `backend/.env`):

**Backend `.env` file** (located in `backend/.env`):

```env
# Application
PORT=5000

# Database
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/TechWeb-24-25
POSTGRES_PASSWORD=postgres

# Authentication
JWT_SECRET=your_super_secret_key_here_min_32_chars
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# reCAPTCHA (Google reCAPTCHA V2)
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
# Get from: https://www.google.com/recaptcha/admin/create

# External APIs (optional, for features)
CATAPI_URL=your_cat_api_key
MAPTILER_KEY=your_maptiler_key
GEOAPIFY_API_KEY=your_geoapify_key
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Create reCAPTCHA keys:**
1. Go to https://www.google.com/recaptcha/admin/create
2. Choose reCAPTCHA V2 (Checkbox)
3. Copy the Site Key and Secret Key
4. Update them in `backend/.env` and `techweb-frontend/.env`

**Frontend `.env` file** (located in `techweb-frontend/.env`):

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

### 5. Starting the Application

You need **3 terminal windows** for full development setup:

**Terminal 1 - PostgreSQL (if not running as a service):**
```bash
# Make sure PostgreSQL server is running
# Linux: sudo service postgresql start
# macOS: brew services start postgresql
# Windows: Start PostgreSQL service from Services
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# Backend will run on http://localhost:5000
```

**Terminal 3 - Frontend:**
```bash
cd techweb-frontend
npm run dev
# Frontend will run on http://localhost:3000
```

**Access the application:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Database:** localhost:5432

### 6. Running Tests (E2E with Playwright)

Before running tests, ensure the application is running (see step 5).

**Install Playwright and Firefox (one-time setup):**
```bash
cd TestE2E
npm install
npx playwright install firefox
```

**Run all tests:**
```bash
cd TestE2E
npm run test:e2e
```

**Run tests with UI mode (interactive):**
```bash
npm run test:e2e:ui
```

**Run tests with browser visible:**
```bash
npm run test:e2e:headed
```

**Test output:**
- Test results are saved in `TestE2E/test-results/`
- Screenshots and error context are captured automatically

> **Note:** Tests require both frontend and backend running. The configuration automatically handles starting the frontend server if needed.

## Setup with Docker (Alternative)

If you prefer to use Docker instead:

## Setup with Docker (Alternative)

If you prefer to use Docker instead:

**Prerequisites:**
- Docker and Docker Compose installed: https://www.docker.com/products/docker-desktop/

**Run with Docker Compose:**
```bash
# From the root directory
docker compose up --build
```

This will start:
- PostgreSQL database (port 5432)
- Backend API (port 5000)
- Frontend (port 3000)

**Stop the containers:**
```bash
docker compose down
```

> **Note:** For E2E tests, you'll still need to install Playwright locally as shown in step 6.

## Troubleshooting

### Main Technologies
- **Next.js 15** (React) with Turbopack
- **TypeScript**
- **Node.js + Express**
- **PostgreSQL**
- **Docker & Docker Compose**

### Frontend Dependencies
- **Leaflet** - Interactive mapping library
- **React Markdown** - Safe markdown rendering
- **Tailwind CSS** - Responsive styling with DaisyUI
- **React Image Cropper** - Image manipulation

### Backend Dependencies
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing and security
- **Google reCAPTCHA V2** - Bot protection for registration
- **Node-cron** - Scheduled task automation
- **Cors** - Cross-origin resource sharing
- **Helmet** - HTTP security headers
- **Joi** - Data validation

### Testing and Development
- **Playwright** - End-to-end testing
- **ESLint + TypeScript** - Code linting and type checking

## Features

- Interactive map with real-time stray cat sightings
- User authentication with JWT + reCAPTCHA V2 protection
- Photo upload and management with image cropping
- Comment system for community interaction
- Advanced search and filtering capabilities
- Fully responsive design (desktop, tablet, mobile)
- Secure REST API with rate limiting
- Input sanitization and XSS protection
- Automated data management with cron jobs
- Comprehensive E2E test coverage

## Special Thanks

A special thank you to all contributors and testers who helped improve this project throughout its development, providing valuable feedback and suggestions.


