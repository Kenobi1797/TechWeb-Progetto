import UploadForm from "../components/UploadForm";

export default function UploadPage() {
  const handleUpload = async (form: FormData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/cats`,
        {
          method: "POST",
          body: form,
        }
      );
      if (!response.ok) throw new Error("Errore nell'upload");
      alert("Avvistamento inviato con successo!");
    } catch {
      alert("Errore durante l'invio dell'avvistamento.");
    }
  };

  return (
    <div
      className="max-w-md w-full mx-auto p-4 sm:p-8"
      style={{
        background: "var(--color-background)",
        color: "var(--color-text-primary)",
      }}
    >
      <h1
        className="text-xl font-bold mb-4"
        style={{ color: "var(--color-primary)" }}
      >
        Nuovo Avvistamento
      </h1>
      <UploadForm onSubmit={handleUpload} />
    </div>
  );
}
