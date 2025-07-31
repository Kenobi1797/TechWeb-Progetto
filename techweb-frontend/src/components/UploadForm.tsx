import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import MarkdownViewer from "./MarkdownViewer";

const CatLocationPicker = dynamic(() => import("./MapPicker"), { ssr: false });

interface UploadFormProps {
  readonly onSubmit: (form: FormData) => Promise<void> | void;
}

export default function UploadForm({ onSubmit }: UploadFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

  const handleFile = (file: File | null) => {
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!image) {
      alert("Seleziona un'immagine.");
      return;
    }
    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    if (image) form.append("image", image);
    if (position) {
      form.append("lat", String(position.lat));
      form.append("lng", String(position.lng));
    }
    try {
      await onSubmit(form);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err potrebbe avere la proprietà response solo in caso di errore API
        setError(err?.response?.data?.errors?.[0]?.msg || "Errore di upload");
      } else {
        setError("Errore di upload");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto p-3 sm:p-6 bg-base-100 shadow-md rounded-lg space-y-4"
      style={{ background: "var(--color-background)" }}
    >
      {error && <div className="error" style={{ color: 'red' }}>{error}</div>}
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
      <label className="block">
        <span className="label-text">Titolo</span>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="input input-bordered w-full"
        />
      </label>
      <label className="block">
        <div className="flex items-center justify-between mb-1">
          <span className="label-text flex items-center gap-2">
            Descrizione{" "}
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
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={4}
            className="textarea textarea-bordered w-full font-mono bg-yellow-50 dark:bg-gray-900/40 border-yellow-200 dark:border-yellow-700"
            placeholder="Puoi usare **grassetto**, *corsivo*, [link](url), elenchi, ecc.&#10;&#10;Esempio:&#10;## Gatto trovato!&#10;Questo **bellissimo** gatto *sembrava* perso..."
          />
        )}
      </label>
      <div>
        <span className="label-text mb-1 block">Posizione sulla mappa</span>
        <CatLocationPicker value={position} onChange={setPosition} />
        <input
          type="text"
          readOnly
          value={position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : ""}
          placeholder="Clicca sulla mappa per selezionare la posizione"
          className="input input-bordered w-full"
          style={{ background: "#f9fafb" }}
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full mt-2"
        style={{
          background: "var(--color-primary)",
          color: "#fff",
        }}
      >
        Invia avvistamento
      </button>
    </form>
  );
}
