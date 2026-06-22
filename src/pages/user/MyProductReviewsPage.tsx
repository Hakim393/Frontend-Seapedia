import React, { useEffect, useState } from "react";
import { reviewApi } from "../../api/reviewApi";
import { ProductReview } from "../../types/review";
import { formatCurrency } from "../../utils/formatCurrency";
import { useToast } from "../../context/ToastContext";
import RatingStars from "../../components/common/RatingStars";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import { Star, Trash2, ArrowLeft, RefreshCw } from "lucide-react";

export default function MyProductReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      setErrorDetails(null);
      const res = await reviewApi.getMyProductReviews();
      if (res.success) {
        setReviews(res.data ?? []);
      } else {
        setErrorDetails(res.message || "Gagal mengambil daftar ulasan produk.");
      }
    } catch (err: any) {
      console.warn("MyProductReviews query err", err);
      setErrorDetails(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Hapus ulasan produk fashion ini secara permanen?")) return;
    try {
      const res = await reviewApi.deleteProductReview(id);
      if (res.success) {
        showToast("Ulasan berhasil dihapus.", "success");
        fetchMyReviews();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal menghapus ulasan.", "error");
    }
  };

  return (
    <div className="p-6 font-sans bg-white min-h-screen" id="my-product-reviews-page">
      <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 uppercase flex items-center gap-2">
            <Star className="w-6 h-6 text-violet-600 fill-violet-100/40" />
            <span>Review Produk Saya</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">Saring atau bersihkan seluruh ulasan material pakaian yang pernah Anda beli.</p>
        </div>
        <button
          onClick={fetchMyReviews}
          className="flex items-center gap-1.5 p-2 px-3 border rounded-xl hover:bg-gray-50 text-xs font-bold text-gray-600 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {errorDetails && <ErrorMessage message="Gagal memuat ulasan." details={errorDetails} />}

      {loading ? (
        <LoadingSpinner message="Membuka riwayat review produk Anda..." />
      ) : reviews.length === 0 ? (
        <EmptyState
          title="Belum memiliki ulasan produk"
          description="Ulasan produk dapat dikirimkan langsung melompati kolom review produk di halaman detail item setelah status order selesai."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="border border-gray-150 rounded-2xl p-5 bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-violet-100 transition"
            >
              <div className="flex gap-4 items-start">
                <img
                  src={rev.product?.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=100"}
                  alt={rev.product?.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border flex-shrink-0"
                />
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 leading-tight">{rev.product?.name || "Premium Item"}</h3>
                  <p className="text-[10px] text-gray-450 mt-0.5">Merk: {rev.product?.store?.name || "Official K-Shop Store"}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <RatingStars rating={rev.rating} size={3.5} />
                    <span className="text-[10px] text-gray-400">Skor: {rev.rating}/5</span>
                  </div>
                  
                  <p className="text-xs text-gray-650 mt-2 italic font-sans leading-relaxed">
                    "{rev.comment || "Bahan sangat luar biasa!"}"
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteReview(rev.id)}
                className="flex items-center gap-1.5 p-2 px-3.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-transparent hover:border-rose-200 rounded-xl text-xs font-bold transition w-full sm:w-auto justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Ulasan</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
