import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "../utils/fixLeafletIcon";
import { useMemo } from "react";

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

  // Sostituisci con la tua MapTiler API KEY gratuita
  const MAPTILER_KEY = "get_your_own_D6rA4zTHduk6KOKTXzGB"; // demo key, sostituisci in produzione

  const tileUrl = `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}&lang=${userLang}`;

  return (
    <div className="h-64 w-full mb-2">
      <MapContainer
        center={value ? [value.lat, value.lng] : [41.4845, 13.4989]}
        zoom={13}
        minZoom={2}
        className="h-full rounded-lg shadow"
        style={{ minHeight: 200, width: "100%" }}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
      >
        <TileLayer url={tileUrl} noWrap={true} />
        <MapPicker position={value ? [value.lat, value.lng] : undefined} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
