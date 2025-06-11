# Streetcats

Applicazione per la segnalazione e la visualizzazione di avvistamenti di gatti randagi.

## Avvio rapido

```bash
npm run dev
# oppure
yarn dev
# oppure
pnpm dev
# oppure
bun dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser per vedere il risultato.

⚠️ **Nota:** Il backend deve essere avviato su `http://localhost:5000`.
Tutte le chiamate al backend devono essere fatte tramite il modulo `src/utils/ServerConnect.ts`.

Puoi modificare la pagina principale modificando `app/page.tsx`. La pagina si aggiorna automaticamente.

## Stack

- **React + Next.js** (App Router)
- **TailwindCSS** (con DaisyUI)
- **Leaflet** (per la mappa)
- **TypeScript**

## UI/UX

- Grafica uniforme, colori chiari e moderni
- Responsive su mobile e desktop
- Drag & drop per upload immagini
- Card e form con ombre e bordi arrotondati

## Note

Questa app è parte del progetto Streetcats.<br>
Per dettagli tecnici consulta la documentazione interna del progetto.
