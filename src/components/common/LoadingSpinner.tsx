import React from "react";

export default function LoadingSpinner({ message = "Memuat data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full min-h-[200px]" id="loading-spinner">
      <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-3 text-xs text-gray-500 font-sans tracking-wide font-medium">{message}</p>
    </div>
  );
}
