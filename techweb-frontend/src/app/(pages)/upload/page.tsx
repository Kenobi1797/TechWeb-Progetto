"use client";
import UploadForm from "../../../components/UploadForm";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function UploadPage() {
  const router = useRouter();
  const checkedAuth = useRef(false);

  useEffect(() => {
    if (checkedAuth.current) return;
    checkedAuth.current = true;
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
      }
    }
  }, [router]);

  const handleSubmit = async (form: FormData) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/cats`,
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

  return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
        Nuovo avvistamento
      </h1>
      <UploadForm onSubmit={handleSubmit} />
    </div>
  );
}
