import { useState } from "react";

interface AuthFormProps {
  readonly onSubmit: (email: string, password: string) => void;
  readonly type?: "login" | "register";
}

export default function AuthForm({ onSubmit, type = "login" }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      onSubmit(email, password);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err potrebbe avere la proprietà response solo in caso di errore API
        setError(err?.response?.data?.errors?.[0]?.msg || "Errore di autenticazione");
      } else {
        setError("Errore di autenticazione");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 max-w-xs w-full mx-auto p-4 sm:p-8"
      style={{ background: "var(--color-background)" }}
    >
      {error && <div className="error" style={{ color: 'red' }}>{error}</div>}
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
