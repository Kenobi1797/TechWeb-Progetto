import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";

interface UploadFormProps {
  readonly onSubmit: (form: FormData) => Promise<void> | void;
}

export default function UploadForm({ onSubmit }: UploadFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File | null) => {
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert("Seleziona un'immagine.");
      return;
    }
    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("latitude", latitude);
    form.append("longitude", longitude);
    form.append("image", image);
    await onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto p-3 sm:p-6 bg-base-100 shadow-md rounded-lg space-y-4"
      style={{ background: "var(--color-background)" }}
    >
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
        <span className="label-text">Descrizione <span className="text-xs text-gray-400">(Markdown supportato)</span></span>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          rows={3}
          className="textarea textarea-bordered w-full"
        />
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="number"
          placeholder="Latitudine"
          value={latitude}
          onChange={e => setLatitude(e.target.value)}
          required
          className="input input-bordered w-full"
        />
        <input
          type="number"
          placeholder="Longitudine"
          value={longitude}
          onChange={e => setLongitude(e.target.value)}
          required
          className="input input-bordered w-full"
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
