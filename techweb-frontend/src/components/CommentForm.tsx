import { useState } from "react";
import { addComment } from "../utils/ServerConnect";

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
      await addComment(catId, content);
      setContent("");
      setSuccess(true);
      if (onCommentAdded) onCommentAdded();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Errore nell'invio del commento");
      } else {
        setError("Errore nell'invio del commento");
      }
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
