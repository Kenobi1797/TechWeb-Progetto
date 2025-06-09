import { useState } from "react";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (image) {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("latitude", latitude);
      form.append("longitude", longitude);
      form.append("image", image);
      // Invio reale del form a /cats
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/cats`,
          {
            method: "POST",
            body: form,
          }
        );
        if (!response.ok) throw new Error("Errore nell'upload");
        alert("Avvistamento inviato con successo!");
      } catch {
        alert("Errore durante l'invio dell'avvistamento.");
      }
    } else {
      alert("Seleziona un'immagine.");
    }
  };

  return (
    <div
      className="max-w-md w-full mx-auto p-4 sm:p-8"
      style={{
        background: "var(--color-background)",
        color: "var(--color-text-primary)",
      }}
    >
      <h1
        className="text-xl font-bold mb-4"
        style={{ color: "var(--color-primary)" }}
      >
        Nuovo Avvistamento
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Titolo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border p-2 rounded"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-text-primary)",
          }}
        />
        <textarea
          placeholder="Descrizione"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="border p-2 rounded"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-text-primary)",
          }}
        />
        <input
          type="number"
          placeholder="Latitudine"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          required
          className="border p-2 rounded"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-text-primary)",
          }}
        />
        <input
          type="number"
          placeholder="Longitudine"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          required
          className="border p-2 rounded"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-text-primary)",
          }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          required
          className="border p-2 rounded"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-text-primary)",
          }}
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
    </div>
  );
}
