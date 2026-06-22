import React from "react";
import { CopySlash } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onActionClick?: () => void;
  actionText?: string;
}

export default function EmptyState({
  title = "Tidak ada data ditemukan",
  description = "Maaf, kami tidak dapat menemukan item yang cocok.",
  onActionClick,
  actionText,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 max-w-md mx-auto my-6" id="empty-state">
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4 text-gray-400">
        <CopySlash className="w-8 h-8" />
      </div>
      <h3 className="font-bold text-gray-900 text-base tracking-tight">{title}</h3>
      <p className="text-gray-500 text-xs mt-1 max-w-xs">{description}</p>
      {onActionClick && actionText && (
        <button
          onClick={onActionClick}
          className="mt-4 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
