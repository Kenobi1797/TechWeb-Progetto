import { Comment } from "../utils/types";

interface CommentListProps {
  readonly comments: readonly Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {comments.map(c => (
        <li key={c.id} className="border-b pb-2">
          <span className="font-semibold">{c.userId}</span>: {c.text}
          <time className="block text-xs text-gray-400" dateTime={new Date(c.createdAt).toISOString()}>
            {new Date(c.createdAt).toLocaleString()}
          </time>
        </li>
      ))}
    </ul>
  );
}
