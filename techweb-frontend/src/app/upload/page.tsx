"use client";
import UploadForm from "../../components/UploadForm";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../../utils/toast";

export default function UploadPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const checkedAuth = useRef(false);
  const [isAuth, setIsAuth] = useState<null | boolean>(null);

  useEffect(() => {
    if (checkedAuth.current) return;
    checkedAuth.current = true;
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuth(false);
      } else {
        setIsAuth(true);
      }
    }
  }, [router]);

  const handleSubmit = async (form: FormData) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/cats`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: form,
        }
      );
      
      // Se il server non risponde, gestiamo come errore di connessione
      if (!res) {
        throw new Error("NETWORK_ERROR");
      }
      
      const data = await res.json();
      
      if (res.ok) {
        addToast({
          type: "success",
          message: "🎉 Avvistamento inviato con successo! Reindirizzamento in corso...",
          duration: 3000
        });
        
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        // Errore dal server ma connessione OK - mostra l'errore specifico
        const errorMessage = data.error || "Errore durante l'upload";
        addToast({
          type: "error",
          message: errorMessage,
          duration: 6000
        });
        throw new Error(errorMessage);
      }
    } catch (err) {
      // Solo per errori di rete reali
      if (err instanceof TypeError && err.message.includes("fetch")) {
        addToast({
          type: "error",
          message: "⚠️ Errore di connessione al server. Verifica la tua connessione e riprova.",
          duration: 6000
        });
        throw new Error("Errore di connessione al server");
      } else if (String(err).includes("NETWORK_ERROR")) {
        addToast({
          type: "error", 
          message: "⚠️ Server non raggiungibile. Riprova più tardi.",
          duration: 6000
        });
        throw new Error("Server non raggiungibile");
      }
      // Per altri errori, rilancia l'errore originale senza toast aggiuntivi
      throw err;
    }
  };

  if (isAuth === false) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>
          🔒 Accesso richiesto
        </h1>
        <p className="text-gray-600 mb-6">
          Devi essere autenticato per inserire un nuovo avvistamento
        </p>
        <a href="/login" className="btn btn-primary">Vai al login</a>
      </div>
    );
  }

  if (isAuth === null) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
            <path fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
          </svg>
          <span>Verifica autenticazione...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-3xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
          📸 Nuovo avvistamento
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Condividi il tuo avvistamento di un gatto randagio con la community
        </p>
      </div>
      
      <UploadForm onSubmit={handleSubmit} />
    </div>
  );
}
