import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { ProductReview } from "../../types/review";
import { useToast } from "../../context/ToastContext";
import RatingStars from "../../components/common/RatingStars";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Star, RefreshCw, Trash2, Calendar } from "lucide-react";

export default function AdminProductReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchProductReviews = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await adminApi.getProductReviews();
      if (res.success && res.data) {
        setReviews(res.data);
      } else {
        setErr(res.message || "Gagal mendapatkan ulasan produk.");
      }
    } catch (e: any) {
      console.error("Fetch prod reviews err", e);
      setErr(e.response?.data?.message || e.message || "Gagal terhubung dengan server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductReviews();
  }, []);

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Hapus ulasan produk fashion ini secara permanen dari sistem?")) return;
    try {
      const res = await adminApi.deleteProductReview(id);
      if (res.success) {
        showToast("Review produk pakaian berhasil dihapus.", "success");
        fetchProductReviews();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal menghapus review.", "error");
    }
  };

  return (
    <div className="p-6 font-sans bg-slate-950 text-slate-100 min-h-screen" id="admin-product-reviews-page">
      <div className="border-b border-slate-800 pb-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white uppercase flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-550 animate-pulse" />
            <span>Moderasi Ulasan Produk ({reviews.length})</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Mengawasi feedback kualitas jahitan, kecocokan bahan, penipisan stok, atau kurasi ulasan kasar.</p>
        </div>

        <button
          onClick={fetchProductReviews}
          className="p-2 border border-slate-800 rounded-xl hover:bg-slate-900 text-xs font-bold text-slate-300 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {err && <ErrorMessage message="Gagal Sinkronisasi Reviews." details={err} />}

      {loading ? (
        <LoadingSpinner message="Membuka database review fasyen..." />
      ) : reviews.length === 0 ? (
        <p className="text-center text-slate-500 italic py-10 bg-slate-900/40 rounded-xl border border-slate-800">
          Belum ada ulasan pakaian diletakkan pembeli.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2">
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

                <div className="mt-3 text-xs font-medium text-slate-250 leading-relaxed italic border-l-2 border-slate-800 pl-3.5 my-4">
                  "{rev.comment || "Bahan sangat halus, jahitan rapi."}"
                </div>
              </div>

              <div className="pt-4 border-t border-slate-850 mt-4 flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                <div>
                  <span className="text-white block font-extrabold">{rev.user?.name || "Customer Check"}</span>
                  <span className="text-slate-500 block leading-tight mt-0.5 font-mono">ID: {rev.userId}</span>
                </div>
                <div className="text-right">
                  <span className="text-violet-400 block font-bold truncate max-w-[120px]" title={rev.product?.name}>
                    {rev.product?.name || "Produk Pakaian"}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">ID: {rev.productId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
