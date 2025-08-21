"use client";
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { readonly children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToastById = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove dopo duration
    setTimeout(() => {
      removeToastById(id);
    }, toast.duration || 5000);
  }, [removeToastById]);

  const removeToast = useCallback((id: string) => {
    removeToastById(id);
  }, [removeToastById]);

  const contextValue = useMemo(() => ({
    addToast,
    removeToast
  }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { readonly toasts: Toast[]; readonly onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] space-y-2" style={{ top: "5rem" }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { readonly toast: Toast; readonly onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 150);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white border-l-green-700";
      case "error":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white border-l-red-700";
      case "warning":
        return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 border-l-yellow-600";
      case "info":
      default:
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-l-blue-700";
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
      default:
        return "ℹ";
    }
  };

  return (
    <div
      className={`
        ${getToastStyles()}
        min-w-[320px] max-w-md p-4 rounded-lg shadow-xl border-l-4
        transform transition-all duration-200 ease-in-out
        ${isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"}
        backdrop-blur-sm
      `}
      style={{
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)"
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-lg font-bold">{getIcon()}</span>
          <span className="font-medium text-sm leading-relaxed">{toast.message}</span>
        </div>
        <button
          onClick={handleRemove}
          className="ml-4 text-xl opacity-70 hover:opacity-100 transition-opacity hover:scale-110 transform"
          aria-label="Chiudi notifica"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
