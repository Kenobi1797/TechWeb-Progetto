import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useToast } from "../utils/toast";

const CatLocationPicker = dynamic(() => import("./MapPicker"), { ssr: false });

interface UploadFormProps {
  readonly onSubmit: (payload: {
    title: string;
    description: string;
    lat: number;
    lng: number;
    imageData: string | null;
  }) => Promise<void> | void;
}

export default function UploadFormNew({ onSubmit }: UploadFormProps) {
  const { addToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  const validateImageFile = (file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) {
      return "L'immagine deve essere inferiore a 5MB";
    }
    
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

  const handleDrag = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
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
    
    if (!title.trim()) {
      setError("Il titolo è obbligatorio");
      return;
    }
    
    if (!description.trim()) {
      setError("La descrizione è obbligatoria");
      return;
    }
    
    if (!image) {
      setError("L'immagine è obbligatoria per creare un avvistamento");
      return;
    }
    
    if (!position) {
      setError("Seleziona una posizione sulla mappa");
      return;
    }

    setIsSubmitting(true);
    
    let imageData = null;
    try {
      imageData = await fileToBase64(image);
    } catch {
      setError("Errore nella conversione dell'immagine");
      setIsSubmitting(false);
      return;
    }
    
    const payload = {
      title: title.trim(),
      description: description.trim(),
      lat: position.lat,
      lng: position.lng,
      imageData: imageData
    };
    
    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err potrebbe avere la proprietà response solo in caso di errore API
        const errorMessage = err?.response?.data?.error || "Errore durante l'upload";
        setError(errorMessage);
      } else {
        setError("Errore imprevisto durante l'upload");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Errore nella lettura del file'));
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {error && (
        <div 
          className="rounded-lg p-4 mb-6 flex items-start gap-3 border" 
          role="alert"
          style={{ 
            background: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgba(239, 68, 68, 0.3)",
            color: "var(--color-text-primary)"
          }}
        >
          <span className="text-lg">⚠️</span>
          <div>
            <div className="font-medium">Errore</div>
            <div className="text-sm opacity-80">{error}</div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="card space-y-8"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>🐱 Nuovo avvistamento</h2>
          <p style={{ color: "var(--color-text-secondary)" }}>Compila tutti i campi per condividere il tuo avvistamento</p>
        </div>

        {/* Sezione Informazioni */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                Titolo dell&apos;avvistamento *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg transition-colors"
                style={{ 
                  borderRadius: "var(--radius)",
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)"
                }}
                placeholder="es. Gatto grigio trovato nel parco"
                aria-required="true"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="description" className="block text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                  Descrizione dettagliata *
                </label>
                <span 
                  className="text-xs px-2 py-1 rounded-full border"
                  style={{ 
                    color: "var(--color-secondary)",
                    background: "rgba(108, 155, 207, 0.1)",
                    borderColor: "rgba(108, 155, 207, 0.3)"
                  }}
                >
                  Markdown supportato
                </span>
              </div>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-3 border rounded-lg font-mono text-sm resize-vertical transition-colors"
                style={{ 
                  borderRadius: "var(--radius)",
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)"
                }}
                placeholder="Descrivi l'avvistamento in dettaglio...&#10;&#10;Puoi usare:&#10;• **grassetto** e *corsivo*&#10;• [link](https://esempio.com)&#10;• Elenchi e molto altro&#10;&#10;Esempio: Ho trovato questo **bellissimo** gatto grigio vicino al parco..."
                aria-required="true"
              />
            </div>
          </div>
        </div>

        {/* Sezione Foto */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 font-medium" style={{ color: "var(--color-primary)" }}>
            <span className="text-xl">📸</span>
            <span>Foto del gatto *</span>
          </div>

          <div className="pl-8">
            {/* Area di upload con stile del sito */}
            <label
              className="block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300"
              htmlFor="fileInput"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{ 
                borderRadius: "var(--radius)",
                borderColor: (() => {
                  if (preview) return "var(--color-accent)";
                  if (dragActive) return "var(--color-secondary)";
                  return "var(--color-border)";
                })(),
                background: (() => {
                  if (preview) return "rgba(255, 209, 102, 0.1)";
                  if (dragActive) return "rgba(108, 155, 207, 0.1)";
                  return "var(--color-surface)";
                })()
              }}
            >
              {preview ? (
                <div className="space-y-4">
                  <Image
                    src={preview}
                    alt="Anteprima"
                    width={400}
                    height={300}
                    className="mx-auto max-h-48 object-contain rounded-lg"
                    style={{ 
                      width: "auto", 
                      height: "auto", 
                      maxHeight: "12rem",
                      borderRadius: "var(--radius)"
                    }}
                  />
                  <div className="font-medium" style={{ color: "var(--color-accent)" }}>✅ Foto caricata con successo!</div>
                  <button
                    type="button"
                    onClick={() => handleFile(null)}
                    className="text-sm underline transition-colors"
                    style={{ color: "#ef4444" }}
                  >
                    Rimuovi foto
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-6xl opacity-60">📸</div>
                  <div>
                    <p className="text-lg font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                      Trascina qui la foto o clicca per selezionare
                    </p>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      Formati supportati: JPG, PNG, WebP (max 5 MB)
                    </p>
                  </div>
                </div>
              )}
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
              />
            </label>

            <div 
              className="mt-4 rounded-lg p-4 border"
              style={{ 
                background: "rgba(108, 155, 207, 0.1)",
                borderColor: "rgba(108, 155, 207, 0.3)"
              }}
            >
              <div className="flex items-start gap-3">
                <span style={{ color: "var(--color-secondary)" }} className="text-lg">💡</span>
                <div>
                  <div className="font-medium mb-1" style={{ color: "var(--color-primary)" }}>Suggerimento</div>
                  <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Una foto chiara del gatto è obbligatoria e aiuta altri utenti a riconoscerlo meglio.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sezione Posizione */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 font-medium" style={{ color: "var(--color-primary)" }}>
            <span className="text-xl">📍</span>
            <span>Posizione dell&apos;avvistamento</span>
          </div>

          <div className="space-y-4 pl-8">
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>Seleziona sulla mappa *</span>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setPosition({
                          lat: parseFloat(pos.coords.latitude.toFixed(6)),
                          lng: parseFloat(pos.coords.longitude.toFixed(6))
                        });
                        addToast({
                          type: "success",
                          message: "📍 Posizione attuale acquisita!",
                          duration: 3000
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
                className="btn btn-secondary btn-small"
              >
                <span>📍</span> Usa posizione attuale
              </button>
            </div>

            {/* Sezione per inserimento indirizzo */}
            <div 
              className="rounded-lg p-4 border"
              style={{ 
                background: "var(--color-surface)",
                borderColor: "var(--color-border)"
              }}
            >
              <label htmlFor="address" className="block text-sm font-medium mb-3" style={{ color: "var(--color-text-primary)" }}>
                🗺️ Oppure inserisci un indirizzo
              </label>
              <div className="flex gap-3">
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="es. Via Roma 123, Milano, Italia"
                  className="flex-1 px-3 py-2 border rounded-lg transition-colors"
                  style={{ 
                    borderRadius: "var(--radius)",
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface)"
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddressGeocoding}
                  disabled={isGeocoding || !address.trim()}
                  className="btn btn-success btn-small disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeocoding ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                        <path fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                      </svg>
                      Cerco...
                    </span>
                  ) : (
                    "Cerca"
                  )}
                </button>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>
                Inserisci un indirizzo completo per trovare automaticamente le coordinate
              </p>
            </div>

            {!position && (
              <div 
                className="rounded-lg p-4 border"
                style={{ 
                  background: "rgba(255, 209, 102, 0.1)",
                  borderColor: "rgba(255, 209, 102, 0.3)"
                }}
              >
                <div className="flex items-start gap-3">
                  <span style={{ color: "var(--color-accent)" }} className="text-lg">💡</span>
                  <div>
                    <p className="font-medium mb-2" style={{ color: "var(--color-primary)" }}>Come selezionare la posizione:</p>
                    <ul className="text-sm space-y-1" style={{ color: "var(--color-text-secondary)" }}>
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
              <div 
                className="rounded-lg p-4 border"
                style={{ 
                  background: "rgba(46, 213, 115, 0.1)",
                  borderColor: "rgba(46, 213, 115, 0.3)"
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">✅</span>
                  <div>
                    <p className="font-medium" style={{ color: "var(--color-primary)" }}>Posizione selezionata!</p>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      Coordinate: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6" style={{ borderTop: "1.5px solid var(--color-border)" }}>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !description.trim() || !position || !image}
            className="btn btn-primary w-full py-4 px-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                </svg>
                Invio in corso...
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span> Condividi avvistamento
              </>
            )}
          </button>
          
          <p className="text-xs mt-3 text-center" style={{ color: "var(--color-text-secondary)" }}>
            * Campi obbligatori. I tuoi dati saranno condivisi pubblicamente per aiutare la community.
          </p>
        </div>
      </form>
    </div>
  );
}
