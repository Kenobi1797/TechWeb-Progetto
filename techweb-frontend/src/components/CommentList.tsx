import { Comment } from "../utils/types";

interface CommentListProps {
  readonly comments: readonly Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  // Lista commenti con accessibilità migliorata

  return (
    <ul aria-label="Lista commenti" className="flex flex-col gap-2">
      {comments.map(c => (
        <li key={c.id} aria-label={`Commento di ${c.userId ?? 'utente'}`} className="border-b pb-2">
          <span className="font-semibold">{c.userId}</span>: {c.content}
          <time className="block text-xs text-gray-400" dateTime={new Date(c.createdAt).toISOString()}>
            {new Date(c.createdAt).toLocaleString()}
          </time>
        </li>
      ))}
    </ul>
  );
}
