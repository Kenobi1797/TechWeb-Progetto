import { useState } from "react";

interface AuthFormProps {
  readonly onSubmit: (email: string, password: string) => void;
  readonly type?: "login" | "register";
}

export default function AuthForm({ onSubmit, type = "login" }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(email, password); }} className="flex flex-col gap-3 max-w-xs mx-auto">
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border p-2 rounded" />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="border p-2 rounded" />
      <button type="submit" className="bg-blue-600 text-white rounded p-2">{type === "login" ? "Login" : "Registrati"}</button>
    </form>
  );
}
