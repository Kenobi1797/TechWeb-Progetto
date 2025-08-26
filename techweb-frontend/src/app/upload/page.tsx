"use client";
import UploadFormNew from "../../components/UploadForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "../../utils/toast";
import { createCat } from "../../utils/ServerConnect";
import { useAuth } from "../../utils/useAuth";

export default function UploadPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { isLoggedIn } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Breve delay per permettere al hook useAuth di inizializzarsi
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (payload: {
    title: string;
    description: string;
    lat: number;
    lng: number;
    imageData: string | null;
  }) => {
    try {
      // Convertiamo il payload nel formato che si aspetta createCat
      const catData = {
        title: payload.title,
        description: payload.description,
        latitude: payload.lat,
        longitude: payload.lng,
        userId: 0, // Sarà ignorato dal backend
        status: 'active' as const,
        // Se c'è imageData, convertiamolo in File
        imageFile: payload.imageData ? await convertDataUrlToFile(payload.imageData, 'cat-image.jpg') : undefined
      };

      await createCat(catData);
      
      addToast({
        type: "success",
        message: "🎉 Avvistamento inviato con successo! Reindirizzamento in corso...",
        duration: 3000
      });
      
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Errore durante l'upload";
      addToast({
        type: "error",
        message: errorMessage,
        duration: 6000
      });
      throw err;
    }
  };

  // Funzione helper per convertire data URL in File
  const convertDataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  if (!isLoggedIn && !isCheckingAuth) {
    return (
      <div className="min-h-screen fade-in gradient-bg">
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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen fade-in gradient-bg">
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
    <div className="min-h-screen fade-in gradient-bg">
      <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
        {/* Header con stile del sito */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl transition-transform hover:scale-105 gradient-accent"
              style={{ 
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
        
        <UploadFormNew onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
