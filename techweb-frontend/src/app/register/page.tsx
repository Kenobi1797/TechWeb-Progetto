"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { registerUser } from "@/utils/ServerConnect";

export default function RegisterPage() {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Funzione per determinare la forza della password
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return { level: 0, text: 'Troppo debole', color: 'bg-red-400' };
    if (pwd.length < 8) return { level: 1, text: 'Debole', color: 'bg-yellow-400' };
    if (pwd.length < 12) return { level: 2, text: 'Media', color: 'bg-blue-400' };
    return { level: 3, text: 'Forte', color: 'bg-green-400' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validazione password
    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }

    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }

    // Validazione ReCAPTCHA
    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      setError("Per favore, completa la verifica ReCAPTCHA");
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(username, email, password, recaptchaToken);
      router.push("/login?message=Registrazione completata! Puoi ora effettuare l'accesso.");
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        setError((err as { message: string }).message);
      } else {
        setError("Errore durante la registrazione");
      }
      // Reset ReCAPTCHA on error
      recaptchaRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="relative w-full max-w-md">
        {/* Card container */}
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-lg gradient-primary">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
              Unisciti a noi!
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Crea il tuo account e inizia la tua avventura felina
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Nome Utente
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5" style={{ color: "var(--color-text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Il tuo nome utente"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3"
                  style={{
                    background: "var(--color-surface)",
                    border: "1.5px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    color: "var(--color-text-primary)"
                  }}
                  required
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Indirizzo Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5" style={{ color: "var(--color-text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="la.tua@email.it"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3"
                  style={{
                    background: "var(--color-surface)",
                    border: "1.5px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    color: "var(--color-text-primary)"
                  }}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5" style={{ color: "var(--color-text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Crea una password sicura"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3"
                  style={{
                    background: "var(--color-surface)",
                    border: "1.5px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    color: "var(--color-text-primary)"
                  }}
                  required
                />
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Conferma Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5" style={{ color: "var(--color-text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Ripeti la password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3"
                  style={{
                    background: "var(--color-surface)",
                    border: "1.5px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    color: "var(--color-text-primary)"
                  }}
                  required
                />
              </div>
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="space-y-2">
                <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Sicurezza password:</div>
                <div className="flex space-x-1">
                  {Array.from({ length: 4 }, (_, i) => {
                    const strength = getPasswordStrength(password);
                    const isActive = i <= strength.level;
                    let backgroundColor = 'var(--color-border)';
                    if (isActive) {
                      if (strength.level === 0) backgroundColor = 'var(--color-accent)'; // Giallo per debole
                      else if (strength.level === 1) backgroundColor = 'var(--color-secondary)'; // Blu per media
                      else if (strength.level === 2) backgroundColor = 'var(--color-primary)'; // Blu scuro per buona
                      else backgroundColor = 'var(--color-secondary)'; // Blu per forte
                    }
                    return (
                      <div
                        key={`strength-${i}`}
                        className="h-2 flex-1 rounded-full transition-colors duration-200"
                        style={{ backgroundColor }}
                      />
                    );
                  })}
                </div>
                <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {getPasswordStrength(password).text}
                </div>
              </div>
            )}

            {/* ReCAPTCHA */}
            <div className="flex justify-center py-4">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="card card-danger p-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" style={{ color: "var(--color-accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span style={{ color: "var(--color-primary)" }} className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-3"></div>
                  Creazione account...
                </div>
              ) : (
                "Crea Account"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: "var(--color-border)" }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4" style={{ 
                  background: "var(--color-surface)", 
                  color: "var(--color-text-secondary)" 
                }}>oppure</span>
              </div>
            </div>

            {/* Login link */}
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
                Hai già un account?
              </p>
              <a
                href="/login"
                className="btn btn-secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Accedi al tuo account
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
