import { useState } from "react";

interface CommentFormProps {
  readonly catId: string;
  readonly onCommentAdded?: () => void;
}

export default function CommentForm({ catId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const res = await fetch(`${backendUrl}/comments/${catId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Errore nell'invio del commento");
      } else {
        setContent("");
        setSuccess(true);
        if (onCommentAdded) onCommentAdded();
      }
    } catch {
      setError("Errore di rete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
      <textarea
        className="border rounded p-2 w-full"
        rows={3}
        placeholder="Scrivi il tuo commento..."
        value={content}
        onChange={e => setContent(e.target.value)}
        required
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow transition"
        disabled={loading || !content.trim()}
      >
        {loading ? "Invio..." : "Invia commento"}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">Commento inviato!</p>}
    </form>
  );
}
