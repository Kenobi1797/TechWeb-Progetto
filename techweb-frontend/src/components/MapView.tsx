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
  id?: number;
  createdAt?: string;
  description?: string;
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
    const controller = new AbortController();
    fetch("http://localhost:5000/maptiler-key", { signal: controller.signal })
      .then(res => res.json())
      .then(data => setMaptilerKey(data.key ?? ""))
      .catch(() => setMaptilerKey(""));
    return () => controller.abort();
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
    <div
      ref={mapRef}
      className="w-full relative aspect-ratio-16-9"
      style={{
        minHeight: 220,
        minWidth: 0,
        maxWidth: "100vw",
        height: "auto",
      }}
    >
      {maptilerKey && (
        <MapContainer
          center={defaultPos}
          zoom={13}
          minZoom={2}
          style={{ width: "100%", height: "100%" }}
          className="rounded-lg shadow-sm h-full"
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
          worldCopyJump={false}
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
              <Popup maxWidth={250} closeButton={true}>
                <div className="popup-content">
                  <h3 className="font-bold text-lg mb-2">{m.title ?? "Avvistamento"}</h3>
                  {m.imageUrl && (
                    <div className="mb-2">
                      <Image
                        src={m.imageUrl}
                        alt={m.title ?? "Avvistamento"}
                        width={200}
                        height={120}
                        style={{ maxWidth: "100%", height: "auto", borderRadius: "4px" }}
                        loading="lazy"
                      />
                    </div>
                  )}
                  {m.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                      {m.description.length > 100 
                        ? `${m.description.substring(0, 100)}...` 
                        : m.description}
                    </p>
                  )}
                  {m.createdAt && (
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(m.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  )}
                  {m.id && (
                    <a 
                      href={`/cats/${m.id}`}
                      className="inline-block bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Vedi dettagli
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
