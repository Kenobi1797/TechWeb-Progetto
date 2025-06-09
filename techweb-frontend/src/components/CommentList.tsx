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
          <span className="block text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}
