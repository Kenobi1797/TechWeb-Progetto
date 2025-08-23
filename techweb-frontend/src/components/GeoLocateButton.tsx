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
      className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex items-center justify-center w-10 h-10 group"
      onClick={handleLocate}
      title="🧭 Trova la mia posizione"
      style={{ cursor: "pointer" }}
    >
      <span className="text-lg group-hover:scale-110 transition-transform duration-200">📍</span>
    </button>
  );
}
