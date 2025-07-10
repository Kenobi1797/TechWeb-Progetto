"use client";
import UploadForm from "../../../components/UploadForm";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function UploadPage() {
  const router = useRouter();
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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/cats`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      }
    );
    if (res.ok) {
      router.push("/");
    } else {
      alert("Errore durante l'upload");
    }
  };

  if (isAuth === false) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>
          Devi essere autenticato per inserire un nuovo avvistamento
        </h1>
        <a href="/login" className="btn">Vai al login</a>
      </div>
    );
  }

  if (isAuth === null) {
    return null; // oppure uno spinner
  }

  return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
        Nuovo avvistamento
      </h1>
      <UploadForm onSubmit={handleSubmit} />
    </div>
  );
}
