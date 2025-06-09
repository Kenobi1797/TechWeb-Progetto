import { useState } from "react";

interface UploadFormProps {
  readonly onSubmit: (data: FormData) => void;
}

export default function UploadForm({ onSubmit }: UploadFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("latitude", latitude);
    form.append("longitude", longitude);
    form.append("image", image);
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input type="text" placeholder="Titolo" value={title} onChange={e => setTitle(e.target.value)} required className="border p-2 rounded" />
      <textarea placeholder="Descrizione" value={description} onChange={e => setDescription(e.target.value)} required className="border p-2 rounded" />
      <input type="number" placeholder="Latitudine" value={latitude} onChange={e => setLatitude(e.target.value)} required className="border p-2 rounded" />
      <input type="number" placeholder="Longitudine" value={longitude} onChange={e => setLongitude(e.target.value)} required className="border p-2 rounded" />
      <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} required className="border p-2 rounded" />
      <button type="submit" className="bg-blue-600 text-white rounded p-2 mt-2">Invia</button>
    </form>
  );
}
