# Streetcats 🐾

Benvenuto su **Streetcats**, la piattaforma web per la condivisione di avvistamenti di gatti randagi!

---

## ✨ Caratteristiche Principali

- Mappa interattiva con clustering marker
- Upload foto con drag & drop
- Ricerca avanzata per titolo/descrizione
- Sistema commenti per utenti autenticati
- Supporto Markdown nelle descrizioni
- Design responsive
- Autenticazione sicura (JWT)
- Test End-to-End automatici
- Containerizzazione Docker

---

## 📦 Struttura del progetto

- `backend/`  
  Backend Express/TypeScript, API REST, autenticazione, upload immagini, database, Dockerfile.
- `techweb-frontend/`  
  Frontend Next.js/React, SPA responsive, mappa interattiva, autenticazione, Dockerfile.
- `TestE2E/`  
  Test End-to-End automatici con Playwright.
- `README.md`  
  Questo file.
- `db.sql`  
  Script di inizializzazione database.

---

## 🚀 Istruzioni dettagliate di esecuzione

### Backend

1. Accedi alla cartella backend:
   cd backend
2. Installa le dipendenze:
   npm install
3. Configura il file `.env` con i parametri richiesti (vedi esempio in `.env.example` se presente).
4. Avvia il server:
   npm run dev
   # oppure
   npm start
   Il backend sarà attivo su http://localhost:5000

5. Per avviare tramite Docker:
   docker build -t streetcats-backend .
   docker run -p 5000:5000 streetcats-backend
   Oppure usa direttamente:
   docker compose up --build

### Frontend

1. Accedi alla cartella frontend:
   cd techweb-frontend
2. Installa le dipendenze:
   npm install
3. Avvia l'applicazione:
   npm run dev
   Il frontend sarà attivo su http://localhost:3000

4. Per avviare tramite Docker:
   docker build -t streetcats-frontend .
   docker run -p 3000:3000 streetcats-frontend
   Oppure usa direttamente:
   docker compose up --build

### Test End-to-End

1. Accedi alla cartella dei test:
   cd TestE2E
2. Installa le dipendenze:
   npm install
3. Avvia i test:
   npm run test:e2e

---

## 📄 Modalità di consegna

- Non includere le cartelle node_modules o altre dipendenze, solo i file descrittori (package.json, ecc.).
- Organizza i sorgenti in due directory distinte: backend/ e techweb-frontend/.
- Includi questo README.md con istruzioni dettagliate.
- Includi un PDF (max 1 pagina) con nome, cognome, matricola, traccia scelta, tecnologie usate.
- Comprimi tutto in un archivio ZIP senza altri file compressi.
- Invia tramite Filesender all’indirizzo del docente, seguendo le istruzioni del bando.

---

## 🛠️ Stack tecnologico

- Express + TypeScript (backend)
- React + Next.js (frontend)
- TailwindCSS (con DaisyUI)
- Leaflet (mappa interattiva)
- JWT (autenticazione)
- Playwright (test E2E)
- Docker (containerizzazione)

---

## 🧪 Test End-to-End

Sono presenti almeno 10 test automatici Playwright in TestE2E/e2e/ che coprono:
- Homepage
- Navigazione
- Upload e dettagli
- Ricerca
- Responsive
- Autenticazione
- Integrazione API
- Performance
- Accessibilità
- Cross-browser

---

## ℹ️ Note

Streetcats è parte di un progetto open source dedicato alla tutela degli animali.  
Per dettagli tecnici consulta la documentazione interna del progetto.

Unisciti alla community, segnala un micio e aiuta a mappare la città... una zampa alla volta! 🐈‍⬛
