import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";

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
  const defaultPos: [number, number] = markers.length
    ? [markers[0].lat, markers[0].lng]
    : [41.4845, 13.4989]; // Default: Fondi

  return (
    <MapContainer center={defaultPos} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {markers.map((m) => (
        <Marker
          key={`${m.lat}-${m.lng}-${m.title ?? ""}`}
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
                />
              </div>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
