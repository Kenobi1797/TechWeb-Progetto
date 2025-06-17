import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "../utils/fixLeafletIcon";

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
  return (
    <div className="h-64 w-full mb-2">
      <MapContainer
        center={value ? [value.lat, value.lng] : [41.4845, 13.4989]}
        zoom={13}
        className="h-full rounded-lg shadow"
        style={{ minHeight: 200, width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapPicker position={value ? [value.lat, value.lng] : undefined} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
