import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "../utils/fixLeafletIcon";
import { useMemo, useState, useEffect } from "react";

interface MapPickerProps {
  readonly position?: LatLngExpression | null;
  readonly onChange: (pos: { lat: number; lng: number }) => void;
}

function PickerMarker({ position }: { readonly position?: LatLngExpression | null }) {
  if (!position) return null;
  return <Marker position={position} />;
}

function MapPicker({ position, onChange }: MapPickerProps) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return <PickerMarker position={position} />;
}

export default function CatLocationPicker({
  value,
  onChange,
}: Readonly<{
  value: { lat: number; lng: number } | null;
  onChange: (pos: { lat: number; lng: number }) => void;
}>) {
  // Rileva la lingua dell'utente
  const userLang = useMemo(() => {
    if (typeof window !== "undefined") {
      const lang = navigator.language || navigator.languages?.[0] || "en";
      return lang.split("-")[0];
    }
    return "en";
  }, []);

  // Recupera la chiave MapTiler dal backend
  const [maptilerKey, setMaptilerKey] = useState<string>("");

  useEffect(() => {
    fetch("http://localhost:5000/maptiler-key")
      .then((res) => res.json())
      .then((data) => setMaptilerKey(data.key ?? ""));
  }, []);

  const tileUrl = maptilerKey
    ? `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${maptilerKey}&lang=${userLang}`
    : "";

  return (
    <div
      className="w-full relative overflow-x-auto"
      style={{
        aspectRatio: "16/9",
        minHeight: 180,
        height: "auto",
        minWidth: 0,
        maxWidth: "100vw",
      }}
    >
      {maptilerKey && (
        <MapContainer
          center={value ? [value.lat, value.lng] : [41.4845, 13.4989]}
          zoom={13}
          minZoom={2}
          className="rounded-lg shadow h-full"
          style={{ width: "100%", height: "100%", minWidth: 0, maxWidth: "100vw" }}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
          worldCopyJump={false}
        >
          <TileLayer url={tileUrl} noWrap={true} />
          <MapPicker position={value ? [value.lat, value.lng] : undefined} onChange={onChange} />
        </MapContainer>
      )}
    </div>
  );
}
