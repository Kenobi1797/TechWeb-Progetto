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
import { useMemo, useState } from "react";
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

// Componente per il pannello di controlli della mappa
function MapControlPanel({ markers }: { readonly markers: readonly MarkerData[] }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        
        {/* Header con pulsante collasso */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-b border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-between text-xs text-gray-700 font-semibold hover:text-gray-900 transition-colors"
          >
            <div className="flex items-center gap-1">
              <span>🗺️</span>
              <span>Controlli</span>
            </div>
            <span className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}>
              ⌄
            </span>
          </button>
        </div>

        {/* Contenuto collassabile */}
        <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
          <div className="p-3">
            {/* Contatore marker con icona */}
            <div className={`text-xs text-center mb-3 px-3 py-2 rounded-lg border ${
              markers.length > 0 
                ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100"
                : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
            }`}>
              <div className={`font-bold text-sm ${
                markers.length > 0 ? "text-blue-800" : "text-gray-600"
              }`}>
                {markers.length}
              </div>
              <div className={`font-medium ${
                markers.length > 0 ? "text-blue-600" : "text-gray-500"
              }`}>
                {markers.length > 0 ? "🐱 avvistamenti" : "🐱 nessun avvistamento"}
              </div>
            </div>
            
            <div className="flex flex-col gap-2 min-w-[130px]">
              <GeoLocateButton />
              <FitAllMarkersButton markers={markers} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente per il pulsante che inquadra tutti i marker
function FitAllMarkersButton({ markers }: { readonly markers: readonly MarkerData[] }) {
  const map = useMap();
  const hasMarkers = markers.length > 0;

  const handleFitAll = () => {
    if (!hasMarkers) return;
    
    const group = L.featureGroup(
      markers.map(m => L.marker([m.lat, m.lng]))
    );
    map.fitBounds(group.getBounds(), { padding: [20, 20] });
  };

  return (
    <button
      className={`${
        hasMarkers 
          ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg cursor-pointer" 
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      } border-0 rounded-lg p-3 transition-all duration-200 flex items-center justify-center w-full gap-2 group`}
      onClick={handleFitAll}
      disabled={!hasMarkers}
      title={hasMarkers ? "🔍 Mostra tutti i gatti sulla mappa" : "Nessun avvistamento da centrare"}
    >
      <span className={`text-lg ${hasMarkers ? "group-hover:scale-110" : ""} transition-transform duration-200`}>
        {hasMarkers ? "🗺️" : "🚫"}
      </span>
      <span className="text-xs font-medium">
        {hasMarkers ? "Centra tutto" : "Nessun marker"}
      </span>
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
                    <ZoomControl position="bottomleft" />
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
          <MapControlPanel markers={markers} />
          {clusteredMarkers.map((m, i) => {
            // Offset casuale se marker troppo vicini (mantenuto per ulteriore dispersione)
            let lat = m.lat;
            let lng = m.lng;
            const threshold = 0.00015; // ~15m
            if ((m.count || 1) > 1) {
              lat += (Math.random() - 0.5) * threshold * 0.5;
              lng += (Math.random() - 0.5) * threshold * 0.5;
            }
            
            // Icona personalizzata: sistema più sensato e organizzato
            const getIconColor = () => {
              // Cluster con molti avvistamenti
              if ((m.count || 1) >= 5) return "violet"; // Cluster molto grandi (5+ gatti)
              if ((m.count || 1) >= 3) return "green";  // Cluster grandi (3-4 gatti)
              if ((m.count || 1) >= 2) return "orange"; // Cluster medi (2 gatti)
              
              // Avvistamenti singoli con foto
              if (m.imageUrl) return "blue"; // Gatti con foto
              
              // Avvistamenti singoli senza foto
              return "red"; // Gatti senza foto
            };

            const getIconSize = (): [number, number] => {
              // Icone più grandi per cluster più importanti
              if ((m.count || 1) >= 5) return [35, 55]; // Cluster molto grandi
              if ((m.count || 1) >= 3) return [30, 48]; // Cluster grandi  
              if ((m.count || 1) >= 2) return [28, 45]; // Cluster medi
              return [25, 41]; // Avvistamenti singoli
            };

            const getTooltipText = () => {
              if ((m.count || 1) >= 5) return `🐾 ${m.count} gatti in questa zona! (Hotspot felino)`;
              if ((m.count || 1) >= 3) return `🐱 ${m.count} gatti avvistati qui`;
              if ((m.count || 1) >= 2) return `🐈 ${m.count} gatti in questa area`;
              if (m.imageUrl) return `📸 ${m.title || "Avvistamento"} (con foto)`;
              return `📍 ${m.title || "Avvistamento"}`;
            };
            
            const iconColor = getIconColor();
            const iconSize = getIconSize();
            const customIcon = new L.Icon({
              iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${iconColor}.png`,
              shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
              iconSize: iconSize,
              iconAnchor: [iconSize[0] / 2, iconSize[1]],
              popupAnchor: [1, -iconSize[1] + 10],
              shadowSize: [41, 41],
            });
            
            const markerTitle = getTooltipText();
              
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
                    <div className="p-4">
                      <h3 className="font-bold text-xl mb-3" style={{ color: "var(--color-primary)" }}>
                        {(m.count || 1) >= 5 ? "�" : "�🐱"} {m.count} avvistamenti in questa zona
                      </h3>
                      <div className="mb-3">
                        {(m.count || 1) >= 5 && (
                          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm mb-2 inline-block">
                            ⭐ Hotspot felino!
                          </div>
                        )}
                        <p className="text-sm text-gray-700">
                          {(() => {
                            if ((m.count || 1) >= 5) {
                              return "Questa è una zona ad alta concentrazione di gatti! Probabilmente c'è una colonia felina.";
                            } else if ((m.count || 1) >= 3) {
                              return "Zona con diversi avvistamenti. Potrebbe essere un'area frequentata dai gatti.";
                            } else {
                              return "Ci sono alcuni gatti avvistati in questa area.";
                            }
                          })()}
                        </p>
                      </div>
                      <div className="text-xs text-gray-600 flex items-center gap-2">
                        <span>📍 {m.lat.toFixed(4)}, {m.lng.toFixed(4)}</span>
                        <span className="ml-auto">🔍 Usa lo zoom per vedere i dettagli</span>
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
