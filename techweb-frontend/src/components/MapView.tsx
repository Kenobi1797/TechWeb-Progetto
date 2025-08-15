"use client";
import "../utils/fixLeafletIcon";
import dynamic from "next/dynamic";
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });
const ZoomControl = dynamic(() => import("react-leaflet").then(mod => mod.ZoomControl), { ssr: false });
import { LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { fetchMaptilerKey } from "../utils/ServerConnect";

import MapMarkerPopup from "./MapMarkerPopup";

const GeoLocateButton = dynamic(() => import("./GeoLocateButton"), { ssr: false });

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

  const [maptilerKey, setMaptilerKey] = useState<string>("");
  // Lingua utente
  const userLang = useMemo(() => {
    if (typeof window !== "undefined") {
      const lang = navigator.language || navigator.languages?.[0] || "en";
      return lang.split("-")[0];
    }
    return "en";
  }, []);

  useEffect(() => {
    fetchMaptilerKey().then((key) => setMaptilerKey(key));
  }, []);

  const tileUrl = maptilerKey
    ? `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${maptilerKey}&lang=${userLang}`
    : "";

  const defaultPos: [number, number] = markers.length
    ? [markers[0].lat, markers[0].lng]
    : [41.4845, 13.4989]; // Default: Fondi

  return (
    <div
      className="w-full aspect-video sm:aspect-[16/9] min-h-[220px] h-[520px] relative z-0"
      style={{
        minHeight: 220,
        maxWidth: "100vw",
        height: "520px",
        position: "relative",
        zIndex: 0
      }}
    >
  {!maptilerKey && <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">Caricamento mappa...</div>}
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
          zoomControl={false}
        >
          <ZoomControl position="topright" />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Strade">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & MapTiler'
                url={tileUrl}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & MapTiler'
                url={maptilerKey ? `https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=${maptilerKey}` : ""}
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          <GeoLocateButton />
          {/* Pulsante reset posizione */}
          <button
            type="button"
            aria-label="Reset posizione mappa"
            className="absolute top-2 left-2 z-10 bg-white/80 rounded px-2 py-1 shadow hover:bg-blue-100"
            onClick={() => window.location.reload()}
          >
            Reset
          </button>
          {markers.map((m, i, arr) => {
            // Offset casuale se marker troppo vicini
            let lat = m.lat;
            let lng = m.lng;
            const threshold = 0.00015; // ~15m
            const isNear = arr.some((other, j) =>
              i !== j && Math.abs(other.lat - m.lat) < threshold && Math.abs(other.lng - m.lng) < threshold
            );
            if (isNear) {
              lat += (Math.random() - 0.5) * threshold;
              lng += (Math.random() - 0.5) * threshold;
            }
            // Icona personalizzata: blu se c'è immagine, rossa se manca
            const customIcon = new L.Icon({
              iconUrl: m.imageUrl
                ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
                : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
              shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            });
            return (
              <Marker
                key={`${m.lat}-${m.lng}-${m.title ?? ""}-${i}`}
                position={[lat, lng]}
                aria-label={m.title ?? "Avvistamento"}
                icon={customIcon}
              >
                <Popup maxWidth={250} closeButton={true} className="custom-popup">
                  <MapMarkerPopup cat={{
                    id: m.id ?? 0,
                    userId: 0,
                    title: m.title ?? "Avvistamento",
                    description: m.description ?? "",
                    imageUrl: m.imageUrl ?? null,
                    latitude: m.lat,
                    longitude: m.lng,
                    createdAt: m.createdAt ?? "",
                  }} />
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
}
