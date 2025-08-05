import { useMap } from "react-leaflet";

export default function GeoLocateButton() {
  const map = useMap();

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 15);
        },
        () => {
          alert("Impossibile ottenere la posizione.");
        }
      );
    } else {
      alert("Geolocalizzazione non supportata.");
    }
  };

  return (
    <button
      className="absolute top-2 right-2 z-[1000] bg-white border border-gray-300 rounded px-3 py-1 shadow hover:bg-gray-100 transition"
      onClick={handleLocate}
      title="Centra sulla tua posizione"
      style={{ cursor: "pointer" }}
    >
      📍
    </button>
  );
}
