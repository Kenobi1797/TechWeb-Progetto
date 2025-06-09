import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type MarkerData = {
  lat: number;
  lng: number;
  title?: string;
  imageUrl?: string;
};

interface MapViewProps {
  markers: MarkerData[];
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
      {markers.map((m, i) => (
        <Marker key={i} position={[m.lat, m.lng]}>
          <Popup>
            <strong>{m.title || "Avvistamento"}</strong>
            {m.imageUrl && (
              <div>
                <img src={m.imageUrl} alt={m.title} style={{ maxWidth: 120, marginTop: 4 }} />
              </div>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
