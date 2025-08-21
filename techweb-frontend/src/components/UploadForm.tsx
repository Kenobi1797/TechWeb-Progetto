import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import MarkdownViewer from "./MarkdownViewer";
import { useToast } from "../utils/toast";

const CatLocationPicker = dynamic(() => import("./MapPicker"), { ssr: false });

interface UploadFormProps {
  readonly onSubmit: (form: FormData) => Promise<void> | void;
}

export default function UploadForm({ onSubmit }: UploadFormProps) {
  const { addToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  const validateImageFile = (file: File): string | null => {
    // Controlla la dimensione (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return "L'immagine deve essere inferiore a 5MB";
    }
    
    // Controlla il tipo di file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return "Formato non supportato. Usa JPG, PNG o WebP";
    }
    
    return null;
  };

  const handleFile = (file: File | null) => {
    if (!file) {
      setImage(null);
      setPreview(null);
      setError(null);
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setImage(file);
    setPreview(URL.createObjectURL(file));
    
    // Notifica di successo
    addToast({
      type: "success",
      message: `✅ Immagine caricata (${Math.round(file.size/1024)}KB)`,
      duration: 3000
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddressGeocoding = async () => {
    if (!address.trim()) {
      setError("Inserisci un indirizzo da cercare");
      return;
    }

    setIsGeocoding(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/geocode?address=${encodeURIComponent(address.trim())}`
      );
      
      if (!response.ok) {
        throw new Error("Errore durante la geocodifica");
      }

      const data = await response.json();
      
      if (data.lat && data.lng) {
        setPosition({ lat: data.lat, lng: data.lng });
        addToast({
          type: "success",
          message: `📍 Posizione trovata: ${data.display_name || address}`,
          duration: 4000
        });
      } else {
        throw new Error("Indirizzo non trovato");
      }
    } catch (err) {
      console.error("Errore durante il geocoding:", err);
      const errorMessage = err instanceof Error ? err.message : "Errore sconosciuto";
      setError(`Impossibile trovare l'indirizzo: ${errorMessage}. Prova con un indirizzo più specifico o usa la mappa.`);
      addToast({
        type: "error",
        message: "🚫 Indirizzo non trovato",
        duration: 4000
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validazioni
    if (!title.trim()) {
      setError("Il titolo è obbligatorio");
      return;
    }
    
    if (!description.trim()) {
      setError("La descrizione è obbligatoria");
      return;
    }
    
    if (!image) {
      setError("Seleziona un'immagine");
      return;
    }
    
    if (!position) {
      setError("Seleziona una posizione sulla mappa");
      return;
    }

    setIsSubmitting(true);
    
    const form = new FormData();
    form.append("title", title.trim());
    form.append("description", description.trim());
    form.append("image", image);
    form.append("lat", String(position.lat));
    form.append("lng", String(position.lng));
    
    try {
      await onSubmit(form);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err potrebbe avere la proprietà response solo in caso di errore API
        setError(err?.response?.data?.error || "Errore durante l'upload");
      } else {
        setError("Errore durante l'upload");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto p-3 sm:p-6 bg-base-100 shadow-md rounded-lg space-y-4"
      style={{ background: "var(--color-background)" }}
    >
      {error && <div className="error-message text-red-500 mb-3 text-sm text-center" role="alert">{error}</div>}
      <h2 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: "var(--color-primary)" }}>
        Nuovo avvistamento 🐱
      </h2>
      <label
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-colors
          ${dragActive ? "border-accent bg-accent/10" : "border-secondary hover:bg-secondary/10"}`}
        htmlFor="fileInput"
        onDragEnter={(e) => { handleDrag(e as unknown as React.DragEvent<HTMLDivElement>); }}
        onDragOver={(e) => { handleDrag(e as unknown as React.DragEvent<HTMLDivElement>); }}
        onDragLeave={(e) => { handleDrag(e as unknown as React.DragEvent<HTMLDivElement>); }}
        onDrop={(e) => { handleDrop(e as unknown as React.DragEvent<HTMLDivElement>); }}
        style={{ display: "block" }}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Anteprima"
            width={320}
            height={192}
            className="mx-auto max-h-40 sm:max-h-48 object-contain rounded"
            style={{ width: "auto", height: "auto", maxHeight: "12rem" }}
          />
        ) : (
          <p className="text-xs sm:text-sm text-gray-500">
            Trascina qui o clicca per selezionare un&apos;immagine (max 5 MB)
          </p>
        )}
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />
      </label>
      <label htmlFor="title" className="block label-text">Titolo</label>
      <input
        id="title"
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        className="input input-bordered w-full focus:ring-2 focus:ring-primary"
        style={{
          backgroundColor: "#ffffff",
          color: "#2d3748",
          borderColor: "#d1d5db"
        }}
        aria-required="true"
        aria-label="Titolo"
        placeholder="es. Gatto grigio trovato nel parco"
      />
      <label htmlFor="description" className="block label-text">Descrizione</label>
      <div className="flex items-center justify-between mb-1">
        <span className="label-text flex items-center gap-2">
          <span>Descrizione</span>
          <span className="text-xs text-blue-700 bg-blue-100 dark:bg-blue-900/60 dark:text-blue-200 px-2 py-0.5 rounded font-mono border border-blue-200 dark:border-blue-800">
            Markdown
          </span>
        </span>
        <button
          type="button"
          onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {showMarkdownPreview ? "Modifica" : "Anteprima"}
        </button>
      </div>
      {showMarkdownPreview ? (
        <div className="border border-gray-300 rounded p-3 min-h-[5rem] bg-white">
          <MarkdownViewer className="prose prose-sm max-w-none">
            {description || "*Nessuna descrizione*"}
          </MarkdownViewer>
        </div>
      ) : (
        <textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          rows={4}
          className="textarea textarea-bordered w-full font-mono focus:ring-2 focus:ring-primary"
          style={{
            backgroundColor: "#fefefe",
            color: "#2d3748",
            borderColor: "#d1d5db",
            fontSize: "14px",
            lineHeight: "1.5"
          }}
          placeholder="Puoi usare **grassetto**, *corsivo*, [link](url), elenchi, ecc.&#10;&#10;Esempio:&#10;## Gatto trovato!&#10;Questo **bellissimo** gatto *sembrava* perso..."
          aria-required="true"
          aria-label="Descrizione"
        />
      )}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="label-text">Posizione sulla mappa</span>
          <button
            type="button"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setPosition({
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude
                    });
                  },
                  () => {
                    setError("Impossibile ottenere la posizione attuale");
                  }
                );
              } else {
                setError("Geolocalizzazione non supportata dal browser");
              }
            }}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
          >
            📍 Usa posizione attuale
          </button>
        </div>
        
        {/* Sezione per inserimento indirizzo */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <label htmlFor="address" className="block text-sm font-medium mb-2">
            🗺️ Inserisci un indirizzo (opzionale)
          </label>
          <div className="flex gap-2">
            <input
              id="address"
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="es. Via Roma 123, Milano, Italia"
              className="input input-bordered flex-1 text-sm"
              style={{
                backgroundColor: "#ffffff",
                color: "#2d3748",
                borderColor: "#d1d5db"
              }}
            />
            <button
              type="button"
              onClick={handleAddressGeocoding}
              disabled={isGeocoding || !address.trim()}
              className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-0 disabled:opacity-50"
            >
              {isGeocoding ? (
                <span className="flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                    <path fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                  </svg>
                  ...
                </span>
              ) : (
                "Cerca"
              )}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Inserisci un indirizzo completo per trovare automaticamente le coordinate
          </p>
        </div>

        {!position && (
          <div className="text-sm bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3 rounded-lg mb-2">
            <div className="flex items-start gap-2">
              <span className="text-amber-600 text-lg">💡</span>
              <div>
                <p className="text-amber-700 font-medium mb-1">Come selezionare la posizione:</p>
                <ul className="text-amber-600 text-xs space-y-1">
                  <li>• <strong>Inserisci un indirizzo</strong> nel campo sopra e clicca &quot;Cerca&quot;</li>
                  <li>• <strong>Clicca sulla mappa</strong> per scegliere manualmente la posizione</li>
                  <li>• <strong>Usa il tuo GPS</strong> con il pulsante &quot;📍 Usa posizione attuale&quot;</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        <CatLocationPicker value={position} onChange={setPosition} />
        {position && (
          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              ✅ <strong>Posizione selezionata!</strong>
              <span className="text-xs opacity-75">
                ({position.lat.toFixed(4)}, {position.lng.toFixed(4)})
              </span>
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input
            type="text"
            name="latitude"
            required
            readOnly
            value={position ? position.lat.toFixed(6) : ""}
            placeholder="Latitudine"
            className="input input-bordered text-sm"
            style={{ 
              backgroundColor: "#f8f9fa",
              color: "#495057",
              borderColor: "#dee2e6",
              fontFamily: "monospace"
            }}
          />
          <input
            type="text"
            name="longitude"
            required
            readOnly
            value={position ? position.lng.toFixed(6) : ""}
            placeholder="Longitudine"
            className="input input-bordered text-sm"
            style={{ 
              backgroundColor: "#f8f9fa",
              color: "#495057",
              borderColor: "#dee2e6",
              fontFamily: "monospace"
            }}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !title.trim() || !description.trim() || !image || !position}
        className="btn btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: isSubmitting ? "var(--color-secondary)" : "var(--color-primary)",
          color: "#fff",
        }}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
              <path fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
            </svg>
            Invio in corso...
          </span>
        ) : (
          "Invia avvistamento"
        )}
      </button>
    </form>
  );
}
