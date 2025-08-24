"use client";
import UploadFormNew from "../../components/UploadForm";
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

  const handleSubmit = async (payload: {
    title: string;
    description: string;
    lat: number;
    lng: number;
    imageData: string | null;
  }) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/cats`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload),
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
      <div className="min-h-screen fade-in" style={{ background: "linear-gradient(120deg, var(--color-background) 60%, var(--color-secondary) 100%)" }}>
        <div className="container mx-auto py-12 px-4 text-center">
          <div className="card max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>
              🔒 Accesso richiesto
            </h1>
            <p className="mb-6" style={{ color: "var(--color-text-secondary)" }}>
              Devi essere autenticato per inserire un nuovo avvistamento
            </p>
            <a href="/login" className="btn btn-primary">Vai al login</a>
          </div>
        </div>
      </div>
    );
  }

  if (isAuth === null) {
    return (
      <div className="min-h-screen fade-in" style={{ background: "linear-gradient(120deg, var(--color-background) 60%, var(--color-secondary) 100%)" }}>
        <div className="container mx-auto py-12 px-4 text-center">
          <div className="card max-w-md mx-auto">
            <div className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none" style={{ color: "var(--color-primary)" }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
              </svg>
              <span style={{ color: "var(--color-text-primary)" }}>Verifica autenticazione...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen fade-in" style={{ background: "linear-gradient(120deg, var(--color-background) 60%, var(--color-secondary) 100%)" }}>
      <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
        {/* Header con stile del sito */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl transition-transform hover:scale-105"
              style={{ 
                background: "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%)",
                boxShadow: "var(--color-shadow)"
              }}
            >
              📸
            </div>
            <h1 style={{ color: "var(--color-primary)" }}>
              Nuovo Avvistamento
            </h1>
          </div>
          <p className="text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Condividi il tuo avvistamento di un gatto randagio con la community. 
            Ogni segnalazione aiuta a prendersi cura dei nostri amici felini! 🐱
          </p>
        </div>
        
        {/* Cards con stile glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="card text-center">
            <div className="text-2xl mb-1">🐱</div>
            <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Aiuta i gatti</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl mb-1">🌍</div>
            <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Community globale</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl mb-1">❤️</div>
            <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Facile e veloce</div>
          </div>
        </div>
        
        <UploadFormNew onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
