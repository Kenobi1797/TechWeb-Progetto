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

## 🚀 Avvio rapido

### 1. Installa le dipendenze

Backend:
```bash
cd backend
npm install
```
Frontend:
```bash
cd techweb-frontend
npm install
```
Test E2E:
```bash
cd TestE2E
npm install
```

### 2. Avvia i servizi

Backend:
```bash
npm run dev
# oppure
npm start
```
Frontend:
```bash
npm run dev
```

### 3. Avvia i test End-to-End
```bash
npm run test:e2e
```

### 4. Docker (opzionale)

Per avviare tutto tramite Docker:
```bash
docker compose up --build
```

---

## 📄 Modalità di consegna

- Non includere le cartelle `node_modules` o altre dipendenze, solo i file descrittori (`package.json`, ecc.).
- Organizza i sorgenti in due directory distinte: `backend/` e `techweb-frontend/`.
- Includi questo `README.md` con istruzioni dettagliate.
- Includi un PDF (max 1 pagina) con nome, cognome, matricola, traccia scelta, tecnologie usate.
- Comprimi tutto in un archivio ZIP senza altri file compressi.
- Invia tramite Filesender all’indirizzo del docente, seguendo le istruzioni del bando.

---

## 🛠️ Stack tecnologico

- **Express + TypeScript** (backend)
- **React + Next.js** (frontend)
- **TailwindCSS** (con DaisyUI)
- **Leaflet** (mappa interattiva)
- **JWT** (autenticazione)
- **Playwright** (test E2E)
- **Docker** (containerizzazione)

---

## 🧪 Test End-to-End

Sono presenti almeno 10 test automatici Playwright in `TestE2E/e2e/` che coprono:
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
