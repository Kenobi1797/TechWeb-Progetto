import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "../utils/fixLeafletIcon";
import { useMemo, useState, useEffect } from "react";
import { fetchMaptilerKey } from "../utils/ServerConnect";

interface MapPickerProps {
  readonly position?: LatLngExpression | null;
  readonly onChange: (pos: { lat: number; lng: number }) => void;
}

function PickerMarker({ position }: { readonly position?: LatLngExpression | null }) {
  if (!position) return null;
  return <Marker position={position} aria-label="Posizione selezionata" />;
}

function MapPicker({ position, onChange }: MapPickerProps) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      // Limita le coordinate a massimo 6 decimali
      const lat = parseFloat(e.latlng.lat.toFixed(6));
      const lng = parseFloat(e.latlng.lng.toFixed(6));
      onChange({ lat, lng });
    },
  });

  // Centra la mappa quando viene impostata una nuova posizione
  useEffect(() => {
    if (position && Array.isArray(position) && position.length === 2) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return <PickerMarker position={position} />;
}

function GeoLocateButton({ onChange }: Readonly<{ onChange: (pos: { lat: number; lng: number }) => void }>) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocalizzazione non supportata dal browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Limita le coordinate a massimo 6 decimali
        const lat = parseFloat(latitude.toFixed(6));
        const lng = parseFloat(longitude.toFixed(6));
        map.setView([lat, lng], 15);
        onChange({ lat, lng });
        setIsLocating(false);
      },
      () => {
        alert("Impossibile ottenere la posizione");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <button
      className="absolute bottom-2 right-2 z-[1000] bg-white border border-gray-300 rounded px-3 py-1 shadow hover:bg-gray-100 transition disabled:opacity-50"
      onClick={handleLocate}
      disabled={isLocating}
      title="Centra sulla tua posizione"
      style={{ cursor: isLocating ? "wait" : "pointer" }}
    >
      {isLocating ? "⏳" : "📍"}
    </button>
  );
}

export default function CatLocationPicker({ value, onChange }: Readonly<{
  value: { lat: number; lng: number } | null;
  onChange: (pos: { lat: number; lng: number }) => void;
}>) {
  // Lingua utente
  const userLang = useMemo(() => {
    if (typeof window !== "undefined") {
      const lang = navigator.language || navigator.languages?.[0] || "en";
      return lang.split("-")[0];
    }
    return "en";
  }, []);

  const [maptilerKey, setMaptilerKey] = useState<string>("");
  useEffect(() => {
    fetchMaptilerKey().then((key) => setMaptilerKey(key));
  }, []);

  const tileUrl = maptilerKey
    ? `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${maptilerKey}&lang=${userLang}`
    : "";

  return (
    <div
      className="w-full relative aspect-video sm:aspect-[16/9]"
      style={{
        minHeight: 180,
        minWidth: 0,
        maxWidth: "100vw",
        height: "auto",
      }}
    >
      {maptilerKey && (
        <MapContainer
          center={value ? [value.lat, value.lng] : [41.4845, 13.4989]}
          zoom={13}
          minZoom={2}
          className="rounded-lg shadow h-full"
          style={{ width: "100%", height: "100%" }}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
          worldCopyJump={false}
        >
          <TileLayer url={tileUrl} />
          <MapPicker position={value ? [value.lat, value.lng] : undefined} onChange={onChange} />
          <GeoLocateButton onChange={onChange} />
        </MapContainer>
      )}
    </div>
  );
}
