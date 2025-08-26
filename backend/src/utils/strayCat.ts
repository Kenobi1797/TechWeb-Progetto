import { CityRegion } from '../utils/types';

export const cityRegions: CityRegion[] = [
  // Europa - Coordinate più precise per evitare zone d'acqua
  { name: "Rome, IT", latMin: 41.88, latMax: 41.92, lonMin: 12.48, lonMax: 12.52 },
  { name: "Paris, FR", latMin: 48.85, latMax: 48.87, lonMin: 2.33, lonMax: 2.37 },
  { name: "London, UK", latMin: 51.50, latMax: 51.52, lonMin: -0.13, lonMax: -0.09 },
  { name: "Berlin, DE", latMin: 52.50, latMax: 52.52, lonMin: 13.38, lonMax: 13.42 },
  { name: "Madrid, ES", latMin: 40.41, latMax: 40.43, lonMin: -3.72, lonMax: -3.68 },
  { name: "Moscow, RU", latMin: 55.75, latMax: 55.77, lonMin: 37.60, lonMax: 37.64 },
  { name: "Istanbul, TR", latMin: 41.01, latMax: 41.03, lonMin: 28.97, lonMax: 29.01 },
  
  // Nord America - Zone urbane centrali
  { name: "New York, US", latMin: 40.74, latMax: 40.76, lonMin: -73.99, lonMax: -73.95 },
  { name: "Los Angeles, US", latMin: 34.05, latMax: 34.07, lonMin: -118.26, lonMax: -118.22 },
  { name: "Toronto, CA", latMin: 43.65, latMax: 43.67, lonMin: -79.38, lonMax: -79.36 },
  { name: "Mexico City, MX", latMin: 19.43, latMax: 19.45, lonMin: -99.13, lonMax: -99.11 },
  
  // Asia - Centri urbani principali
  { name: "Tokyo, JP", latMin: 35.67, latMax: 35.69, lonMin: 139.74, lonMax: 139.76 },
  { name: "Beijing, CN", latMin: 39.90, latMax: 39.92, lonMin: 116.39, lonMax: 116.41 },
  { name: "Seoul, KR", latMin: 37.56, latMax: 37.58, lonMin: 126.97, lonMax: 126.99 },
  { name: "Mumbai, IN", latMin: 19.07, latMax: 19.09, lonMin: 72.88, lonMax: 72.90 },
  { name: "Bangkok, TH", latMin: 13.75, latMax: 13.77, lonMin: 100.50, lonMax: 100.52 },
  
  // Sud America e Africa - Zone urbane sicure
  { name: "São Paulo, BR", latMin: -23.55, latMax: -23.53, lonMin: -46.64, lonMax: -46.62 },
  { name: "Cairo, EG", latMin: 30.04, latMax: 30.06, lonMin: 31.23, lonMax: 31.25 },
  { name: "Johannesburg, ZA", latMin: -26.20, latMax: -26.18, lonMin: 28.04, lonMax: 28.06 },
  
  // Oceania - Centro città lontano dal porto
  { name: "Sydney, AU", latMin: -33.87, latMax: -33.85, lonMin: 151.20, lonMax: 151.22 },
  
  // Aggiunte di città italiane per maggiore varietà - coordinate corrette
  { name: "Milan, IT", latMin: 45.46, latMax: 45.48, lonMin: 9.18, lonMax: 9.20 },
  { name: "Naples, IT", latMin: 40.84, latMax: 40.86, lonMin: 14.25, lonMax: 14.27 },
  { name: "Florence, IT", latMin: 43.77, latMax: 43.79, lonMin: 11.25, lonMax: 11.27 },
  { name: "Venice, IT", latMin: 45.44, latMax: 45.45, lonMin: 12.33, lonMax: 12.34 }, // Zona terraferma di Mestre
  { name: "Bologna, IT", latMin: 44.49, latMax: 44.51, lonMin: 11.34, lonMax: 11.36 },
  { name: "Turin, IT", latMin: 45.06, latMax: 45.08, lonMin: 7.68, lonMax: 7.70 },
  { name: "Palermo, IT", latMin: 38.11, latMax: 38.13, lonMin: 13.35, lonMax: 13.37 },
  { name: "Genoa, IT", latMin: 44.40, latMax: 44.42, lonMin: 8.93, lonMax: 8.95 },
  { name: "Catania, IT", latMin: 37.50, latMax: 37.52, lonMin: 15.08, lonMax: 15.10 },
  { name: "Bari, IT", latMin: 41.12, latMax: 41.14, lonMin: 16.86, lonMax: 16.88 },
];

export const strayCatComments = [
  "Qualcuno sa se ha un nome? Lo vedo spesso vicino al tabaccaio.",
  "I bambini del quartiere gli hanno costruito una piccola cuccia.",
  "Mi ha seguito fino a casa, come se mi conoscesse da sempre.",
  "Ha fatto amicizia con il mio cane, si annusano ogni mattina!",
  "Ha rubato un pezzo di pollo dal mio piatto, ma era troppo carino per arrabbiarsi.",
  "Il postino gli lascia sempre qualche crocchetta.",
  "Mi segue quando porto fuori la spazzatura... è diventata un'abitudine!",
  "L'ho visto litigare con un altro gatto per un posto al sole.",
  "Ogni mattina aspetta fuori dal bar, come se aspettasse qualcuno.",
  "Ha un musetto simpatico, ma non si lascia avvicinare.",
  "Stamattina era seduto davanti alla farmacia, sembrava aspettare qualcuno.",
  "Ieri sera si è nascosto sotto la mia auto per la pioggia.",
  "Ha uno sguardo furbo, sembra conoscere tutti i trucchi del quartiere.",
  "Quando passo con la bici mi segue per un po', poi si ferma e si sdraia.",
  "Ha imparato a riconoscere il rumore delle chiavi: arriva sempre quando torno a casa.",
  "L'ho visto giocare con una foglia secca, sembrava divertirsi un sacco.",
  "Ogni tanto sparisce per giorni, poi torna come se nulla fosse.",
  "Ha una zampa bianca e una nera, lo riconosco subito.",
  "Si mette sempre vicino al termosifone del bar d'inverno.",
  "Quando c'è il mercato, si aggira tra i banchi in cerca di cibo.",
];

export const strayCatDescriptions = [
  "Sembra affamato, si aggira tra i bidoni vicino alla piazzetta.",
  "Poverino, ieri sera era fradicio sotto la pioggia alla stazione.",
  "Dormiva su una sedia fuori dal bar come se fosse casa sua.",
  "Era nascosto sotto una macchina, tremava per la paura.",
  "Giocava con altri gatti nel parco come se fosse il capo del gruppo.",
  "Ha una zampa ferita, si muove zoppicando... qualcuno può aiutarlo?",
  "Ieri sera ha mangiato il cibo che ho lasciato, sembrava affamato da giorni.",
  "Durante il temporale è corso nel mio cortile a cercare riparo.",
  "Ha il pelo arruffato e gli occhi un po’ spenti, forse non sta bene.",
  "Si avvicina solo quando non ci sono cani o troppe persone.",
  "Sta spesso vicino alla scuola, forse aspetta qualche bambino.",
  "Ha un collare rosso sbiadito... potrebbe essersi perso.",
  "Miagola davanti al supermercato, come se sapesse che lì trova cibo.",
  "Si arrampica sempre sul solito albero del viale.",
  "Stamattina dormiva nella scatola delle consegne come un piccolo re.",
  "Sembra molto dolce, qualcuno dovrebbe adottarlo.",
  "Ha paura delle persone, ma si avvicina se lasci del cibo.",
  "Ieri inseguiva una farfalla nel giardino, sembrava un cucciolo.",
  "Si nasconde sotto le panchine del parco, soprattutto nel pomeriggio.",
  "Ha degli occhi enormi, sembrano guardarti dentro.",
  "Si muove solo di notte, è timido ma curioso.",
  "Ha trovato rifugio nel garage del vicino, ci torna ogni sera.",
  "Sembra in cerca di una casa, guarda ogni porta con speranza.",
  "Era con altri due gatti, sembravano una piccola famiglia.",
  "Il suo miagolio è così strano che ormai lo riconosco da lontano.",
  "Giocava con una pallina di carta che qualcuno gli ha lasciato.",
  "Si lascia accarezzare solo da chi conosce bene.",
  "Forse ha partorito da poco, era molto protettiva.",
  "È salito sul tetto e da lì osservava tutta la strada.",
  "Scappa al minimo rumore, ma resta a pochi metri.",
  "Corre quando sente il rumore del sacchetto di crocchette.",
  "Stamattina dormiva sul cofano della mia auto, scaldandosi al sole.",
  "Ha il pelo bianco e nero, come un panda in miniatura.",
  "Sembra un cucciolo, ha uno sguardo ingenuo e curioso.",
  "Lo vedo spesso vicino alla fermata dell'autobus, come se aspettasse qualcuno.",
  "Quando piove si infila sotto il portico della farmacia.",
  "Giocava con una foglia secca, come se fosse un giocattolo.",
  "Ha un orecchio piegato, forse da una vecchia ferita.",
];
