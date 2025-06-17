"use client";
import "../utils/fixLeafletIcon";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import { useEffect, useRef, useMemo } from "react";

type MarkerData = {
  lat: number;
  lng: number;
  title?: string;
  imageUrl?: string;
};

interface MapViewProps {
  readonly markers: readonly MarkerData[];
}

export default function MapView({ markers }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Rileva la lingua dell'utente, usa solo il codice principale (es: "it", "en")
  const userLang = useMemo(() => {
    if (typeof window !== "undefined") {
      const lang =
        navigator.language ||
        (navigator.languages && navigator.languages[0]) ||
        "en";
      return lang.split("-")[0];
    }
    return "en";
  }, []);

  // Sostituisci con la tua MapTiler API KEY gratuita
  const MAPTILER_KEY = "get_your_own_D6rA4zTHduk6KOKTXzGB"; // demo key, sostituisci in produzione

  // URL tile con lingua dinamica
  const tileUrl = `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}&lang=${userLang}`;

  const defaultPos: [number, number] = markers.length
    ? [markers[0].lat, markers[0].lng]
    : [41.4845, 13.4989]; // Default: Fondi

  useEffect(() => {
    if (!mapRef.current) return;
  }, [markers]);

  return (
    <div ref={mapRef} style={{ width: "100%", height: "450px" }}>
      <MapContainer
        center={defaultPos}
        zoom={13}
        style={{ height: "450px", minHeight: "450px", width: "100%" }}
        className="rounded-lg shadow-sm"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & MapTiler'
          url={tileUrl}
        />
        {markers.map((m, i) => (
          <Marker
            key={`${m.lat}-${m.lng}-${m.title ?? ""}-${i}`}
            position={[m.lat, m.lng]}
          >
            <Popup>
              <strong>{m.title ?? "Avvistamento"}</strong>
              {m.imageUrl && (
                <div>
                  <Image
                    src={m.imageUrl}
                    alt={m.title ?? "Avvistamento"}
                    width={120}
                    height={80}
                    style={{ maxWidth: 120, marginTop: 4, height: "auto" }}
                    loading="lazy"
                  />
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
