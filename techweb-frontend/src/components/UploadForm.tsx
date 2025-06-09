import { useState } from "react";

interface UploadFormProps {
  readonly onSubmit: (form: FormData) => Promise<void> | void;
}

export default function UploadForm({ onSubmit }: UploadFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
      className="flex flex-col gap-3 max-w-md w-full mx-auto p-4 sm:p-8"
      style={{ background: "var(--color-background)" }}
    >
      <input
        type="text"
        placeholder="Titolo"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        className="border p-2 rounded"
        style={{ borderColor: "var(--color-primary)", color: "var(--color-text-primary)" }}
      />
      <textarea
        placeholder="Descrizione"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
        className="border p-2 rounded"
        style={{ borderColor: "var(--color-primary)", color: "var(--color-text-primary)" }}
      />
      <input
        type="number"
        placeholder="Latitudine"
        value={latitude}
        onChange={e => setLatitude(e.target.value)}
        required
        className="border p-2 rounded"
        style={{ borderColor: "var(--color-primary)", color: "var(--color-text-primary)" }}
      />
      <input
        type="number"
        placeholder="Longitudine"
        value={longitude}
        onChange={e => setLongitude(e.target.value)}
        required
        className="border p-2 rounded"
        style={{ borderColor: "var(--color-primary)", color: "var(--color-text-primary)" }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={e => setImage(e.target.files?.[0] || null)}
        required
        className="border p-2 rounded"
        style={{ borderColor: "var(--color-primary)", color: "var(--color-text-primary)" }}
      />
      <button
        type="submit"
        className="rounded p-2 mt-2"
        style={{
          background: "var(--color-primary)",
          color: "#fff",
        }}
      >
        Invia
      </button>
    </form>
  );
}
