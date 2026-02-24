# 🏗️ Architettura Tecnica - StreetCats

## Panoramica

StreetCats è un'applicazione **full-stack** moderna basata su:
- **Frontend:** Next.js 15 + React 19 (TypeScript)
- **Backend:** Express.js + Node.js (TypeScript)
- **Database:** PostgreSQL 18
- **Container:** Docker + Docker Compose

---

## 📊 Diagramma Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                          │
│  (Chrome, Firefox, Safari, Edge - Desktop/Mobile)          │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS
        ┌────────────┴─────────────┐
        │                          │
   ┌────▼──────────────┐  ┌──────▼────────────────┐
   │  NEXT.JS FRONTEND  │  │  STATIC ASSETS       │
   │  (React + TypeScript)  │  (CSS, Images, JS)  │
   │                    │  │                      │
   │ • Pages           │  │ • Served via CDN     │
   │ • Components      │  │ • Cache optimized    │
   │ • API Client      │  │                      │
   │ • Authentication  │  │                      │
   │ • Maps (Leaflet)  │  │                      │
   └────┬──────────────┘  └──────────────────────┘
        │
        │ REST API (JSON)
        │ Port: 3000 → 5000
        │
   ┌────▼──────────────────────────────────────────┐
   │      EXPRESS.JS REST API (Backend)             │
   │      (Node.js + TypeScript on port 5000)       │
   │                                                │
   │  ┌──────────────────────────────────────────┐ │
   │  │  ROUTES LAYER                           │ │
   │  │  • /auth (register, login, logout)      │ │
   │  │  • /cats (CRUD operations)              │ │
   │  │  • /comments (CRUD operations)          │ │
   │  │  • /geocode (address → coordinates)     │ │
   │  └──────────────────────────────────────────┘ │
   │            ↓                                   │
   │  ┌──────────────────────────────────────────┐ │
   │  │  MIDDLEWARE LAYER                        │ │
   │  │  • CORS (Cross-Origin Resource Sharing) │ │
   │  │  • JWT Authentication                    │ │
   │  │  • ReCAPTCHA Validation                  │ │
   │  │  • Rate Limiting                         │ │
   │  │  • Compression (gzip)                    │ │
   │  │  • Request Logging                       │ │
   │  └──────────────────────────────────────────┘ │
   │            ↓                                   │
   │  ┌──────────────────────────────────────────┐ │
   │  │  CONTROLLER LAYER (Business Logic)       │ │
   │  │  • authController.ts                     │ │
   │  │  • catsController.ts                     │ │
   │  │  • commentsController.ts                 │ │
   │  │  • geocodeController.ts                  │ │
   │  └──────────────────────────────────────────┘ │
   │            ↓                                   │
   │  ┌──────────────────────────────────────────┐ │
   │  │  REPOSITORY LAYER (Data Access)          │ │
   │  │  • catsDb.ts (Cat queries)               │ │
   │  │  • commentsDb.ts (Comment queries)       │ │
   │  │  • usersDb.ts (User queries)             │ │
   │  └──────────────────────────────────────────┘ │
   │            ↓                                   │
   │  ┌──────────────────────────────────────────┐ │
   │  │  UTILITIES & SERVICES                    │ │
   │  │  • JWT generation/validation             │ │
   │  │  • Bcrypt password hashing               │ │
   │  │  • ReCAPTCHA verification                │ │
   │  │  • Geocoding (Geoapify API)              │ │
   │  │  • Markdown parsing                      │ │
   │  │  • Cron jobs (automated tasks)           │ │
   │  └──────────────────────────────────────────┘ │
   └────┬───────────────────────────────────────────┘
        │ TCP Connection (Port 5432)
        │
   ┌────▼──────────────────────────────────────┐
   │      POSTGRESQL DATABASE                   │
   │      (PostgreSQL 18 in container)           │
   │                                            │
   │  Tables:                                   │
   │  ├── users (autenticazione + profilo)    │
   │  ├── cats (segnalamenti gatti)            │
   │  ├── comments (commenti)                  │
   │  └── refresh_tokens (sessioni sicure)    │
   │                                            │
   │  Indici:                                   │
   │  ├── idx_users_email                      │
   │  ├── idx_cats_user_id, idx_cats_status    │
   │  ├── idx_comments_cat_id                  │
   │  └── idx_refresh_tokens_*                 │
   └────────────────────────────────────────────┘
```

---

## 🔄 Flusso di Autenticazione

```
┌─────────────────────────────────────────────────────────────┐
│ 1. REGISTRAZIONE/LOGIN                                      │
└─────────────────────────────────────────────────────────────┘

Frontend (register/page.tsx)
    ↓
    ├─ Valida input (password, email)
    ├─ Mostra Google ReCAPTCHA
    ├─ Attende conferma "I'm not a robot"
    └─ Invia: { username, email, password, recaptchaToken }
          ↓
Backend (authController.ts)
    ├─ Verifica ReCAPTCHA con Google
    ├─ Valida email non esiste già
    ├─ Hash password con bcrypt (10 rounds)
    ├─ Genera JWT access token (1h scadenza)
    ├─ Genera refresh token (30 giorni scadenza)
    ├─ Salva refresh token in DB
    └─ Risponde: { accessToken, refreshToken, user }
          ↓
Frontend (ServerConnect.ts)
    ├─ Salva tokens in localStorage
    ├─ Salva user info
    ├─ Reindirizza a login/home
    └─ Dispatch evento authStateChanged


┌─────────────────────────────────────────────────────────────┐
│ 2. RICHIESTE AUTENTICATE                                    │
└─────────────────────────────────────────────────────────────┘

Frontend (fetch con auth)
    ├─ Legge accessToken da localStorage
    ├─ Aggiunge header: Authorization: Bearer {token}
    └─ Invia richiesta API
          ↓
Backend (authMiddleware.ts)
    ├─ Estrae token da header
    ├─ Verifica JWT signature
    ├─ Se valido → continua
    ├─ Se scaduto → error 401
    └─ Se non valido → error 401
          ↓
Controller/Route
    ├─ Esegue logica business
    ├─ Accede a database
    └─ Risponde con dati


┌─────────────────────────────────────────────────────────────┐
│ 3. REFRESH TOKEN (quando access token scade)               │
└─────────────────────────────────────────────────────────────┘

Frontend (ServerConnect.ts - handleExpiredToken)
    ├─ Rileva risposta 401
    ├─ Legge refreshToken da localStorage
    └─ Invia: POST /auth/refresh { refreshToken }
          ↓
Backend (authController.ts - refreshToken)
    ├─ Valida refreshToken in DB
    ├─ Genera nuovo accessToken
    ├─ Genera nuovo refreshToken
    ├─ Revoca vecchio token (rotation)
    └─ Risponde con nuovi token
          ↓
Frontend
    ├─ Salva nuovi token
    ├─ Riprova richiesta originale
    └─ Utente non si accorge di nulla (seamless)
```

---

## 📁 Struttura File Backend

```
backend/
├── src/
│   ├── server.ts                      # Entry point - Setup Express
│   │
│   ├── config/
│   │   ├── db.ts                      # Connessione PostgreSQL
│   │   └── initDb.ts                  # Initialization tabelle
│   │
│   ├── controllers/                   # Logica di business
│   │   ├── authController.ts          # Register, login, refresh
│   │   ├── catsController.ts          # CRUD gatti
│   │   ├── commentsController.ts      # CRUD commenti
│   │   └── geocodeController.ts       # Reverse geocoding
│   │
│   ├── routes/                        # Definizione API endpoints
│   │   ├── auth.ts                    # Auth routes
│   │   ├── cats.ts                    # Cats routes
│   │   ├── comments.ts                # Comments routes
│   │   └── geocode.ts                 # Geocode routes
│   │
│   ├── middleware/
│   │   └── authMiddleware.ts          # JWT validation
│   │
│   ├── repository/                    # Data Access Layer
│   │   ├── catsDb.ts                  # Cat database queries
│   │   ├── commentsDb.ts              # Comment database queries
│   │   └── usersDb.ts                 # User database queries
│   │
│   ├── dto/                           # Data Transfer Objects
│   │   ├── AuthDto.ts                 # Auth interfaces
│   │   ├── CatsDto.ts                 # Cat interfaces
│   │   ├── CommentDto.ts              # Comment interfaces
│   │   ├── GeoapifyDto.ts             # Geoapify API response
│   │   └── UserDto.ts                 # User interfaces
│   │
│   └── utils/                         # Utilities & services
│       ├── recaptcha.ts               # ReCAPTCHA verification
│       ├── geoapify.ts                # Geoapify integration
│       ├── markdown.ts                # Markdown parsing/sanitizing
│       ├── cron.ts                    # Scheduled jobs
│       └── strayCat.ts                # Stray cat data seeding
│
├── package.json                       # Dipendenze
├── tsconfig.json                      # TypeScript config
├── Dockerfile                         # Container image
├── .env                               # Environment variables
└── uploads/                           # User uploaded files
```

---

## 📁 Struttura File Frontend

```
techweb-frontend/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Homepage
│   │   ├── globals.css                # Global styles
│   │   │
│   │   ├── register/
│   │   │   └── page.tsx               # Registration form
│   │   ├── login/
│   │   │   └── page.tsx               # Login form
│   │   ├── cats/
│   │   │   ├── page.tsx               # Cats listing
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Cat detail page
│   │   ├── upload/
│   │   │   └── page.tsx               # Upload form
│   │   ├── map/
│   │   │   └── page.tsx               # Interactive map page
│   │   ├── data/
│   │   │   └── page.tsx               # Data management / admin
│   │   └── mylistings/
│   │       └── page.tsx               # User's listings
│   │
│   ├── components/                    # Reusable React components
│   │   ├── Header.tsx                 # Navigation + logo
│   │   ├── Footer.tsx                 # Footer
│   │   ├── CatCard.tsx                # Cat listing card
│   │   ├── CatCardSkeleton.tsx        # Loading skeleton
│   │   ├── CatGrid.tsx                # Grid layout for cats
│   │   ├── MapView.tsx                # Leaflet map wrapper
│   │   ├── MapPicker.tsx              # Map with location picker
│   │   ├── MapMarkerPopup.tsx         # Marker popup content
│   │   ├── SearchBar.tsx              # Search/filter bar
│   │   ├── UploadForm.tsx             # File upload form
│   │   ├── CommentForm.tsx            # Comment input
│   │   ├── AuthForm.tsx               # Auth form (reusable)
│   │   ├── MarkdownViewer.tsx         # Render markdown safe
│   │   ├── GeoLocateButton.tsx        # Get user location
│   │   ├── LoadingSpinner.tsx         # Loading indicator
│   │   └── ImageCropper.tsx           # Image cropping (stub)
│   │
│   ├── utils/                         # Utilities & hooks
│   │   ├── ServerConnect.ts           # API client (fetch wrapper)
│   │   ├── useAuth.ts                 # Auth custom hook
│   │   ├── DataContext.tsx            # Global state (React Context)
│   │   ├── types.ts                   # TypeScript types/interfaces
│   │   ├── toast.tsx                  # Toast notifications
│   │   └── fixLeafletIcon.ts          # Leaflet icon fix
│   │
│   └── pages/
│       └── api/                       # Legacy API routes
│
├── public/                            # Static assets
│   └── favicon.ico
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── eslint.config.mjs
├── Dockerfile
└── .env
```

---

## 🗄️ Database Schema

### Tabella: `users`
```sql
id:         SERIAL PRIMARY KEY
username:   VARCHAR(255) UNIQUE NOT NULL
email:      VARCHAR(255) UNIQUE NOT NULL
password_hash: VARCHAR(255) NOT NULL
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

### Tabella: `cats`
```sql
id:         SERIAL PRIMARY KEY
user_id:    INTEGER (FK → users.id)
title:      VARCHAR(255) NOT NULL
description: TEXT
image_url:  TEXT
latitude:   DOUBLE PRECISION NOT NULL
longitude:  DOUBLE PRECISION NOT NULL
status:     VARCHAR(50) DEFAULT 'active'
           ENUM('active', 'adopted', 'moved')
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()

Indici:
├── idx_cats_user_id
├── idx_cats_status
├── idx_cats_coordinates (latitude, longitude)
└── idx_cats_created_at
```

### Tabella: `comments`
```sql
id:         SERIAL PRIMARY KEY
user_id:    INTEGER (FK → users.id)
cat_id:     INTEGER (FK → cats.id)
content:    TEXT NOT NULL
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()

Indici:
├── idx_comments_cat_id
├── idx_comments_user_id
└── idx_comments_created_at
```

### Tabella: `refresh_tokens`
```sql
id:         SERIAL PRIMARY KEY
user_id:    INTEGER (FK → users.id)
token:      VARCHAR(500) UNIQUE NOT NULL
expires_at: TIMESTAMP NOT NULL
created_at: TIMESTAMP DEFAULT NOW()

Indici:
├── idx_refresh_tokens_user_id
├── idx_refresh_tokens_token
└── idx_refresh_tokens_expires_at
```

---

## 🔐 Flusso Sicurezza

### Password Hashing
```
User Input: "miaPassword123"
         ↓
    bcrypt.hash(..., 10 rounds)  
         ↓
Hashed: $2b$10$Lhr...HashLungo...xyzABC123
         ↓
   Stored in DB
```

### JWT Token
```
Payload: { userId: 123 }
Signature: HS256 with JWT_SECRET
Header: { alg: 'HS256', typ: 'JWT' }
         ↓
Token: eyJhbGc...eyJd...hash_della_firma
         ↓
Inviato nel header: Authorization: Bearer {token}
```

### ReCAPTCHA V2
```
1. Frontend riceve token da Google
2. Invia token al backend
3. Backend comunica con Google verify endpoint
4. Google conferma: "Human detected" o "Possible bot"
5. Consente registrazione solo se verificato
```

---

## 📊 Performance & Ottimizzazioni

### Frontend
- ✅ **Next.js Image Optimization** – Responsive images
- ✅ **Code Splitting** – Lazy load components
- ✅ **Turbopack** – 5-10x più veloce di Webpack
- ✅ **SSR** – Server-Side Rendering per SEO
- ✅ **CSS-in-JS** – Tailwind CSS minimizzato

### Backend
- ✅ **Database Indici** – Query optimization
- ✅ **Connection Pooling** – Reuso connessioni DB
- ✅ **Compression** – Gzip middleware
- ✅ **Rate Limiting** – Protezione overload
- ✅ **Caching** – In-memory cache for frequent queries

### Infrastructure
- ✅ **Docker** – Isolamento e portabilità
- ✅ **PostgreSQL** – Database relazionale robusto
- ✅ **CORS** – Controlled API access
- ✅ **CDN-ready** – Static assets separati

---

## 🧪 Testing Strategy

### E2E Testing (Playwright)
```
TestE2E/
├── e2e/
│   ├── 01-homepage.spec.ts          # Homepage renders
│   ├── 02-navigation.spec.ts        # Link navigation
│   ├── 03-upload-and-details.spec.ts # Upload workflow
│   ├── 04-search.spec.ts            # Search functionality
│   ├── 05-responsive.spec.ts        # Mobile responsiveness
│   ├── 06-auth.spec.ts              # Auth flows
│   ├── 07-api-integration.spec.ts   # API calls
│   ├── 08-comments.spec.ts          # Comments feature
│   ├── 09-map.spec.ts               # Map interactions
│   └── 10-accessibility.spec.ts     # WCAG compliance
└── utils/
    ├── api-mocks.ts                 # Mock API responses
    └── test-helpers.ts              # Custom assertions
```

---

## 🚀 Deployment Architecture

```
┌─ Development ─┐
│  docker compose  │ ← Local machine
└────────────────┘

      ↓ (Push to GitHub)

┌─────── CI/CD ──────┐
│ • GitHub Actions   │ ← Automated tests
│ • Build verification│
│ • Security scan    │
└────────────────────┘

      ↓ (Merge to main)

┌────── Production ──────┐
│ • Docker Registry      │
│ • Kubernetes/Docker    │
│ • Load Balancer        │
│ • SSL/TLS certi        │
│ • Database Backup      │
│ • Monitoring/Alerts    │
└───────────────────────┘
```

---

## 🔄 Cron Jobs (Node-Cron)

```
// Aggiornamenti automatici schedulate in backend

├── Cleanup scaduti tokens       @ ogni ora
├── Aggiornamento status gatti   @ ogni 6 ore
├── Database maintenance         @ notte (02:00)
└── Data seeding (dev only)      @ startup
```

---

**Documento aggiornato:** 24 Febbraio 2026
