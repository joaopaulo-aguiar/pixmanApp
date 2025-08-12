
"use client";

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirect to a default merchant page or show a landing page
    // For now, redirecting to a generic merchant slug for testing
    window.location.replace("/batel_grill");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900 mb-4">
          Pixman - Sistema de Cupons Digitais
        </h1>
        <p className="text-slate-600 mb-6">
          Redirecionando...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    </div>
  );
}
