# Streetcats 🐾

Benvenuto su **Streetcats**, l'applicazione web per segnalare e visualizzare gli avvistamenti di gatti randagi nella tua città!
Con Streetcats puoi contribuire a una comunità attenta agli animali, condividere foto, commentare e scoprire dove si trovano i mici più curiosi del quartiere.

---

## 🚀 Avvio rapido

1. Installa le dipendenze:
   ```bash
   npm install
   ```
2. Avvia il frontend:
   ```bash
   npm run dev
   # oppure
   yarn dev
   # oppure
   pnpm dev
   # oppure
   bun dev
   ```
3. Apri [http://localhost:3000](http://localhost:3000) nel browser per vedere Streetcats in azione.

> **Attenzione:**
> Il backend deve essere attivo su `http://localhost:5000`.
> Tutte le chiamate al backend passano tramite `src/utils/ServerConnect.ts`.

Puoi personalizzare la pagina principale modificando `app/page.tsx`. Le modifiche sono riflesse in tempo reale.

---

## 💡 Best practice & ottimizzazione

- Utilizza sempre le funzioni di `src/utils/ServerConnect.ts` per comunicare col backend.
- Gestisci loading ed errori per offrire una UX fluida.
- Carica componenti dinamici (`dynamic import`) solo quando servono (es. la mappa).
- Applica sempre `aria-label` e ruoli semantici per l’accessibilità.
- Ottimizza le immagini con il componente `next/image` e configura i domini remoti in `next.config.ts`.
- Mantieni il codice DRY e centralizza la gestione degli errori.

---

## 🛠️ Stack tecnologico

- **React + Next.js** (App Router)
- **TailwindCSS** (con DaisyUI)
- **Leaflet** (per la mappa interattiva)
- **TypeScript**

---

## 🎨 UI/UX

- Grafica uniforme, colori chiari e moderni
- Responsive su mobile e desktop
- Drag & drop per caricare immagini
- Card e form con ombre e bordi arrotondati

---

## ℹ️ Note

Streetcats è parte di un progetto open source dedicato alla tutela degli animali.
Per dettagli tecnici consulta la documentazione interna del progetto.

Unisciti alla community, segnala un micio e aiuta a mappare la città... una zampa alla volta! 🐈‍⬛
