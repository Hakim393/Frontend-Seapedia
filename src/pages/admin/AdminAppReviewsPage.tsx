import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { AppReview } from "../../types/review";
import { useToast } from "../../context/ToastContext";
import RatingStars from "../../components/common/RatingStars";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { MessageSquareCode, RefreshCw, Trash2 } from "lucide-react";

export default function AdminAppReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchAppReviews = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await adminApi.getAppReviews();
      if (res.success && res.data) {
        setReviews(res.data);
      } else {
        setErr(res.message || "Gagal mendapatkan ulasan aplikasi.");
      }
    } catch (e: any) {
      console.error("Fetch app reviews err", e);
      setErr(e.response?.data?.message || e.message || "Koneksi terganggu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppReviews();
  }, []);

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Hapus ulasan aplikasi K-Shop ini secara permanen?")) return;
    try {
      const res = await adminApi.deleteAppReview(id);
      if (res.success) {
        showToast("Review aplikasi berhasil dihapus.", "success");
        fetchAppReviews();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal menghapus review.", "error");
    }
  };

  return (
    <div className="p-6 font-sans bg-slate-950 text-slate-100 min-h-screen" id="admin-app-reviews-page">
      <div className="border-b border-slate-800 pb-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white uppercase flex items-center gap-2">
            <MessageSquareCode className="w-5 h-5 text-violet-500" />
            <span>Moderasi Ulasan Aplikasi ({reviews.length})</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Mengawasi aspirasi pembeli tentang fungsionalitas keranjang belanja, checkout, atau kecepatan respon seller.</p>
        </div>

        <button
          onClick={fetchAppReviews}
          className="p-2 border border-slate-800 rounded-xl hover:bg-slate-900 text-xs font-bold text-slate-300 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {err && <ErrorMessage message="Gagal Sinkronisasi Reviews Aplikasi." details={err} />}

      {loading ? (
        <LoadingSpinner message="Membuka ulasan platform..." />
      ) : reviews.length === 0 ? (
        <p className="text-center text-slate-500 italic py-10 bg-slate-900/40 rounded-xl border border-slate-800">
          Belum ada ulasan sistem diletakkan komunitas.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2 animate-pulse">
                    <RatingStars rating={rev.rating} size={3.5} />
                    <span className="text-[10px] bg-slate-800 border px-1.5 py-0.5 rounded text-slate-400 border-slate-700 font-bold font-mono">
                      {rev.rating}/5
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-1.5 text-rose-400 hover:text-white bg-slate-950 hover:bg-rose-600 border border-slate-800 hover:border-transparent rounded-lg transition"
                    title="Hapus Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 text-xs font-medium text-slate-250 leading-relaxed italic border-l-2 border-slate-850 pl-3.5 my-4">
                  "{rev.comment || "Sangat memuaskan belor di butik ini."}"
                </div>
              </div>

              <div className="pt-4 border-t border-slate-850 mt-4 text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                <span className="text-white block font-extrabold">{rev.user?.name || "Customer Registered"}</span>
                <span className="text-slate-500 block leading-tight mt-0.5 font-mono">ID: {rev.userId}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
