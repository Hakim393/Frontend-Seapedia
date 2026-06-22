import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-center" id="forbidden-page">
      <div className="bg-rose-50 border border-rose-100 p-4 rounded-full text-rose-600 mb-6 animate-bounce">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Akses Ditolak (403)</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        Maaf, akun Anda tidak memiliki izin untuk melihat halaman ini. Silakan kembali ke dashboard Anda.
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-bold py-2.5 px-5 rounded-lg shadow transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
