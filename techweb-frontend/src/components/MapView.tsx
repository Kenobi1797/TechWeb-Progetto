"use client";
import "../utils/fixLeafletIcon";
import dynamic from "next/dynamic";
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });
const ZoomControl = dynamic(() => import("react-leaflet").then(mod => mod.ZoomControl), { ssr: false });
import { LayersControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useMemo } from "react";
import { useDataCache } from "../utils/DataContext";

import MapMarkerPopup from "./MapMarkerPopup";

const GeoLocateButton = dynamic(() => import("./GeoLocateButton"), { ssr: false });

// Funzione per raggruppare marker vicini
function clusterNearbyMarkers(markers: readonly MarkerData[], maxDistance = 0.001) {
  const clusters: (MarkerData & { count?: number })[] = [];
  const processed = new Set<number>();

  markers.forEach((marker, index) => {
    if (processed.has(index)) return;

    const cluster = { ...marker, count: 1 };
    processed.add(index);

    // Trova marker vicini
    markers.forEach((otherMarker, otherIndex) => {
      if (processed.has(otherIndex) || index === otherIndex) return;

      const distance = Math.sqrt(
        Math.pow(marker.lat - otherMarker.lat, 2) + 
        Math.pow(marker.lng - otherMarker.lng, 2)
      );

      if (distance < maxDistance) {
        cluster.count = (cluster.count || 1) + 1;
        processed.add(otherIndex);
      }
    });

    clusters.push(cluster);
  });

  return clusters;
}

// Componente per il pulsante che inquadra tutti i marker
function FitAllMarkersButton({ markers }: { readonly markers: readonly MarkerData[] }) {
  const map = useMap();

  const handleFitAll = () => {
    if (markers.length === 0) return;
    
    const group = L.featureGroup(
      markers.map(m => L.marker([m.lat, m.lng]))
    );
    map.fitBounds(group.getBounds(), { padding: [20, 20] });
  };

  return (
    <button
      className="absolute top-2 right-2 z-[1000] bg-white border border-gray-300 rounded px-3 py-1 shadow hover:bg-gray-100 transition"
      onClick={handleFitAll}
      title="Inquadra tutti i marker"
      style={{ cursor: "pointer" }}
    >
      🗺️
    </button>
  );
}

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
  const { maptilerKey } = useDataCache();
  
  // Clustering dei marker
  const clusteredMarkers = useMemo(() => {
    return clusterNearbyMarkers(markers);
  }, [markers]);
  
  // Lingua utente
  const userLang = useMemo(() => {
    if (typeof window !== "undefined") {
      const lang = navigator.language || navigator.languages?.[0] || "en";
      return lang.split("-")[0];
    }
    return "en";
  }, []);

  const tileUrl = maptilerKey
    ? `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${maptilerKey}&lang=${userLang}`
    : "";

  const satelliteUrl = maptilerKey
    ? `https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=${maptilerKey}`
    : "";

  const hybridUrl = maptilerKey
    ? `https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}.jpg?key=${maptilerKey}&lang=${userLang}`
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
  {!maptilerKey && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
      Inizializzazione mappa...
    </div>
  )}
  {maptilerKey && (
        <MapContainer
          center={defaultPos}
          zoom={13}
          minZoom={2}
          maxZoom={19}
          style={{ width: "100%", height: "100%" }}
          className="rounded-lg shadow-sm h-full"
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
          worldCopyJump={false}
          zoomControl={false}
          preferCanvas={true}
          key={`map-${maptilerKey}`}
        >
          <ZoomControl position="topleft" />
          <LayersControl position="topleft">
            <LayersControl.BaseLayer checked name="Strade">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & MapTiler'
                url={tileUrl}
                key="streets-layer"
                maxZoom={19}
                errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & MapTiler'
                url={satelliteUrl}
                key="satellite-layer"
                maxZoom={19}
                errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Ibrida">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & MapTiler'
                url={hybridUrl}
                key="hybrid-layer"
                maxZoom={19}
                errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          <GeoLocateButton />
          <FitAllMarkersButton markers={markers} />
          {clusteredMarkers.map((m, i) => {
            // Offset casuale se marker troppo vicini (mantenuto per ulteriore dispersione)
            let lat = m.lat;
            let lng = m.lng;
            const threshold = 0.00015; // ~15m
            if ((m.count || 1) > 1) {
              lat += (Math.random() - 0.5) * threshold * 0.5;
              lng += (Math.random() - 0.5) * threshold * 0.5;
            }
            
            // Icona personalizzata: diversi colori per cluster
            const getIconColor = () => {
              if ((m.count || 1) > 3) return "green"; // Cluster grandi
              if ((m.count || 1) > 1) return "orange"; // Cluster medi
              return m.imageUrl ? "blue" : "red"; // Singoli marker
            };
            
            const iconColor = getIconColor();
            const customIcon = new L.Icon({
              iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${iconColor}.png`,
              shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            });
            
            const markerTitle = (m.count || 1) > 1 
              ? `${m.count} avvistamenti in questa zona`
              : (m.title ?? "Avvistamento");
              
            return (
              <Marker
                key={`${m.lat}-${m.lng}-${m.title ?? ""}-${i}`}
                position={[lat, lng]}
                aria-label={markerTitle}
                icon={customIcon}
              >
                <Popup 
                  maxWidth={300} 
                  closeButton={true} 
                  className="custom-popup"
                  autoPan={true}
                  keepInView={true}
                  closeOnEscapeKey={true}
                >
                  {(m.count || 1) > 1 ? (
                    <div className="p-3">
                      <h3 className="font-bold text-lg mb-2" style={{ color: "var(--color-primary)" }}>
                        🐱 {m.count} avvistamenti in questa zona
                      </h3>
                      <p className="text-sm mb-3">
                        Ci sono {m.count} gatti avvistati in questa area. 
                        Usa lo zoom per vedere i dettagli individuali.
                      </p>
                      <div className="text-xs text-gray-600">
                        📍 {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                      </div>
                    </div>
                  ) : (
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
                  )}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
}
