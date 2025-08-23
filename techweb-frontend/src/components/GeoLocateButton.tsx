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
      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center w-full gap-2 group"
      onClick={handleLocate}
      title="🧭 Trova la mia posizione attuale"
      style={{ cursor: "pointer" }}
    >
      <span className="text-lg group-hover:scale-110 transition-transform duration-200">📍</span>
      <span className="text-xs font-medium">Posizione</span>
    </button>
  );
}
