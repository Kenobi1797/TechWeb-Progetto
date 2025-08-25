import { CityRegion } from '../utils/types';

export const cityRegions: CityRegion[] = [
  // Europa - Coordinate più precise per evitare zone d'acqua
  { name: "Rome, IT", latMin: 41.85, latMax: 41.95, lonMin: 12.45, lonMax: 12.55 },
  { name: "Paris, FR", latMin: 48.82, latMax: 48.90, lonMin: 2.25, lonMax: 2.40 },
  { name: "London, UK", latMin: 51.45, latMax: 51.55, lonMin: -0.20, lonMax: -0.05 },
  { name: "Berlin, DE", latMin: 52.45, latMax: 52.55, lonMin: 13.35, lonMax: 13.45 },
  { name: "Madrid, ES", latMin: 40.35, latMax: 40.45, lonMin: -3.75, lonMax: -3.65 },
  { name: "Moscow, RU", latMin: 55.70, latMax: 55.80, lonMin: 37.55, lonMax: 37.65 },
  { name: "Istanbul, TR", latMin: 41.00, latMax: 41.10, lonMin: 28.95, lonMax: 29.05 },
  
  // Nord America - Zone urbane centrali
  { name: "New York, US", latMin: 40.70, latMax: 40.80, lonMin: -74.02, lonMax: -73.92 },
  { name: "Los Angeles, US", latMin: 34.02, latMax: 34.12, lonMin: -118.35, lonMax: -118.25 },
  { name: "Toronto, CA", latMin: 43.62, latMax: 43.72, lonMin: -79.42, lonMax: -79.32 },
  { name: "Mexico City, MX", latMin: 19.40, latMax: 19.50, lonMin: -99.15, lonMax: -99.05 },
  
  // Asia - Centri urbani principali
  { name: "Tokyo, JP", latMin: 35.65, latMax: 35.75, lonMin: 139.70, lonMax: 139.80 },
  { name: "Beijing, CN", latMin: 39.88, latMax: 39.98, lonMin: 116.35, lonMax: 116.45 },
  { name: "Seoul, KR", latMin: 37.52, latMax: 37.62, lonMin: 126.95, lonMax: 127.05 },
  { name: "Mumbai, IN", latMin: 19.05, latMax: 19.15, lonMin: 72.82, lonMax: 72.92 },
  { name: "Bangkok, TH", latMin: 13.72, latMax: 13.82, lonMin: 100.48, lonMax: 100.58 },
  
  // Sud America e Africa - Zone urbane sicure
  { name: "São Paulo, BR", latMin: -23.58, latMax: -23.48, lonMin: -46.68, lonMax: -46.58 },
  { name: "Cairo, EG", latMin: 30.02, latMax: 30.12, lonMin: 31.22, lonMax: 31.32 },
  { name: "Johannesburg, ZA", latMin: -26.22, latMax: -26.12, lonMin: 28.02, lonMax: 28.12 },
  
  // Oceania
  { name: "Sydney, AU", latMin: -33.90, latMax: -33.80, lonMin: 151.15, lonMax: 151.25 },
  
  // Aggiunte di città italiane per maggiore varietà
  { name: "Milan, IT", latMin: 45.45, latMax: 45.50, lonMin: 9.15, lonMax: 9.25 },
  { name: "Naples, IT", latMin: 40.83, latMax: 40.88, lonMin: 14.23, lonMax: 14.28 },
  { name: "Florence, IT", latMin: 43.76, latMax: 43.81, lonMin: 11.24, lonMax: 11.29 },
  { name: "Venice, IT", latMin: 45.43, latMax: 45.45, lonMin: 12.31, lonMax: 12.34 },
  { name: "Bologna, IT", latMin: 44.48, latMax: 44.51, lonMin: 11.33, lonMax: 11.36 },
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
