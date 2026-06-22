import React, { useEffect, useState } from "react";
import { reviewApi } from "../../api/reviewApi";
import { AppReview } from "../../types/review";
import { useToast } from "../../context/ToastContext";
import RatingStars from "../../components/common/RatingStars";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import { Star, Trash2, RefreshCw } from "lucide-react";

export default function MyApplicationReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      setErrorDetails(null);
      const res = await reviewApi.getMyAppReviews();
      if (res.success) {
        setReviews(res.data ?? []);
      } else {
        setErrorDetails(res.message || "Gagal mengambil daftar ulasan aplikasi.");
      }
    } catch (err: any) {
      console.warn("MyApplicationReviews query err", err);
      setErrorDetails(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Hapus ulasan aplikasi Anda?")) return;
    try {
      const res = await reviewApi.deleteAppReview(id);
      if (res.success) {
        showToast("Review aplikasi didelete.", "success");
        fetchMyReviews();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal menghapus review.", "error");
    }
  };

  return (
    <div className="p-6 font-sans bg-white min-h-screen" id="my-app-reviews-page">
      <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 uppercase flex items-center gap-2">
            <Star className="w-6 h-6 text-violet-600 fill-violet-100/40" />
            <span>Review Aplikasi Saya</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">Ulasan kegunaan sistem marketplace K-Shop SEAPEDIA yang Anda bagikan.</p>
        </div>
        <button
          onClick={fetchMyReviews}
          className="flex items-center gap-1.5 p-2 px-3 border rounded-xl hover:bg-gray-50 text-xs font-bold text-gray-600 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {errorDetails && <ErrorMessage message="Gagal memuat ulasan aplikasi." details={errorDetails} />}

      {loading ? (
        <LoadingSpinner message="Membuka masukan aplikasi Anda..." />
      ) : reviews.length === 0 ? (
        <EmptyState
          title="Belum menulis ulasan aplikasi"
          description="Ulasan aplikasi dapat diberikan secara langsung melompati kolom ulasan aplikasi di halaman detail review publik."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="border border-gray-150 rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between hover:border-violet-100 transition"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <RatingStars rating={rev.rating} size={3.5} />
                  <span className="text-[10px] text-gray-400">Skor: {rev.rating}/5</span>
                </div>
                <p className="text-xs text-gray-650 italic font-sans leading-relaxed">
                  "{rev.comment || "Platform yang luar biasa!"}"
                </p>
                <span className="block text-[10px] text-gray-400 mt-3 font-mono">
                  Dibuat: {new Date(rev.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>

              <div className="border-t border-gray-100/50 pt-4 mt-4 flex justify-end">
                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="flex items-center gap-1.5 p-1.5 px-3 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-transparent hover:border-rose-200 rounded-lg text-xs font-bold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
