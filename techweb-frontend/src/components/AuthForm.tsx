import { useState } from "react";

interface AuthFormProps {
  readonly onSubmit: (email: string, password: string) => void;
  readonly type?: "login" | "register";
}

export default function AuthForm({ onSubmit, type = "login" }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form
      onSubmit={e => { e.preventDefault(); onSubmit(email, password); }}
      className="flex flex-col gap-3 max-w-xs w-full mx-auto p-4 sm:p-8"
      style={{ background: "var(--color-background)" }}
    >
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="border p-2 rounded"
        style={{ borderColor: "var(--color-primary)", color: "var(--color-text-primary)" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="border p-2 rounded"
        style={{ borderColor: "var(--color-primary)", color: "var(--color-text-primary)" }}
      />
      <button
        type="submit"
        className="rounded p-2"
        style={{
          background: "var(--color-primary)",
          color: "#fff",
        }}
      >
        {type === "login" ? "Login" : "Registrati"}
      </button>
    </form>
  );
}
