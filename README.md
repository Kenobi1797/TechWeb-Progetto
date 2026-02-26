# StreetCats

StreetCats is a web application to report stray cats sightings around the world with an interactive map and a responsive experience. Registered users can add their own reports and interact with other ones in the community.

This project was realized for the UNINA "Web Technologies" exam, more specifically the 2024/25 one, successfully passing the review with full grades.

**Developer:** Gino Pandozzi-Trani (N86003116)

## Setup

The application requires a PostgreSQL database. We recommend using pgAdmin for the setup.

### 1. Create the Database

Create a new database with the following default settings:

| Setting | Value |
|---------|-------|
| Port | 5432 |
| User | postgres |
| DB Name | TechWeb-24-25 |

> Important: If you wish to use different values or names, you must update the `DATABASE_URL` variable in the `.env` file located inside the `backend` folder.

### 2. Import Data (Restore)

To populate the database, use the restore function in pgAdmin:
- **Format:** `Directory`
- **Filename:** Select the `db.sql` file (located in the root directory)
- **Data Options:** Ensure that `Data`, `Pre-Data`, and `Post-Data` are all selected before restoring

### 3. Installation

You need to install the dependencies for both the Frontend and Backend modules. Open your terminal in each respective folder ("backend" and "techweb-frontend") and run:

```bash
npm install --legacy-peer-deps
```

### 4. .env file setting

To ensure the correct operation of the website, the .env file located in the "backend" folder must be edited, more precisely:

- **JWT_SECRET:** Must be generated, for example using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- **RECAPTCHA_SECRET:** Must be created with Google reCAPTCHA V2 at https://www.google.com/recaptcha/admin/create

Update `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` in the `techweb-frontend/.env` file.

### 5. Starting the Application

Once everything is ready, you can start the application:

```bash
# Backend
cd backend && npm run dev

# Frontend (new terminal)
cd techweb-frontend && npm run dev
```

Access the app at:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Database:** localhost:5432

## Technologies Used

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


