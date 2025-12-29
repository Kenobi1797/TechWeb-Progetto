# Streetcats 🐾

**UNIVERSITÀ DEGLI STUDI DI NAPOLI FEDERICO II**  
Laurea in Informatica  
Corso di Tecnologie Web – Primavera 2025  
Docente: Luigi Libero Lucio Starace, Ph.D.

---

## Progetto: STREETCATS

Piattaforma web dedicata alla condivisione di avvistamenti di gatti randagi con mappa interattiva, sistema di upload foto, ricerca avanzata e commenti.

### Sviluppatore
- **Nome:** Gino
- **Cognome:** Pandozzi-Trani  
- **Matricola:** N86003116

---

## 🚀 Istruzioni di esecuzione

### Backend

#### Esecuzione locale (senza Docker)

1. Accedi alla cartella backend:
   ```
   cd backend
   ```
2. Installa le dipendenze:
   ```
   npm install
   ```
3. Avvia il server:
   ```
   npm run dev
   ```
   oppure
   ```
   npm start
   ```
   Il backend sarà attivo su http://localhost:5000

#### Esecuzione con Docker

1. Accedi alla cartella backend:
   ```
   cd backend
   ```
2. Installa le dipendenze localmente:
   ```
   npm install
   ```
3. Costruisci l'immagine Docker:
   ```
   docker build -t streetcats-backend .
   ```
4. Avvia il container:
   ```
   docker run -p 5000:5000 streetcats-backend
   ```

#### Esecuzione con Docker Compose

1. Dalla radice del progetto, esegui:
   ```
   docker compose up --build
   ```

### Frontend

#### Esecuzione locale (senza Docker)

1. Accedi alla cartella frontend:
   ```
   cd techweb-frontend
   ```
2. Installa le dipendenze:
   ```
   npm install
   ```
3. Avvia l'applicazione in modalità sviluppo:
   ```
   npm run dev
   ```
   Il frontend sarà attivo su http://localhost:3000

#### Esecuzione con Docker

1. Accedi alla cartella frontend:
   ```
   cd techweb-frontend
   ```
2. Installa le dipendenze localmente:
   ```
   npm install
   ```
3. Costruisci l'immagine Docker:
   ```
   docker build -t streetcats-frontend .
   ```
4. Avvia il container:
   ```
   docker run -p 3000:3000 streetcats-frontend
   ```

#### Esecuzione con Docker Compose

1. Dalla radice del progetto, esegui:
   ```
   docker compose up --build
   ```

### Test End-to-End

1. Accedi alla cartella dei test:
   ```
   cd TestE2E
   ```
2. Installa le dipendenze:
   ```
   npm install
   ```
3. Avvia i test:
   ```
   npm run test:e2e
   ```
