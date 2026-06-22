import React from "react";
import { Link } from "react-router-dom";
import { Ghost, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-center" id="notfound-page">
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-full text-amber-500 mb-6">
        <Ghost className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Halaman Tidak Ditemukan (404)</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        Maaf, kami tidak dapat menemukan halaman yang Anda cari. Periksa kembali tautan yang dimasukkan.
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
