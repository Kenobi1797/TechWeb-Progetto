"use client";
import "../utils/fixLeafletIcon";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import { useEffect, useRef, useMemo, useState } from "react";

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
  const [maptilerKey, setMaptilerKey] = useState<string>("");

  // Rileva la lingua dell'utente, usa solo il codice principale (es: "it", "en")
  const userLang = useMemo(() => {
    if (typeof window !== "undefined") {
      const lang =
        navigator.language ||
        navigator.languages?.[0] ||
        "en";
      return lang.split("-")[0];
    }
    return "en";
  }, []);

  // Recupera la chiave MapTiler dal backend
  useEffect(() => {
    fetch("http://localhost:5000/maptiler-key")
      .then(res => res.json())
      .then(data => setMaptilerKey(data.key ?? ""));
  }, []);

  // URL tile con lingua dinamica
  const tileUrl = maptilerKey
    ? `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${maptilerKey}&lang=${userLang}`
    : "";

  const defaultPos: [number, number] = markers.length
    ? [markers[0].lat, markers[0].lng]
    : [41.4845, 13.4989]; // Default: Fondi

  useEffect(() => {
    if (!mapRef.current) return;
  }, [markers]);

  return (
    <div ref={mapRef} className="w-full" style={{ minHeight: 300 }}>
      {maptilerKey && (
        <MapContainer
          center={defaultPos}
          zoom={13}
          minZoom={2}
          style={{ width: "100%", height: 300 }}
          className="rounded-lg shadow-sm"
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
          worldCopyJump={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & MapTiler'
            url={tileUrl}
            noWrap={true}
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
      )}
    </div>
  );
}
