import React from "react";
import { AlertCircle } from "lucide-react";

export default function ErrorMessage({
  message = "Koneksi ke backend belum tersedia. Pastikan API backend berjalan di VITE_API_BASE_URL.",
  details,
}: {
  message?: string;
  details?: string;
}) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 my-4 max-w-2xl mx-auto" id="error-message">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
        <div className="flex-grow">
          <h4 className="font-bold text-rose-800 text-sm">Terjadi Masalah Koneksi</h4>
          <p className="text-rose-700 text-xs mt-1 leading-relaxed">{message}</p>
          {details && (
            <p className="text-rose-500 font-mono text-[10px] mt-2 bg-rose-100/50 p-2 rounded border border-rose-150">
              {details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
