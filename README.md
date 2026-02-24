# StreetCats 🐾

**UNIVERSITÀ DEGLI STUDI DI NAPOLI FEDERICO II**  
Laurea in Informatica – Corso di Tecnologie Web  
Primavera 2025 – Docente: Luigi Libero Lucio Starace, Ph.D.

---

## ✨ Descrizione Progetto

**StreetCats** è una piattaforma web responsive per segnalare avvistamenti di gatti randagi in giro per il mondo. L'applicazione fornisce una mappa interattiva, un sistema di upload foto, ricerca avanzata e commenti per interagire con la comunità.

Progetto realizzato per l'esame "Tecnologie Web" dell'A.A. 2024/25 con **valutazione massima**.

### Sviluppatore
- **Gino Pandozzi-Trani** – Matricola: N86003116

---

## 🎯 Feature Principali

✅ **Mappa Interattiva** – Visualizza tutti gli avvistamenti di gatti in tempo reale  
✅ **Upload e Gestione Foto** – Carica immagini dei gatti avvistati  
✅ **Sistema di Autenticazione** – Registrazione e login con JWT + ReCAPTCHA V2  
✅ **Commenti** – Interagisci con altri utenti su ogni segnalamento  
✅ **Ricerca Avanzata** – Filtra per status, data e posizione geografica  
✅ **Responsive Design** – Funziona su desktop, tablet e mobile  
✅ **Sicurezza** – ReCAPT CHA, JWT, Bcrypt password hashing  
✅ **Cron Jobs** – Aggiornamenti automatici e pulizia dati  

---

## 🛠️ Tecnologie Utilizzate

### **Frontend**
- **Next.js 15** (React) con Turbopack
- **TypeScript** – Type-safe development
- **Tailwind CSS** – Styling moderno con DaisyUI
- **Leaflet** – Mappa interattiva
- **React Markdown** – Rendering markdown sicuro

### **Backend**
- **Node.js + Express** – REST API sicure
- **TypeScript** – Type-safe server-side
- **PostgreSQL** – Database relazionale
- **JWT** – Autenticazione stateless
- **Bcrypt** – Password hashing sicuro
- **Google ReCAPTCHA V2** – Protezione dai bot
- **Node-cron** – Job scheduling

### **DevOps**
- **Docker + Docker Compose** – Containerizzazione completa
- **Playwright** – E2E testing
- **ESLint + TSC** – Quality assurance

---

## 📋 Setup

### 1. **Prerequisiti**

- Docker e Docker Compose instalati
- Oppure: Node.js 22+, PostgreSQL 18+
- Google ReCAPTCHA V2 Account (account Google)

### 2. **Configurazione Veloce (Docker)**

```bash
# Clone il repository
git clone https://github.com/Kenobi1797/TechWeb-Progetto.git
cd TechWeb-Progetto

# Avvia tutto con Docker Compose
docker compose up --build
```

✅ **Fatto!** Accedi a:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: localhost:5432

### 3. **Setup Manuale (Locale)**

#### Backend
```bash
cd backend
npm install
npm run dev
# Server avviato su http://localhost:5000
```

#### Frontend
```bash
cd techweb-frontend
npm install --legacy-peer-deps
npm run dev
# App avviata su http://localhost:3000
```

#### Database
```bash
# Crea il database
createdb TechWeb-24-25

# Importa lo schema
psql -U postgres -d TechWeb-24-25 -f db.sql
```

---

## 🔐 Configurazione ReCAPTCHA

**Obbligatorio per il form di registrazione:**

1. Vai a: https://www.google.com/recaptcha/admin/create
2. Seleziona **reCAPTCHA v2** – Checkbox
3. Aggiungi dominio: `localhost`, `127.0.0.1`
4. Ottieni **Site Key** e **Secret Key**
5. Compila `.env` file:

```bash
# backend/.env
RECAPTCHA_SECRET_KEY=6Lc...xxxxx

# techweb-frontend/.env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...xxxxx
```

👉 **Guida Dettagliata:** Vedi [RECAPTCHA_SETUP.md](./RECAPTCHA_SETUP.md)

---

## 📁 Struttura Progetto

```
TechWeb-Progetto/
├── backend/                    # Express + TypeScript
│   ├── src/
│   │   ├── controllers/       # Logica di business
│   │   ├── routes/            # Definizione API
│   │   ├── middleware/        # Auth & validation
│   │   ├── utils/             # Helper & utilities
│   │   ├── config/            # Database setup
│   │   └── server.ts          # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── .env                   # Config localmente
│
├── techweb-frontend/          # Next.js + React
│   ├── src/
│   │   ├── app/              # Pagine principali
│   │   ├── components/       # Componenti riutilizzabili
│   │   └── utils/            # Hooks e helpers
│   ├── package.json
│   ├── Dockerfile
│   └── .env                  # Config público APIs
│
├── TestE2E/                   # Test Playwright
│   ├── e2e/                  # Scenario di test
│   └── package.json
│
├── db.sql                     # Schema database
├── docker-compose.yml         # Orchestrazione container
├── ENV_SETUP.md              # Guida variabili ambiente
├── RECAPTCHA_SETUP.md        # Setup ReCAPTCHA
└── README.md                 # Questo file
```

---

## 🧪 Testing

### E2E Testing con Playwright

```bash
cd TestE2E
npm install
npm run test:e2e
```

**Test Disponibili:**
- ✅ Homepage
- ✅ Navigazione
- ✅ Upload e details
- ✅ Ricerca
- ✅ Responsive design
- ✅ Autenticazione
- ✅ Integrazione API
- ✅ Commenti
- ✅ Mappa interattiva
- ✅ Accessibilità

---

## 📚 API Endpoints

### **Auth**
```
POST   /auth/register         - Registrazione nuovo utente
POST   /auth/login            - Login
POST   /auth/logout           - Logout
POST   /auth/refresh          - Refresh token
```

### **Cats**
```
GET    /cats                  - Lista tutti i gatti
GET    /cats/:id              - Dettagli gatto
POST   /cats                  - Crea nuovo avvistamento
PUT    /cats/:id              - Modifica avvistamento
DELETE /cats/:id              - Cancella avvistamento
```

### **Comments**
```
POST   /comments              - Aggiungi commento
DELETE /comments/:id          - Cancella commento
```

### **Geocode**
```
GET    /geocode               - Geocoding address → lat/lng
```

---

## 🔒 Sicurezza

- ✅ **JWT Authentication** – Token-based access
- ✅ **Bcrypt Hashing** – Password encryption (10 rounds)
- ✅ **ReCAPTCHA V2** – Protection da bot registration
- ✅ **Rate Limiting** – Protezione brute-force
- ✅ **CORS** – Controlled cross-origin access
- ✅ **Input Sanitization** – Protection da XSS
- ✅ **SQL Injection Prevention** – Parameterized queries
- ✅ **Helmet.js** – Security headers

---

## 📖 Documentazione Ulteriore

- [**ENV_SETUP.md**](./ENV_SETUP.md) – Guida configurazione variabili ambiente
- [**RECAPTCHA_SETUP.md**](./RECAPTCHA_SETUP.md) – Setup Google ReCAPTCHA V2
- [**ARCHITECTURE.md**](./ARCHITECTURE.md) – Architettura tecnica dettagliata

---

## 🐳 Docker Commands

```bash
# Build e avvia tutto
docker compose up --build

# Avvia senza rebuild
docker compose up

# Arresta container
docker compose down

# Cancella tutto (volumes inclusi)
docker compose down -v

# View logs
docker compose logs -f techweb-backend
docker compose logs -f techweb-frontend
```

---

## 🚀 Deploy in Produzione

1. **Aggiorna `.env`** con valori sicuri
2. **Build Docker images**
3. **Push su registry** (Docker Hub, private registry)
4. **Configure reverse proxy** (Nginx/Apache)
5. **Setup SSL** (Let's Encrypt)
6. **Database backup** strategy
7. **Monitoring** & logging

---

## 📞 Support & Contatti

Per domande tecniche sul progetto, consulta:
- Documentazione nel repository
- README file specifici per setup
- DocstringX nel codice

---

## 📄 Licenza

Progetto educativo per l'Università Federico II di Napoli.


