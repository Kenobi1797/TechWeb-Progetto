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
      {error && <div className="error" role="alert" style={{ color: 'red', marginBottom: '8px' }}>{error}</div>}
      <label htmlFor="email" className="label-text">Email</label>
      <input
        id="email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="border p-2 rounded focus:ring-2 focus:ring-primary"
        style={{ borderColor: "var(--color-primary)", color: "var(--color-text-primary)" }}
        aria-required="true"
        aria-label="Email"
      />
      <label htmlFor="password" className="label-text">Password</label>
      <input
        id="password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="border p-2 rounded focus:ring-2 focus:ring-primary"
        style={{ borderColor: "var(--color-primary)", color: "var(--color-text-primary)" }}
        aria-required="true"
        aria-label="Password"
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
